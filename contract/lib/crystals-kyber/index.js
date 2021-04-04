const {KeyGen, Encrypt, Decrypt, changeParams} = require("./kyber768");

exports.Kyber_KeyGen = (newParams) => {
    changeParams(newParams);
    var pk_sk = KeyGen();
    return pk_sk;
}

exports.Kyber_Encrypt = (pk, newParams) => {
    changeParams(newParams);

    var c_ss = Encrypt(pk);
    return c_ss;
}

exports.Kyber_Decrypt = (c,sk, newParams) => {
    changeParams(newParams);
    
    var ss = Decrypt(c,sk);
    return ss;
}
