'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx, clientIdx, owner, identity;

module.exports.init = async function(blockchain, context) {
    bc = blockchain;
    ctx = context;
    clientIdx = context.clientIdx.toString();

    return Promise.resolve();
};

module.exports.run = function() {
    if (clientIdx === '0') {
        owner = 'admin';
        identity = 'Admin@org1.example.com';
    } else {
        owner = 'Admin@org1.example.com';
        identity = 'admin';
    }
    console.log(`Client ${clientIdx}: Transfer from token ${identity} through ${owner}`);
    const dummyTokenRequest = {
        owner: owner,
        spender: 'testing',
        value: 1
    };
    const dummyTokenRequestJSON = JSON.stringify(dummyTokenRequest);
    const myArgs = {
        chaincodeFunction: 'transferFromToken',
        invokerIdentity: identity,
        chaincodeArguments: [dummyTokenRequestJSON]
    };
    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};