'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx, clientIdx, spender, identity;

module.exports.init = async function(blockchain, context) {
    bc = blockchain;
    ctx = context;
    clientIdx = context.clientIdx.toString();

    return Promise.resolve();
};

module.exports.run = function() {
    if (clientIdx === '0') {
        spender = 'admin';
        identity = 'Admin@org1.example.com';
    } else {
        spender = 'Admin@org1.example.com';
        identity = 'admin';
    }
    console.log(`Client ${clientIdx}: Approve token ${identity} for ${spender}`);
    const dummyTokenRequest = {
        spender: spender,
        value: 1000
    };
    const dummyTokenRequestJSON = JSON.stringify(dummyTokenRequest);
    const myArgs = {
        chaincodeFunction: 'approveToken',
        invokerIdentity: identity,
        chaincodeArguments: [dummyTokenRequestJSON]
    };
    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};