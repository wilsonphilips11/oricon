'use strict';

module.exports.info  = 'Template callback';

const contractID = 'product-contract';
const version = '1.0';

let bc, ctx, clientIdx;

const dummyProduct = {
	productName: "test",
	productPrice: 1000,
	productOrigin: "test",
	productReleaseDate: "test",
	productDescription: "test",
	productImageBase64: "test",
	keySize: 768
};

let i = 0;

module.exports.init = async function(blockchain, context) {
    bc = blockchain;
    ctx = context;
    clientIdx = context.clientIdx.toString();

    return Promise.resolve();
};

module.exports.run = function() {
    i++;
    const assetID = `${clientIdx}-${i}`;
    console.log(`Client ${clientIdx}: Creating asset ${assetID}`);

    dummyProduct['productCode'] = assetID;
    const dummyProductJSON = JSON.stringify(dummyProduct);

    const myArgs = {
        chaincodeFunction: 'createProduct',
        invokerIdentity: 'admin',
        chaincodeArguments: [dummyProductJSON]
    };

    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = async function() {
    while (i > 0) {
        try {
            const assetID = `${clientIdx}-${i}`;
            console.log(`Client ${clientIdx}: Deleting asset ${assetID}`);
            const myArgs = {
                chaincodeFunction: 'deleteProduct',
                invokerIdentity: 'admin',
                chaincodeArguments: [assetID]
            };
            await bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
            i--;
        } catch (error) {
            console.log(`Client ${clientIdx}: Smart Contract threw with error: ${error}` );
        }
    }
};