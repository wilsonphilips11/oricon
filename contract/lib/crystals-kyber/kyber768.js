
const { SHA3 } = require('sha3');
const { SHAKE } = require('sha3');

const nttZetas = [
    2285, 2571, 2970, 1812, 1493, 1422, 287, 202, 3158, 622, 1577, 182, 962,
    2127, 1855, 1468, 573, 2004, 264, 383, 2500, 1458, 1727, 3199, 2648, 1017,
    732, 608, 1787, 411, 3124, 1758, 1223, 652, 2777, 1015, 2036, 1491, 3047,
    1785, 516, 3321, 3009, 2663, 1711, 2167, 126, 1469, 2476, 3239, 3058, 830,
    107, 1908, 3082, 2378, 2931, 961, 1821, 2604, 448, 2264, 677, 2054, 2226,
    430, 555, 843, 2078, 871, 1550, 105, 422, 587, 177, 3094, 3038, 2869, 1574,
    1653, 3083, 778, 1159, 3182, 2552, 1483, 2727, 1119, 1739, 644, 2457, 349,
    418, 329, 3173, 3254, 817, 1097, 603, 610, 1322, 2044, 1864, 384, 2114, 3193,
    1218, 1994, 2455, 220, 2142, 1670, 2144, 1799, 2051, 794, 1819, 2475, 2459,
    478, 3221, 3021, 996, 991, 958, 1869, 1522, 1628];

const nttZetasInv = [
    1701, 1807, 1460, 2371, 2338, 2333, 308, 108, 2851, 870, 854, 1510, 2535,
    1278, 1530, 1185, 1659, 1187, 3109, 874, 1335, 2111, 136, 1215, 2945, 1465,
    1285, 2007, 2719, 2726, 2232, 2512, 75, 156, 3000, 2911, 2980, 872, 2685,
    1590, 2210, 602, 1846, 777, 147, 2170, 2551, 246, 1676, 1755, 460, 291, 235,
    3152, 2742, 2907, 3224, 1779, 2458, 1251, 2486, 2774, 2899, 1103, 1275, 2652,
    1065, 2881, 725, 1508, 2368, 398, 951, 247, 1421, 3222, 2499, 271, 90, 853,
    1860, 3203, 1162, 1618, 666, 320, 8, 2813, 1544, 282, 1838, 1293, 2314, 552,
    2677, 2106, 1571, 205, 2918, 1542, 2721, 2597, 2312, 681, 130, 1602, 1871,
    829, 2946, 3065, 1325, 2756, 1861, 1474, 1202, 2367, 3147, 1752, 2707, 171,
    3127, 3042, 1907, 1836, 1517, 359, 758, 1441];

const paramsKK512 = 2;
const paramsKK768 = 3;
const paramsKK1024 = 4;

const paramsN = 256;
const paramsQ = 3329;
const paramsQinv = 62209;
const paramsETA = 2;
const paramsSymBytes = 32;
const paramsPolyBytes = 384;
const paramsPolyvecBytesK512 = 2 * paramsPolyBytes;
const paramsPolyvecBytesK768 = 3 * paramsPolyBytes;
const paramsPolyvecBytesK1024 = 4 * paramsPolyBytes;
const paramsPolyCompressedBytesK512 = 96;
const paramsPolyCompressedBytesK768 = 128;
const paramsPolyCompressedBytesK1024 = 160;
const paramsPolyvecCompressedBytesK512 = 2 * 320;
const paramsPolyvecCompressedBytesK768 = 3 * 320;
const paramsPolyvecCompressedBytesK1024 = 4 * 352;
const paramsIndcpaPublicKeyBytesK512 = paramsPolyvecBytesK512 + paramsSymBytes;
const paramsIndcpaPublicKeyBytesK768 = paramsPolyvecBytesK768 + paramsSymBytes;
const paramsIndcpaPublicKeyBytesK1024 = paramsPolyvecBytesK1024 + paramsSymBytes;
const paramsIndcpaSecretKeyBytesK512 = 2 * paramsPolyBytes;
const paramsIndcpaSecretKeyBytesK768 = 3 * paramsPolyBytes;
const paramsIndcpaSecretKeyBytesK1024 = 4 * paramsPolyBytes;

// Kyber512SKBytes is a constant representing the byte length of private keys in Kyber-512.
const Kyber512SKBytes = paramsPolyvecBytesK512 + ((paramsPolyvecBytesK512 + paramsSymBytes) + 2*paramsSymBytes);
// Kyber768SKBytes is a constant representing the byte length of private keys in Kyber-768.
const Kyber768SKBytes = paramsPolyvecBytesK768 + ((paramsPolyvecBytesK768 + paramsSymBytes) + 2*paramsSymBytes);
// Kyber1024SKBytes is a constant representing the byte length of private keys in Kyber-1024.
const Kyber1024SKBytes = paramsPolyvecBytesK1024 + ((paramsPolyvecBytesK1024 + paramsSymBytes) + 2*paramsSymBytes);
// Kyber512PKBytes is a constant representing the byte length of public keys in Kyber-512.
const Kyber512PKBytes = paramsPolyvecBytesK512 + paramsSymBytes;
// Kyber768PKBytes is a constant representing the byte length of public keys in Kyber-768.
const Kyber768PKBytes = paramsPolyvecBytesK768 + paramsSymBytes;
// Kyber1024PKBytes is a constant representing the byte length of public keys in Kyber-1024.
const Kyber1024PKBytes = paramsPolyvecBytesK1024 + paramsSymBytes;
// Kyber512CTBytes is a constant representing the byte length of ciphertexts in Kyber-512.
const Kyber512CTBytes = paramsPolyvecCompressedBytesK512 + paramsPolyCompressedBytesK512;
// Kyber768CTBytes is a constant representing the byte length of ciphertexts in Kyber-768.
const Kyber768CTBytes = paramsPolyvecCompressedBytesK768 + paramsPolyCompressedBytesK768;
// Kyber1024CTBytes is a constant representing the byte length of ciphertexts in Kyber-1024.
const Kyber1024CTBytes = paramsPolyvecCompressedBytesK1024 + paramsPolyCompressedBytesK1024;
// KyberSSBytes is a constant representing the byte length of shared secrets in Kyber.
const KyberSSBytes = 32;

// Initial Value: Kyber-512
let paramsK = paramsKK512;
let paramsPolyvecBytes = paramsPolyvecBytesK512;
let paramsPolyCompressedBytes = paramsPolyCompressedBytesK512;
let paramsPolyvecCompressedBytes = paramsPolyvecCompressedBytesK512;
let paramsIndcpaPublicKeyBytes = paramsIndcpaPublicKeyBytesK512;
let paramsIndcpaSecretKeyBytes = paramsIndcpaSecretKeyBytesK512;
let KyberSKBytes = Kyber512SKBytes;
let KyberPKBytes = Kyber512PKBytes;
let KyberCTBytes = Kyber512CTBytes;

