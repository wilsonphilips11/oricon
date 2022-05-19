'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx, clientArgs, clientIdx;

let i;

const dummyProduct = {
	productName: "test",
	productPrice: 1000,
	productOrigin: "test",
	productReleaseDate: "test",
	productDescription: "test",
	productImageBase64: "test",
	keySize: 768
};

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    ctx = context;
    clientArgs = args;
    clientIdx = context.clientIdx.toString();
    for (i=0; i<clientArgs.assets; i++) {
        try {
            const assetID = `${clientIdx}-${i}`;
            console.log(`Client ${clientIdx}: Creating asset ${assetID}`);

            dummyProduct['productCode'] = assetID;
            const dummyProductJSON = JSON.stringify(dummyProduct);

            const myArgs = {
                chaincodeFunction: 'createProduct',
                invokerIdentity: 'admin',
                chaincodeArguments: [dummyProductJSON]
            };
            await bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
        } catch (error) {
            console.log(`Client ${clientIdx}: Smart Contract threw with error: ${error}` );
        }
    }
};

module.exports.run = function() {
    i--;
    const assetID = `${clientIdx}-${i}`;
    console.log(`Client ${clientIdx}: Deleting asset ${assetID}`);
    const myArgs = {
        chaincodeFunction: 'deleteProduct',
        invokerIdentity: 'admin',
        chaincodeArguments: [assetID]
    };

    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};