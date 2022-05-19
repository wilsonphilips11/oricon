'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx;

const dummyTokenRequest = {
    value: 1
};

module.exports.init = async function(blockchain, context) {
    bc = blockchain;
    ctx = context;

    return Promise.resolve();
};

module.exports.run = function() {
    const dummyTokenRequestJSON = JSON.stringify(dummyTokenRequest);
    const myArgs = {
        chaincodeFunction: 'mintToken',
        invokerIdentity: 'Admin@org1.example.com',
        chaincodeArguments: [dummyTokenRequestJSON]
    };
    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};