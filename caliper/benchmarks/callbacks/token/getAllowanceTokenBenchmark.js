'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx, clientIdx, identity;

module.exports.init = async function(blockchain, context) {
    bc = blockchain;
    ctx = context;
    clientIdx = context.clientIdx.toString();

    return Promise.resolve();
};

module.exports.run = function() {
    if (clientIdx === '0') {
        identity = 'Admin@org1.example.com';
    } else {
        identity = 'admin';
    }
    console.log(`Client ${clientIdx}: Getting allowance token ${identity}`);
    const myArgs = {
        chaincodeFunction: 'getAllowanceToken',
        invokerIdentity: identity,
        chaincodeArguments: []
    };
    return bc.bcObj.querySmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};