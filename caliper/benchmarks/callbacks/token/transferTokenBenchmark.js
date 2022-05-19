'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx, clientIdx, receiver, identity;

module.exports.init = async function(blockchain, context) {
    bc = blockchain;
    ctx = context;
    clientIdx = context.clientIdx.toString();

    return Promise.resolve();
};

module.exports.run = function() {
    if (clientIdx === '0') {
        receiver = 'admin';
        identity = 'Admin@org1.example.com';
    } else {
        receiver = 'Admin@org1.example.com';
        identity = 'admin';
    }
    console.log(`Client ${clientIdx}: Transfer token to ${identity} to ${receiver}`);
    const dummyTokenRequest = {
        receiver: receiver,
        value: 1
    };
    const dummyTokenRequestJSON = JSON.stringify(dummyTokenRequest);
    const myArgs = {
        chaincodeFunction: 'transferToken',
        invokerIdentity: identity,
        chaincodeArguments: [dummyTokenRequestJSON]
    };
    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};