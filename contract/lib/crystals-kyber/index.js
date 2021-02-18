const {KeyGen768, Encrypt768, Decrypt768} = require("./kyber768");

exports.K768_KeyGen = () => {
    var pk_sk = KeyGen768();
    return pk_sk;
}

exports.K768_Encrypt = (pk) => {
    var c_ss = Encrypt768(pk);
    return c_ss;
}

exports.K768_Decrypt = (c,sk) => {
    var ss = Decrypt768(c,sk);
    return ss;
}