exports.changeParams = (newParams) => {
  console.log('function changeParams in Kyber768: ', newParams);
  if (newParams == 512) {
    paramsK = paramsKK512;
    paramsPolyvecBytes = paramsPolyvecBytesK512;
    paramsPolyCompressedBytes = paramsPolyCompressedBytesK512;
    paramsPolyvecCompressedBytes = paramsPolyvecCompressedBytesK512;
    paramsIndcpaPublicKeyBytes = paramsIndcpaPublicKeyBytesK512;
    paramsIndcpaSecretKeyBytes = paramsIndcpaSecretKeyBytesK512;
    KyberSKBytes = Kyber512SKBytes;
    KyberPKBytes = Kyber512PKBytes;
    KyberCTBytes = Kyber512CTBytes;
  } else if(newParams == 768) {
    paramsK = paramsKK768;
    paramsPolyvecBytes = paramsPolyvecBytesK768;
    paramsPolyCompressedBytes = paramsPolyCompressedBytesK768;
    paramsPolyvecCompressedBytes = paramsPolyvecCompressedBytesK768;
    paramsIndcpaPublicKeyBytes = paramsIndcpaPublicKeyBytesK768;
    paramsIndcpaSecretKeyBytes = paramsIndcpaSecretKeyBytesK768;
    KyberSKBytes = Kyber768SKBytes;
    KyberPKBytes = Kyber768PKBytes;
    KyberCTBytes = Kyber768CTBytes;
  } else if(newParams == 1024) {
    paramsK = paramsKK1024;
    paramsPolyvecBytes = paramsPolyvecBytesK1024;
    paramsPolyCompressedBytes = paramsPolyCompressedBytesK1024;
    paramsPolyvecCompressedBytes = paramsPolyvecCompressedBytesK1024;
    paramsIndcpaPublicKeyBytes = paramsIndcpaPublicKeyBytesK1024;
    paramsIndcpaSecretKeyBytes = paramsIndcpaSecretKeyBytesK1024;
    KyberSKBytes = Kyber1024SKBytes;
    KyberPKBytes = Kyber1024PKBytes;
    KyberCTBytes = Kyber1024CTBytes;
  }
}

// ----------------------------------------------------------------------------------------------
// From http://baagoe.com/en/RandomMusings/javascript/
// Johannes Baagøe <baagoe@baagoe.com>, 2010
// ----------------------------------------------------------------------------------------------
// From: https://github.com/FuKyuToTo/lattice-based-cryptography
// ----------------------------------------------------------------------------------------------
function Mash() {
    var n = 0xefc8249d;

    var mash = function (data) {
        data = data.toString();
        for (var i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
    mash.version = "Mash 0.9";
    return mash;
}
function Alea() {
    return (function (args) {
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var c = 1;

        if (args.length === 0) {
            args = [+new Date()];
        }
        var mash = Mash();
        s0 = mash(" ");
        s1 = mash(" ");
        s2 = mash(" ");

        for (var i = 0; i < args.length; i++) {
            s0 -= mash(args[i]);
            if (s0 < 0) {
                s0 += 1;
            }
            s1 -= mash(args[i]);
            if (s1 < 0) {
                s1 += 1;
            }
            s2 -= mash(args[i]);
            if (s2 < 0) {
                s2 += 1;
            }
        }
        mash = null;

        var random = function () {
            var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
            s0 = s1;
            s1 = s2;
            return (s2 = t - (c = t | 0));
        };
        random.uint32 = function () {
            return random() * 0x100000000; // 2^32
        };
        random.fract53 = function () {
            return random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16; // 2^-53
        };
        random.version = "Alea 0.9";
        random.args = args;
        return random;
    })(Array.prototype.slice.call(arguments));
}

//prng
var random = Alea();
var seed = random.args;
random = Alea(seed);

// Returns the next pseudorandom, uniformly distributed integer between 0(inclusive) and q-1(inclusive)
function nextInt(n) {
    return Math.floor(random() * n); //prng.js -> random()
}

function hexToDec(hexString) {
    return parseInt(hexString, 16);
}

// ----------------------------------------------------------------------------------------------
// Translated to javascript from: https://github.com/symbolicsoft/kyber-k2so
// ----------------------------------------------------------------------------------------------

exports.KeyGen = () => {
    var indcpakeys = indcpaKeypair(paramsK);

    var indcpaPublicKey = indcpakeys[0];
    var indcpaPrivateKey = indcpakeys[1];

    // get hash of indcpapublickey
    const buffer1 = Buffer.from(indcpaPublicKey);
    const hash1 = new SHA3(256);
    hash1.update(buffer1);
    var buf_str = hash1.digest('hex');
    // convert hex string to array
    var pkh = new Array(paramsSymBytes);
    for (i = 0; i < paramsSymBytes; i++) {
        pkh[i] = hexToDec(buf_str[2 * i] + buf_str[2 * i + 1]);
    }

    // read 32 random values (0-255) into a 32 byte array
    var rnd = new Array(paramsSymBytes);
    for (var i = 0; i < paramsSymBytes; i++) {
        rnd[i] = nextInt(paramsN);
    }

    var privateKey = indcpaPrivateKey;
    for (var i = 0; i < indcpaPublicKey.length; i++) {
        privateKey.push(indcpaPublicKey[i]);
    }
    for (var i = 0; i < pkh.length; i++) {
        privateKey.push(pkh[i]);
    }
    for (var i = 0; i < rnd.length; i++) {
        privateKey.push(rnd[i]);
    }

    var keys = new Array(2);
    keys[0] = indcpaPublicKey;
    keys[1] = privateKey;
    return keys;
}

exports.Encrypt = (pk) => {
    // generate (c, ss) from pk (pk is a 1184 byte array)
    // send c to server
    var publicKey = pk;

    // make 32 byte array
    var sharedSecret = new Array(paramsSymBytes);

    // make a 64 byte buffer array
    var buf = new Array(2*paramsSymBytes);

    // read 32 random values (0-255) into the 64 byte array
    for (var i = 0; i < paramsSymBytes; i++) {
        buf[i] = nextInt(paramsN);
    }

    // buf_tmp = buf[:32]
    var buf_tmp = buf.slice(0, paramsSymBytes);
    const buffer1 = Buffer.from(buf_tmp);

    // buf1 = sha3.sum256 of buf1
    const hash1 = new SHA3(256);
    hash1.update(buffer1);
    buf_tmp = hash1.digest('hex');
    // convert hex string to array
    var buf1 = new Array(paramsSymBytes);
    for (i = 0; i < paramsSymBytes; i++) {
        buf1[i] = hexToDec(buf_tmp[2 * i] + buf_tmp[2 * i + 1]);
    }

    // buf2 = sha3.sum256 of publicKey[0:1184]
    const buffer2 = Buffer.from(publicKey);
    const hash2 = new SHA3(256);
    hash2.update(buffer2);
    buf_tmp = hash2.digest('hex');
    // convert hex string to array
    var buf2 = new Array(paramsSymBytes);
    for (i = 0; i < paramsSymBytes; i++) {
        buf2[i] = hexToDec(buf_tmp[2 * i] + buf_tmp[2 * i + 1]);
    }

    // kr = sha3.sum512 of (buf1 + buf2) concatenate
    const buffer3 = Buffer.from(buf1);
    const buffer4 = Buffer.from(buf2);
    const hash3 = new SHA3(512);
    hash3.update(buffer3).update(buffer4);
    var kr_str = hash3.digest('hex');
    // convert hex string to array
    var kr = new Array(paramsSymBytes);
    for (i = 0; i < 2 * paramsSymBytes; i++) {
        kr[i] = hexToDec(kr_str[2 * i] + kr_str[2 * i + 1]);
    }
    var kr1 = kr.slice(0, paramsSymBytes);
    var kr2 = kr.slice(paramsSymBytes, 2 * paramsSymBytes);

    // c = indcpaEncrypt(buf1, publicKey, kr[32:], paramsK)
    var ciphertext = new Array(1088);
    ciphertext = indcpaEncrypt(buf1, publicKey, kr2, paramsK);

    // krc = sha3.Sum256(ciphertext)
    const buffer5 = Buffer.from(ciphertext);
    var krc = new Array(paramsSymBytes);
    const hash4 = new SHA3(256);
    hash4.update(buffer5);
    var krc_str = hash4.digest('hex');
    // convert hex string to array
    for (i = 0; i < paramsSymBytes; i++) {
        krc[i] = hexToDec(krc_str[2 * i] + krc_str[2 * i + 1]);
    }

    // sha3.ShakeSum256(sharedSecret, append(kr[:paramsSymBytes], krc[:]...))
    const buffer6 = Buffer.from(kr1);
    const buffer7 = Buffer.from(krc);
    const hash5 = new SHAKE(256);
    hash5.update(buffer6).update(buffer7);
    var ss_str = hash5.digest('hex');
    // convert hex string to array
    for (i = 0; i < paramsSymBytes; i++) {
        sharedSecret[i] = hexToDec(ss_str[2 * i] + ss_str[2 * i + 1]);
    }

    var result = new Array(2);
    result[0] = ciphertext;
    result[1] = sharedSecret;

    return result;
}

// Decrypts the ciphertext to obtain the shared secret (symmetric key)
exports.Decrypt = (c, sk) => {
    // c is the ciphertext (1088 bytes)
    // sk is the secret key (2400 bytes)
    var privateKey = sk;

    // make 32 byte array
    var sharedSecret = new Array(KyberSSBytes);

    var indcpaPrivateKey = sk.slice(0, paramsIndcpaSecretKeyBytes);

    var pki = paramsIndcpaSecretKeyBytes + paramsIndcpaPublicKeyBytes;

    var publicKey = sk.slice(paramsIndcpaSecretKeyBytes, pki);

    var buf = indcpaDecrypt(c, indcpaPrivateKey, paramsK);

    var ski = KyberSKBytes - 2 * paramsSymBytes;

    // kr = sha3.Sum512(append(buf, privateKey[ski:ski+paramsSymBytes]...))
    const buffer1 = Buffer.from(buf);
    const buffer2 = Buffer.from(privateKey.slice(ski, ski + paramsSymBytes));
    const hash1 = new SHA3(512);
    hash1.update(buffer1).update(buffer2);
    var kr_str = hash1.digest('hex');
    // convert hex string to array
    var kr = new Array(paramsSymBytes);
    for (i = 0; i < 2 * paramsSymBytes; i++) {
        kr[i] = hexToDec(kr_str[2 * i] + kr_str[2 * i + 1]);
    }

    var cmp = indcpaEncrypt(buf, publicKey, kr.slice(paramsSymBytes, 2 * paramsSymBytes), paramsK);

    var fail = byte(1 - ArrayCompare(c, cmp));

    // krh = sha3.Sum256(c);
    const buffer3 = Buffer.from(c);
    var krh = new Array(paramsSymBytes);
    const hash2 = new SHA3(256);
    hash2.update(buffer3);
    var krh_str = hash2.digest('hex');
    // convert hex string to array
    for (i = 0; i < paramsSymBytes; i++) {
        krh[i] = hexToDec(krh_str[2 * i] + krh_str[2 * i + 1]);
    }

    var skx;
    for (var i = 0; i < paramsSymBytes; i++) {
        skx = privateKey.slice(0, KyberSKBytes - paramsSymBytes + i);
        kr[i] = kr[i] ^ (fail & (kr[i] ^ skx[i]));
    }

    // sha3.ShakeSum256(sharedSecret, append(kr[:paramsSymBytes], krh[:]...))
    const buffer4 = Buffer.from(kr.slice(0, paramsSymBytes));
    const buffer5 = Buffer.from(krh);
    const hash3 = new SHAKE(256);
    hash3.update(buffer4).update(buffer5);
    var ss_str = hash3.digest('hex');
    // convert hex string to array
    for (i = 0; i < paramsSymBytes; i++) {
        sharedSecret[i] = hexToDec(ss_str[2 * i] + ss_str[2 * i + 1]);
    }

    var ss = sharedSecret;

    return ss;
}

// indcpaEncrypt is the encryption function of the CPA-secure
// public-key encryption scheme underlying Kyber.
function indcpaEncrypt(m, publicKey, coins, paramsK) {

    var ciphertext = new Array(1088);

    var sp = polyvecNew(paramsK);
    var ep = polyvecNew(paramsK);
    var bp = polyvecNew(paramsK);

    var result = indcpaUnpackPublicKey(publicKey, paramsK);

    var publicKeyPolyvec = result[0];
    var seed = result[1];

    var k = polyFromMsg(m);

    var at = indcpaGenMatrix(seed, true, paramsK);

    for (var i = 0; i < paramsK; i++) {
        sp[i] = polyGetNoise(coins, i);
        ep[i] = polyGetNoise(coins, i + paramsK);
    }

    var epp = polyGetNoise(coins, paramsK * 2);

    sp = polyvecNtt(sp, paramsK);

    sp = polyvecReduce(sp, paramsK);


    for (i = 0; i < paramsK; i++) {
        bp[i] = polyvecPointWiseAccMontgomery(at[i], sp, paramsK);
    }

    var v = polyvecPointWiseAccMontgomery(publicKeyPolyvec, sp, paramsK);

    bp = polyvecInvNttToMont(bp, paramsK);

    v = polyInvNttToMont(v);

    var bp1 = polyvecAdd(bp, ep, paramsK);

    v = polyAdd(polyAdd(v, epp), k);

    var bp3 = polyvecReduce(bp1, paramsK);

    ciphertext = indcpaPackCiphertext(bp3, polyReduce(v), paramsK);
    return ciphertext;
}

// indcpaDecrypt is the decryption function of the CPA-secure
// public-key encryption scheme underlying Kyber.
function indcpaDecrypt(c, privateKey, paramsK) {

    var result = indcpaUnpackCiphertext(c, paramsK);

    var bp = result[0];
    var v = result[1];

    var privateKeyPolyvec = indcpaUnpackPrivateKey(privateKey, paramsK);

    var bp2 = polyvecNtt(bp, paramsK);

    var mp = polyvecPointWiseAccMontgomery(privateKeyPolyvec, bp2, paramsK);

    var mp2 = polyInvNttToMont(mp);

    var mp3 = polySub(v, mp2);

    var mp4 = polyReduce(mp3);

    return polyToMsg(mp4);
}

// polyvecNew instantiates a new vector of polynomials.
function polyvecNew(paramsK) {
    // make array containing 3 elements of type poly
    var pv = new Array(paramsK);
    for (var i = 0; i < paramsK; i++) {
        pv[i] = new Array(384);
    }
    return pv;
}

// indcpaPackPublicKey serializes the public key as a concatenation of the
// serialized vector of polynomials of the public key, and the public seed
// used to generate the matrix `A`.
function indcpaPackPublicKey(publicKey, seed, paramsK) {
    var array = polyvecToBytes(publicKey, paramsK);
    for (var i = 0; i < seed.length; i++) {
        array.push(seed[i]);
    }
    return array;
}

// indcpaUnpackPublicKey de-serializes the public key from a byte array
// and represents the approximate inverse of indcpaPackPublicKey.
function indcpaUnpackPublicKey(packedPublicKey, paramsK) {
    var publicKeyPolyvec = polyvecFromBytes(packedPublicKey, paramsK);
    var seed = packedPublicKey.slice(paramsPolyvecBytes);

    // return values
    var result = new Array(2);
    result[0] = publicKeyPolyvec;
    result[1] = seed;
    return result;
}

// indcpaPackPrivateKey serializes the private key.
function indcpaPackPrivateKey(privateKey, paramsK) {
    return polyvecToBytes(privateKey, paramsK);
}

// indcpaUnpackPrivateKey de-serializes the private key and represents
// the inverse of indcpaPackPrivateKey.
function indcpaUnpackPrivateKey(packedPrivateKey, paramsK) {
    return polyvecFromBytes(packedPrivateKey, paramsK);
}

// polyvecToBytes serializes a vector of polynomials.
function polyvecToBytes(a, paramsK) {
    var r = [];
    var tmp = [];
    for (var i = 0; i < paramsK; i++) {
        tmp = polyToBytes(a[i]);
        for (var j = 0; j < tmp.length; j++) {
            r.push(tmp[j]);
        }
    }
    return r;
}

// polyvecFromBytes deserializes a vector of polynomials.
function polyvecFromBytes(a, paramsK) {
    var r = polyvecNew(paramsK);
    var start;
    var end;
    for (var i = 0; i < paramsK; i++) {
        start = (i * paramsPolyBytes);
        end = (i + 1) * paramsPolyBytes;
        r[i] = polyFromBytes(a.slice(start, end));
    }
    return r;
}

// polyToBytes serializes a polynomial into an array of bytes.
function polyToBytes(a) {
    var t0, t1;
    var r = new Array(paramsPolyBytes);
    var a2 = polyCSubQ(a);
    for (var i = 0; i < paramsN / 2; i++) {
        t0 = uint16(a2[2 * i]);
        t1 = uint16(a2[2 * i + 1]);
        r[3 * i + 0] = byte(t0 >> 0);
        r[3 * i + 1] = byte(t0 >> 8) | byte(t1 << 4);
        r[3 * i + 2] = byte(t1 >> 4);
    }
    return r;
}

// polyFromBytes de-serialises an array of bytes into a polynomial,
// and represents the inverse of polyToBytes.
function polyFromBytes(a) {
    var r = new Array(paramsPolyBytes).fill(0); // each element is int16 (0-65535)
    for (var i = 0; i < paramsN / 2; i++) {
        r[2 * i] = int16(((uint16(a[3 * i + 0]) >> 0) | (uint16(a[3 * i + 1]) << 8)) & 0xFFF);
        r[2 * i + 1] = int16(((uint16(a[3 * i + 1]) >> 4) | (uint16(a[3 * i + 2]) << 4)) & 0xFFF);
    }
    return r;
}

// polyToMsg converts a polynomial to a 32-byte message
// and represents the inverse of polyFromMsg.
function polyToMsg(a) {
    var msg = new Array(paramsSymBytes);
    var t;
    var a2 = polyCSubQ(a);
    for (var i = 0; i < paramsN / 8; i++) {
        msg[i] = 0;
        for (var j = 0; j < 8; j++) {
            t = (((uint16(a2[8 * i + j]) << 1) + uint16(paramsQ / 2)) / uint16(paramsQ)) & 1;
            msg[i] |= byte(t << j);
        }
    }
    return msg;
}

// polyFromMsg converts a 32-byte message to a polynomial.
function polyFromMsg(msg) {
    var r = new Array(paramsPolyBytes).fill(0); // each element is int16 (0-65535)
    var mask; // int16
    for (var i = 0; i < paramsN / 8; i++) {
        for (var j = 0; j < 8; j++) {
            mask = -1 * int16((msg[i] >> j) & 1);
            r[8 * i + j] = mask & int16((paramsQ + 1) / 2);
        }
    }
    return r;
}

// indcpaKeypair generates public and private keys for the CPA-secure
// public-key encryption scheme underlying Kyber.
function indcpaKeypair(paramsK) {

    var skpv = polyvecNew(paramsK);
    var pkpv = polyvecNew(paramsK);
    var e = polyvecNew(paramsK);

    // make a 64 byte buffer array
    var buf = new Array(2 * paramsSymBytes);

    // read 32 random values (0-255) into the 64 byte array
    for (var i = 0; i < paramsSymBytes; i++) {
        buf[i] = nextInt(256);
    }

    // take the first 32 bytes and hash it
    var buf_tmp = buf.slice(0, paramsSymBytes);
    const buffer1 = Buffer.from(buf_tmp);
    const hash1 = new SHA3(512);
    hash1.update(buffer1);
    var buf_str = hash1.digest('hex');
    // convert hex string to array
    var buf1 = new Array(2 * paramsSymBytes);
    for (i = 0; i < 2 * paramsSymBytes; i++) {
        buf1[i] = hexToDec(buf_str[2 * i] + buf_str[2 * i + 1]);
    }

    var publicSeed = buf1.slice(0, paramsSymBytes);
    var noiseSeed = buf1.slice(paramsSymBytes, 2 * paramsSymBytes);


    var a = indcpaGenMatrix(publicSeed, false, paramsK);

    var nonce = 0;
    for (var i = 0; i < paramsK; i++) {
        skpv[i] = polyGetNoise(noiseSeed, nonce);
        nonce = nonce + 1;
    }

    for (var i = 0; i < paramsK; i++) {
        e[i] = polyGetNoise(noiseSeed, nonce);
        nonce = nonce + 1;
    }

    var skpv = polyvecNtt(skpv, paramsK);
    var skpv = polyvecReduce(skpv, paramsK);
    var e = polyvecNtt(e, paramsK);

    for (var i = 0; i < paramsK; i++) {
        pkpv[i] = polyToMont(polyvecPointWiseAccMontgomery(a[i], skpv, paramsK));
    }

    pkpv = polyvecAdd(pkpv, e, paramsK);
    pkpv = polyvecReduce(pkpv, paramsK);

    var keys = new Array(2);
    keys[0] = indcpaPackPublicKey(pkpv, publicSeed, paramsK);
    keys[1] = indcpaPackPrivateKey(skpv, paramsK);

    return keys;
}

// indcpaGenMatrix deterministically generates a matrix `A` (or the transpose of `A`)
// from a seed. Entries of the matrix are polynomials that look uniformly random.
// Performs rejection sampling on the output of an extendable-output function (XOF).
function indcpaGenMatrix(seed, transposed, paramsK) {
    var r = new Array(paramsK);
    var buf = new Array(paramsK * 168);
    const xof = new SHAKE(128);
    var ctr = 0;
    var buflen, off;
    for (var i = 0; i < paramsK; i++) {

        r[i] = polyvecNew(paramsK);
        var transposon = new Array(2);

        for (var j = 0; j < paramsK; j++) {
            transposon[0] = j;
            transposon[1] = i;
            if (transposed) {
                transposon[0] = i;
                transposon[1] = j;
            }
            xof.reset();
            const buffer1 = Buffer.from(seed);
            const buffer2 = Buffer.from(transposon);
            xof.update(buffer1).update(buffer2);
            var buf_str = xof.digest({ buffer: Buffer.alloc(504), format: 'hex' });
            // convert hex string to array
            for (var n = 0; n < 504; n++) {
                buf[n] = hexToDec(buf_str[2 * n] + buf_str[2 * n + 1]);
            }

            buflen = paramsK * 168;
            var result = new Array(2);
            result = indcpaRejUniform(buf, buflen);
            r[i][j] = result[0];
            ctr = result[1];

            while (ctr < paramsN) {
                var bufn = buf.slice(0, 168);
                var result1 = new Array(2);
                result1 = indcpaRejUniform(bufn, 168);
                var missing = result1[0];
                var ctrn = result1[1];

                for (var k = ctr; k < paramsN - ctr; k++) {
                    r[i][j][k] = missing[paramsN - ctr + k];
                }
                ctr = ctr + ctrn;
            }
        }
    }
    return r;
}

// indcpaRejUniform runs rejection sampling on uniform random bytes
// to generate uniform random integers modulo `Q`.
function indcpaRejUniform(buf, bufl) {
    var r = new Array(paramsPolyBytes).fill(0); // each element is uint16 (0-65535)
    var val0, val1;
    var ctr = 0;
    var pos = 0;
    while (ctr < paramsN && pos + paramsK <= bufl) {

        val0 = (uint16((buf[pos + 0]) >> 0) | (uint16(buf[pos + 1]) << 8)) & 0xFFF;
        val1 = (uint16((buf[pos + 1]) >> 4) | (uint16(buf[pos + 2]) << 4)) & 0xFFF;
        pos = pos + paramsK;

        if (val0 < paramsQ) {
            r[ctr] = int16(val0);
            ctr = ctr + 1;
        }
        if (ctr < paramsN && val1 < paramsQ) {
            r[ctr] = int16(val1);
            ctr = ctr + 1;
        }
    }

    var result = new Array(2);
    result[0] = r;
    result[1] = ctr;
    return result;
}

// polyGetNoise samples a polynomial deterministically from a seed
// and nonce, with the output polynomial being close to a centered
// binomial distribution with parameter paramsETA = 2.
function polyGetNoise(seed, nonce) {
    var l = paramsETA * paramsN / 4;
    var p = indcpaPrf(l, seed, nonce);
    return byteopsCbd(p);
}

// indcpaPrf provides a pseudo-random function (PRF) which returns
// a byte array of length `l`, using the provided key and nonce
// to instantiate the PRF's underlying hash function.
function indcpaPrf(l, key, nonce) {
    var buf = new Array(l);
    var nonce_arr = new Array(1);
    nonce_arr[0] = nonce;
    const hash = new SHAKE(256);
    hash.reset();
    const buffer1 = Buffer.from(key);
    const buffer2 = Buffer.from(nonce_arr);
    hash.update(buffer1).update(buffer2);
    var hash_str = hash.digest({ buffer: Buffer.alloc(l), format: 'hex' });
    // convert hex string to array
    for (var n = 0; n < l; n++) {
        buf[n] = hexToDec(hash_str[2 * n] + hash_str[2 * n + 1]);
    }
    return buf;
}

// byteopsCbd computes a polynomial with coefficients distributed
// according to a centered binomial distribution with parameter paramsETA,
// given an array of uniformly random bytes.
function byteopsCbd(buf) {
    var t, d;
    var a, b;
    var r = new Array(paramsPolyBytes).fill(0); // each element is int16 (0-65535)
    for (var i = 0; i < paramsN / 8; i++) {
        t = (byteopsLoad32(buf.slice(4 * i, buf.length)) >>> 0);
        d = ((t & 0x55555555) >>> 0);
        d = (d + ((((t >> 1) >>> 0) & 0x55555555) >>> 0) >>> 0);
        for (var j = 0; j < 8; j++) {
            a = int16((((d >> (4 * j + 0)) >>> 0) & 0x3) >>> 0);
            b = int16((((d >> (4 * j + paramsETA)) >>> 0) & 0x3) >>> 0);
            r[8 * i + j] = a - b;
        }
    }
    return r;
}

// byteopsLoad32 returns a 32-bit unsigned integer loaded from byte x.
function byteopsLoad32(x) {
    var r;
    r = uint32(x[0]);
    r = (((r | (uint32(x[1]) << 8)) >>> 0) >>> 0);
    r = (((r | (uint32(x[2]) << 16)) >>> 0) >>> 0);
    r = (((r | (uint32(x[3]) << 24)) >>> 0) >>> 0);
    return uint32(r);
}

// polyvecNtt applies forward number-theoretic transforms (NTT)
// to all elements of a vector of polynomials.
function polyvecNtt(r, paramsK) {
    for (var i = 0; i < paramsK; i++) {
        r[i] = polyNtt(r[i]);
    }
    return r;
}

// polyNtt computes a negacyclic number-theoretic transform (NTT) of
// a polynomial in-place; the input is assumed to be in normal order,
// while the output is in bit-reversed order.
function polyNtt(r) {
    return ntt(r);
}

// ntt performs an inplace number-theoretic transform (NTT) in `Rq`.
// The input is in standard order, the output is in bit-reversed order.
function ntt(r) {
    var r3 = new Array(paramsPolyBytes);
    r3 = r;
    var j = 0;
    var k = 1;
    var zeta;
    var t;
    for (var l = 128; l >= 2; l >>= 1) {
        for (var start = 0; start < 256; start = j + l) {
            zeta = nttZetas[k];
            k = k + 1;
            for (j = start; j < start + l; j++) {
                t = nttFqMul(zeta, r3[j + l]);
                r3[j + l] = r3[j] - t;
                r3[j] = r3[j] + t;
            }
        }
    }
    var r1 = new Array(paramsPolyBytes);
    r1 = r3;
    return r1;
}

// nttFqMul performs multiplication followed by Montgomery reduction
// and returns a 16-bit integer congruent to `a*b*R^{-1} mod Q`.
function nttFqMul(a, b) {
    return byteopsMontgomeryReduce(a * b);
}

// byteopsMontgomeryReduce computes a Montgomery reduction; given
// a 32-bit integer `a`, returns `a * R^-1 mod Q` where `R=2^16`.
function byteopsMontgomeryReduce(a) {
    var u = int16(int32(a) * paramsQinv);
    var t = u * paramsQ;
    t = a - t;
    t >>= 16;
    return int16(t);
}

// polyvecReduce applies Barrett reduction to each coefficient of each element
// of a vector of polynomials.
function polyvecReduce(r, paramsK) {
    for (var i = 0; i < paramsK; i++) {
        r[i] = polyReduce(r[i]);
    }
    return r;
}

// polyReduce applies Barrett reduction to all coefficients of a polynomial.
function polyReduce(r) {
    for (var i = 0; i < paramsN; i++) {
        r[i] = byteopsBarrettReduce(r[i]);
    }
    return r;
}

// polyToMont performs the in-place conversion of all coefficients
// of a polynomial from the normal domain to the Montgomery domain.
function polyToMont(r) {
    // var f = int16(((uint64(1) << 32) >>> 0) % uint64(paramsQ));
    var f = 1353; // if paramsQ changes then this needs to be updated
    for (var i = 0; i < paramsN; i++) {
        r[i] = byteopsMontgomeryReduce(int32(r[i]) * int32(f));
    }
    return r;
}

// byteopsBarrettReduce computes a Barrett reduction; given
// a 16-bit integer `a`, returns a 16-bit integer congruent to
// `a mod Q` in {0,...,Q}.
function byteopsBarrettReduce(a) {
    var t;
    var v = int16(((1 << 26) + paramsQ / 2) / paramsQ);
    t = int16(int32(v) * int32(a) >> 26);
    t = t * paramsQ;
    return a - t;
}

// polyvecPointWiseAccMontgomery pointwise-multiplies elements of polynomial-vectors
// `a` and `b`, accumulates the results into `r`, and then multiplies by `2^-16`.
function polyvecPointWiseAccMontgomery(a, b, paramsK) {
    var r = polyBaseMulMontgomery(a[0], b[0]);
    var t;
    for (var i = 1; i < paramsK; i++) {
        t = polyBaseMulMontgomery(a[i], b[i]);
        r = polyAdd(r, t);
    }
    return polyReduce(r);
}

// polyBaseMulMontgomery performs the multiplication of two polynomials
// in the number-theoretic transform (NTT) domain.
function polyBaseMulMontgomery(a, b) {
    var rx, ry;
    for (var i = 0; i < paramsN / 4; i++) {
        rx = nttBaseMul(
            a[4 * i + 0], a[4 * i + 1],
            b[4 * i + 0], b[4 * i + 1],
            nttZetas[64 + i]
        );
        ry = nttBaseMul(
            a[4 * i + 2], a[4 * i + 3],
            b[4 * i + 2], b[4 * i + 3],
            -nttZetas[64 + i]
        );
        a[4 * i + 0] = rx[0];
        a[4 * i + 1] = rx[1];
        a[4 * i + 2] = ry[0];
        a[4 * i + 3] = ry[1];
    }
    return a;
}

// nttBaseMul performs the multiplication of polynomials
// in `Zq[X]/(X^2-zeta)`. Used for multiplication of elements
// in `Rq` in the number-theoretic transformation domain.
function nttBaseMul(a0, a1, b0, b1, zeta) {
    var r = new Array(2);
    r[0] = nttFqMul(a1, b1);
    r[0] = nttFqMul(r[0], zeta);
    r[0] = r[0] + nttFqMul(a0, b0);
    r[1] = nttFqMul(a0, b1);
    r[1] = r[1] + nttFqMul(a1, b0);
    return r;
}

// polyAdd adds two polynomials.
function polyAdd(a, b) {
    var c = new Array(paramsPolyBytes);
    for (var i = 0; i < paramsN; i++) {
        c[i] = a[i] + b[i];
    }
    return c;
}

// polyvecInvNttToMont applies the inverse number-theoretic transform (NTT)
// to all elements of a vector of polynomials and multiplies by Montgomery
// factor `2^16`.
function polyvecInvNttToMont(r, paramsK) {
    for (var i = 0; i < paramsK; i++) {
        r[i] = polyInvNttToMont(r[i]);
    }
    return r;
}

// polySub subtracts two polynomials.
function polySub(a, b) {
    for (var i = 0; i < paramsN; i++) {
        a[i] = a[i] - b[i];
    }
    return a;
}

// polyInvNttToMont computes the inverse of a negacyclic number-theoretic
// transform (NTT) of a polynomial in-place; the input is assumed to be in
// bit-reversed order, while the output is in normal order.
function polyInvNttToMont(r) {
    return nttInv(r);
}

// nttInv performs an inplace inverse number-theoretic transform (NTT)
// in `Rq` and multiplication by Montgomery factor 2^16.
// The input is in bit-reversed order, the output is in standard order.
function nttInv(r) {
    var j = 0;
    var k = 0;
    var zeta;
    var t;
    for (var l = 2; l <= 128; l <<= 1) {
        for (var start = 0; start < 256; start = j + l) {
            zeta = nttZetasInv[k];
            k = k + 1;
            for (j = start; j < start + l; j++) {
                t = r[j];
                r[j] = byteopsBarrettReduce(t + r[j + l]);
                r[j + l] = t - r[j + l];
                r[j + l] = nttFqMul(zeta, r[j + l]);
            }
        }
    }
    for (j = 0; j < 256; j++) {
        r[j] = nttFqMul(r[j], nttZetasInv[127]);
    }
    return r;
}

// polyvecAdd adds two vectors of polynomials.
function polyvecAdd(a, b, paramsK) {
    var c = new Array(paramsK);
    for (var i = 0; i < paramsK; i++) {
        c[i] = polyAdd(a[i], b[i]);
    }
    return c;
}

// indcpaPackCiphertext serializes the ciphertext as a concatenation of
// the compressed and serialized vector of polynomials `b` and the
// compressed and serialized polynomial `v`.
function indcpaPackCiphertext(b, v, paramsK) {
    var arr1 = polyvecCompress(b, paramsK);
    var arr2 = polyCompress(v, paramsK);
    return arr1.concat(arr2);
}

// indcpaUnpackCiphertext de-serializes and decompresses the ciphertext
// from a byte array, and represents the approximate inverse of
// indcpaPackCiphertext.
function indcpaUnpackCiphertext(c, paramsK) {
    var b = polyvecDecompress(c.slice(0, paramsPolyvecCompressedBytes), paramsK);
    var v = polyDecompress(c.slice(paramsPolyvecCompressedBytes), paramsK);
    var result = new Array(2);
    result[0] = b;
    result[1] = v;
    return result;
}

// polyvecCompress lossily compresses and serializes a vector of polynomials.
function polyvecCompress(a, paramsK) {

    a = polyvecCSubQ(a, paramsK);

    var rr = 0;

    var r = new Array(paramsPolyvecCompressedBytes);

    if (paramsK == 2 || paramsK == 3) {
      var t = new Array(4);
      for (var i = 0; i < paramsK; i++) {
        for (var j = 0; j < paramsN / 4; j++) {
          for (var k = 0; k < 4; k++) {
            t[k] = uint16((((a[i][4 * j + k] << 10) + paramsQ / 2) / paramsQ) & 0x3ff);
          }
          r[rr + 0] = byte(t[0] >> 0);
          r[rr + 1] = byte((t[0] >> 8) | (t[1] << 2));
          r[rr + 2] = byte((t[1] >> 6) | (t[2] << 4));
          r[rr + 3] = byte((t[2] >> 4) | (t[3] << 6));
          r[rr + 4] = byte((t[3] >> 2));
          rr = rr + 5;
        }
      }
      return r;
    } else if (paramsK == 4) {
      var t = new Array(8);
      for (var i = 0; i < paramsK; i++) {
        for (var j = 0; j < paramsN / 8; j++) {
          for (var k = 0; k < 8; k++) {
            t[k] = uint16((((a[i][8 * j + k] << 11) + paramsQ / 2) / paramsQ) & 0x7ff);
          }
          r[rr + 0] = byte(t[0] >> 0);
          r[rr + 1] = byte((t[0] >> 8) | (t[1] << 3));
          r[rr + 2] = byte((t[1] >> 5) | (t[2] << 6));
          r[rr + 3] = byte((t[2] >> 2));
          r[rr + 4] = byte((t[2] >> 10) | (t[3] << 1));
          r[rr + 5] = byte((t[3] >> 7) | (t[4] << 4));
          r[rr + 6] = byte((t[4] >> 4) | (t[5] << 7));
          r[rr + 7] = byte((t[5] >> 1));
          r[rr + 8] = byte((t[5] >> 9) | (t[6] << 2));
          r[rr + 9] = byte((t[6] >> 6) | (t[7] << 5));
          r[rr + 10] = byte((t[7] >> 3));
          rr = rr + 11;
        }
      }
      return r;
    }
}

// polyvecDecompress de-serializes and decompresses a vector of polynomials and
// represents the approximate inverse of polyvecCompress. Since compression is lossy,
// the results of decompression will may not match the original vector of polynomials.
function polyvecDecompress(a, paramsK) {
    var r = polyvecNew(paramsK);
    var aa = 0;
    if (paramsK == 2 || paramsK == 3) {
      var t = new Array(4);
      for (var i = 0; i < paramsK; i++) {
        for (var j = 0; j < paramsN / 4; j++) {
          t[0] = (uint16(a[aa + 0]) >> 0) | (uint16(a[aa + 1]) << 8);
          t[1] = (uint16(a[aa + 1]) >> 2) | (uint16(a[aa + 2]) << 6);
          t[2] = (uint16(a[aa + 2]) >> 4) | (uint16(a[aa + 3]) << 4);
          t[3] = (uint16(a[aa + 3]) >> 6) | (uint16(a[aa + 4]) << 2);
          aa = aa + 5;
          for (var k = 0; k < 4; k++) {
            r[i][4 * j + k] = int16((((uint32(t[k] & 0x3FF) >>> 0) * (uint32(paramsQ) >>> 0) >>> 0) + 512) >> 10 >>> 0);
          }
        }
      }
    } else if(paramsK == 4) {
      var t = new Array(8);
      for (var i = 0; i < paramsK; i++) {
        for (var j = 0; j < paramsN / 8; j++) {
          t[0] = (uint16(a[aa + 0]) >> 0) | (uint16(a[aa + 1]) << 8);
          t[1] = (uint16(a[aa + 1]) >> 3) | (uint16(a[aa + 2]) << 5);
          t[2] = (uint16(a[aa + 2]) >> 6) | (uint16(a[aa + 3]) << 2) | (uint16(a[aa+4]) << 10);
          t[3] = (uint16(a[aa + 4]) >> 1) | (uint16(a[aa + 5]) << 7);
          t[4] = (uint16(a[aa + 5]) >> 4) | (uint16(a[aa + 6]) << 4);
          t[5] = (uint16(a[aa + 6]) >> 7) | (uint16(a[aa + 7]) << 1) | (uint16(a[aa+8]) << 9);
          t[6] = (uint16(a[aa + 8]) >> 2) | (uint16(a[aa + 9]) << 6);
          t[7] = (uint16(a[aa + 9]) >> 5) | (uint16(a[aa + 10]) << 3);
          aa = aa + 11;
          for (var k = 0; k < 8; k++) {
            r[i][8 * j + k] = int16((((uint32(t[k] & 0x7FF) >>> 0) * (uint32(paramsQ) >>> 0) >>> 0) + 1024) >> 11 >>> 0);
          }
        }
      }
    }

    return r;
}

// polyvecCSubQ applies the conditional subtraction of `Q` to each coefficient
// of each element of a vector of polynomials.
function polyvecCSubQ(r, paramsK) {
    for (var i = 0; i < paramsK; i++) {
        r[i] = polyCSubQ(r[i]);
    }
    return r;
}

// polyCSubQ applies the conditional subtraction of `Q` to each coefficient
// of a polynomial.
function polyCSubQ(r) {
    for (var i = 0; i < paramsN; i++) {
        r[i] = byteopsCSubQ(r[i]);
    }
    return r;
}

// polyCompress lossily compresses and subsequently serializes a polynomial.
function polyCompress(a, paramsK) {
    var t = new Array(8);
    a = polyCSubQ(a);
    var rr = 0;
    var r = new Array(paramsPolyCompressedBytes);

    if (paramsK == 2) {
      for (var i = 0; i < paramsN / 8; i++) {
        for (var j = 0; j < 8; j++) {
          t[j] = byte(((a[8 * i + j] << 3) + paramsQ / 2) / paramsQ) & 7;
        }
        r[rr + 0] = (t[0] >> 0) | (t[1] << 3) | (t[2] << 6);
        r[rr + 1] = (t[2] >> 2) | (t[3] << 1) | (t[4] << 4) | (t[5] << 7);
        r[rr + 2] = (t[5] >> 1) | (t[6] << 2) | (t[7] << 5);
        rr = rr + 3;
      }
      return r;
    } else if(paramsK == 3) {
      for (var i = 0; i < paramsN / 8; i++) {
        for (var j = 0; j < 8; j++) {
          t[j] = byte(((a[8 * i + j] << 4) + paramsQ / 2) / paramsQ) & 15;
        }
        r[rr + 0] = t[0] | (t[1] << 4);
        r[rr + 1] = t[2] | (t[3] << 4);
        r[rr + 2] = t[4] | (t[5] << 4);
        r[rr + 3] = t[6] | (t[7] << 4);
        rr = rr + 4;
      }
      return r;
    } else if(paramsK == 4) {
      for (var i = 0; i < paramsN / 8; i++) {
        for (var j = 0; j < 8; j++) {
          t[j] = byte(((a[8 * i + j] << 5) + paramsQ / 2) / paramsQ) & 31;
        }
        r[rr + 0] = (t[0] >> 0) | (t[1] << 5)
        r[rr + 1] = (t[1] >> 3) | (t[2] << 2) | (t[3] << 7)
        r[rr + 2] = (t[3] >> 1) | (t[4] << 4)
        r[rr + 3] = (t[4] >> 4) | (t[5] << 1) | (t[6] << 6)
        r[rr + 4] = (t[6] >> 2) | (t[7] << 3)
        rr = rr + 5
      }
      return r;
    }
}

// polyDecompress de-serializes and subsequently decompresses a polynomial,
// representing the approximate inverse of polyCompress.
// Note that compression is lossy, and thus decompression will not match the
// original input.
function polyDecompress(a, paramsK) {
    var r = new Array(paramsPolyBytes);
    var t = new Array(8);
    var aa = 0;

    if (paramsK == 2) {
      for (var i = 0; i < paramsN / 8; i++) {
        t[0] = (a[aa + 0] >> 0)
        t[1] = (a[aa + 0] >> 3)
        t[2] = (a[aa + 0] >> 6) | (a[aa + 1] << 2)
        t[3] = (a[aa + 1] >> 1)
        t[4] = (a[aa + 1] >> 4)
        t[5] = (a[aa + 1] >> 7) | (a[aa + 2] << 1)
        t[6] = (a[aa + 2] >> 2)
        t[7] = (a[aa + 2] >> 5)
        aa = aa + 3
        for (var j = 0; j < 8; j++) {
          r[8 * i + j] = int16(((uint32(t[j] & 7) * uint32(paramsQ)) + 4) >> 3)
        }
      }
    } else if (paramsK == 3) {
      for (var i = 0; i < paramsN / 2; i++) {
        r[2 * i + 0] = int16(((uint16(a[aa] & 15) * uint16(paramsQ)) + 8) >> 4);
        r[2 * i + 1] = int16(((uint16(a[aa] >> 4) * uint16(paramsQ)) + 8) >> 4);
        aa = aa + 1;
      }
    } else if (paramsK == 4) {
      for (var i = 0; i < paramsN / 8; i++) {
        t[0] = (a[aa + 0] >> 0)
        t[1] = (a[aa + 0] >> 5) | (a[aa + 1] << 3)
        t[2] = (a[aa + 1] >> 2)
        t[3] = (a[aa + 1] >> 7) | (a[aa + 2] << 1)
        t[4] = (a[aa + 2] >> 4) | (a[aa + 3] << 4)
        t[5] = (a[aa + 3] >> 1)
        t[6] = (a[aa + 3] >> 6) | (a[aa + 4] << 2)
        t[7] = (a[aa + 4] >> 3)
        aa = aa + 5
        for (var j = 0; j < 8; j++) {
          r[8 * i + j] = int16(((uint32(t[j] & 31) * uint32(paramsQ)) + 16) >> 5)
        }
      }
    }
    return r;
}

// byteopsCSubQ conditionally subtracts Q from a.
function byteopsCSubQ(a) {
    a = a - int16(paramsQ);
    a = a + ((a >> 15) & int16(paramsQ));
    return a;
}

function byte(n) {
    n = n % 256;
    return n;
}

/*
// commented out because not needed, just here for reference
function int8(n){
    var end = -128;
    var start = 127;

    if( n >= end && n <= start){
        return n;
    }
    if( n < end){
        n = n+129;
        n = n%256;
        n = start + n;
        return n;
    }
    if( n > start){
        n = n-128;
        n = n%256;
        n = end + n;
        return n;
    }
}

function uint8(n){
    n = n%256;
    return n;
}
*/

function int16(n) {
    var end = -32768;
    var start = 32767;

    if (n >= end && n <= start) {
        return n;
    }
    if (n < end) {
        n = n + 32769;
        n = n % 65536;
        n = start + n;
        return n;
    }
    if (n > start) {
        n = n - 32768;
        n = n % 65536;
        n = end + n;
        return n;
    }
}

function uint16(n) {
    n = n % 65536;
    return n;
}


function int32(n) {
    var end = -2147483648;
    var start = 2147483647;

    if (n >= end && n <= start) {
        return n;
    }
    if (n < end) {
        n = n + 2147483649;
        n = n % 4294967296;
        n = start + n;
        return n;
    }
    if (n > start) {
        n = n - 2147483648;
        n = n % 4294967296;
        n = end + n;
        return n;
    }
}

// any bit operations to be done in uint32 must have >>> 0
// javascript calculates bitwise in SIGNED 32 bit so you need to convert
function uint32(n) {
    n = n % 4294967296;
    return n;
}

// compares two arrays and returns 1 if they are the same or 0 if not
function ArrayCompare(a, b) {
    // check array lengths
    if (a.length != b.length) {
        return 0;
    }
    // check contents
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return 0;
        }
    }
    return 1;
}