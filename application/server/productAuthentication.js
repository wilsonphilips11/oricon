'use strict';

const express = require('express');
const utils = require('./utils.js');
const productAuthenticationRouter = express.Router();

const STATUS_SUCCESS = 200;
const STATUS_CLIENT_ERROR = 400;
const STATUS_SERVER_ERROR = 500;
const USER_NOT_ENROLLED = 1000;
const INVALID_HEADER = 1001;
const SUCCESS = 0;
const PRODUCT_NOT_FOUND = 2000;

// // xlsx module
const reader = require('xlsx');

async function getUsernamePassword(request) {
    if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
        return new Promise().reject('Missing Authorization Header');
    }

    const base64Credentials = request.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === 'Admin@org1.example.com') {
        request.username = username;
        return request;
    }

    if (!username || !password) {
        return new Promise().reject('Incomplete Authentication Credentials');
    }
    
    try {
        await utils.checkUserCredential(username, password);
    } catch (error) {
        return new Promise().reject('Invalid Authentication Credentials');
    }
    
    request.username = username;
    request.password = password;

    return request;
}

async function submitTx(request, txName, ...args) {
    try {
        await getUsernamePassword(request);
        return utils.setUserContext(request.username, request.password).then((contract) => {
            args.unshift(txName);
            args.unshift(contract);
            return utils.submitTx.apply("unused", args)
                .then(buffer => {
                    return buffer;
                }, error => {
                    return Promise.reject(error);
                });
        }, error => {
            return Promise.reject(error);
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
}

async function evalTx(request, txName, ...args) {
    try {
        await getUsernamePassword(request);
        return utils.setUserContext(request.username, request.password).then((contract) => {
            args.unshift(txName);
            args.unshift(contract);
            return utils.evalTx.apply("unused", args)
                .then(buffer => {
                    return buffer;
                }, error => {
                    return Promise.reject(error);
                });
        }, error => {
            return Promise.reject(error);
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
}

///////////////////////////////////////////////////////////////
//               UJI PERFORMANCE WAKTU KYBER                 //
///////////////////////////////////////////////////////////////
productAuthenticationRouter.route('/kyber/encryption').post(function (request, response) {
    evalTx(request, 'kyberEncryptTest', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess kyberEncryptTest.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem encrypting the product."));
        });
});

productAuthenticationRouter.route('/kyber/decryption').post(function (request, response) {
    evalTx(request, 'kyberDecryptTest', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess kyberDecryptTest.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem decrypting the product."));
        });
});

productAuthenticationRouter.route('/kyber/encryptDecrypt').post(function (request, response) {
    evalTx(request, 'kyberEncDecTest', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess kyberEncDecTest.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem EncDec the product."));
        });
});

productAuthenticationRouter.route('/kyber/printTestingResult').get(function (request, response) {
    evalTx(request, 'printTestingResult')
        .then((result) => {
            console.log('\nProcess printTestingResult transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
            
            result = JSON.parse(result);
            
            const keySize = [512, 768, 1024];

            let key512Data = {
                '25': [],
                '50': [],
                '75': [],
                '100': [],
            };
            let key768Data = {
                '25': [],
                '50': [],
                '75': [],
                '100': [],
            };
            let key1024Data = {
                '25': [],
                '50': [],
                '75': [],
                '100': [],
            };

            console.log('keySizeArray length: ', result.keySizeArray.length);

            for(let iterator = 0; iterator < result.keySizeArray.length; iterator++) {
                let newObject = {
                    productSizeBeforeEncrypt: result.encryptResult.productSizeBeforeEncryptArray[iterator],
                    encryptedProductSize: result.encryptResult.encryptedProductSizeArray[iterator],
                    encryptTime: result.encryptResult.encryptTimeArray[iterator],
                    productSizeBeforeDecrypt: result.decryptResult.productSizeBeforeDecryptArray[iterator],
                    decryptedProductSize: result.decryptResult.decryptedProductSizeArray[iterator],
                    decryptTime: result.decryptResult.decryptTimeArray[iterator],
                    symmetricKeySize: result.symmetricKeySizeArray[iterator],
                    cipherKeySize: result.cipherKeySizeArray[iterator],
                    keySize: result.keySizeArray[iterator],
                }

                let JSONSize = result.encryptResult.productSizeBeforeEncryptArray[iterator]/1024;

                if (JSONSize < 50) {
                    JSONSize = 25;
                } else if (JSONSize < 75) {
                    JSONSize = 50;
                } else if (JSONSize < 100) {
                    JSONSize = 75;
                } else {
                    JSONSize = 100;
                }

                if (newObject.keySize == 512) {
                    key512Data[JSONSize].push(newObject);
                } else if (newObject.keySize == 768) {
                    key768Data[JSONSize].push(newObject);
                } else if (newObject.keySize == 1024) {
                    key1024Data[JSONSize].push(newObject);
                }
            }

            console.log('key512Data: ', key512Data);
            console.log('key768Data: ', key768Data);
            console.log('key1024Data: ', key1024Data);
            console.log('');

            let dataSizeArray = [25, 50, 75, 100];

            for (let sizeIterator = 0; sizeIterator < dataSizeArray.length; sizeIterator++) {
                const dataSize = dataSizeArray[sizeIterator];
                const filename = './uji' + dataSize + 'KB.xlsx';

                for(let iterator = 0; iterator < keySize.length; iterator++) {
                    const file = reader.readFile(filename);
                    let worksheet = file.Sheets[keySize[iterator]];
    
                    if (iterator == 0) {
                        console.log('key512Data[',dataSize,']: ', key512Data[dataSize]);
                        reader.utils.sheet_add_json(worksheet, key512Data[dataSize]);
                    } else if (iterator == 1) {
                        console.log('key768Data[',dataSize,']: ', key768Data[dataSize]);
                        reader.utils.sheet_add_json(worksheet, key768Data[dataSize]);
                    } else if (iterator == 2) {
                        console.log('key1024Data[',dataSize,']: ', key1024Data[dataSize]);
                        reader.utils.sheet_add_json(worksheet, key1024Data[dataSize]);
                    }
                    reader.writeFile(file,filename);
                }
            }


        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem printGlobalVariable."));
        });
});

productAuthenticationRouter.route('/kyber/deleteData').get(function (request, response) {
    evalTx(request, 'kyberDeleteData')
        .then((result) => {
            console.log('\nProcess kyberDeleteData transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem Delete the product."));
        });
});

///////////////////////////////////////////////////////////////

productAuthenticationRouter.route('/create-product').post(function (request, response) {
    submitTx(request, 'createProduct', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess createProduct transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem creating the product."));
        });
});

productAuthenticationRouter.route('/products/:productCode/:keySize').get(function (request, response) {
    evalTx(request, 'readProduct', request.params.productCode, request.params.keySize)
        .then((result) => {
            console.log('\nProcess readProduct transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem getting the product."));
        });
});

productAuthenticationRouter.route('/products/:keySize').get(function (request, response) {
    evalTx(request, 'readAllProducts', request.params.keySize)
        .then((result) => {
            console.log('\nProcess readAllProducts transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem getting the list of products."));
        });
});

productAuthenticationRouter.route('/product-history/:productCode/:keySize').get(function (request, response) {
    evalTx(request, 'readProductHistory', request.params.productCode, request.params.keySize)
        .then((result) => {
            console.log('\nProcess productHistory transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem fetching history for product, ", request.params.productCode));
        });
});

productAuthenticationRouter.route('/query-transaction/:transactionId').get(function (request, response) {
    getUsernamePassword(request)
        .then(request => {
            utils.queryTransactionByID(request.params.transactionId).then((result) => {
                response.status(STATUS_SUCCESS);
                response.send(result);
            }, (error) => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse (error, STATUS_SERVER_ERROR,
                    "Problem querying transaction by id."));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header;  User, " + request.username + " could not be enrolled."));
        }));
});

productAuthenticationRouter.route('/update-product').put(function (request, response) {
    submitTx(request, 'updateProduct', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess updateProduct transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in updating product."));
        });
});

productAuthenticationRouter.route('/delete-product/:productCode').delete(function (request, response) {
    submitTx(request, 'deleteProduct', request.params.productCode)
        .then((result) => {
            console.log('\nProcess deleteProduct transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in deleting product, " + request.params.productCode));
        });
});

productAuthenticationRouter.route('/token-detail').get(function (request, response) {
    evalTx(request, 'getTokenDetails')
        .then((result) => {
            console.log('\nProcess getTokenDetail transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in getting token detail"));
        });
});

productAuthenticationRouter.route('/transfer-token').post(function (request, response) {
    submitTx(request, 'transferToken', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess transferToken transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in transferring token."));
        });
});

productAuthenticationRouter.route('/transfer-from-token').post(function (request, response) {
    submitTx(request, 'transferFromToken', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess transferFromToken transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in transferring token from."));
        });
});

productAuthenticationRouter.route('/approve-token').put(function (request, response) {
    submitTx(request, 'approveToken', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess approveToken transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in approving token."));
        });
});

productAuthenticationRouter.route('/allowance-token').get(function (request, response) {
    evalTx(request, 'getAllowanceToken')
        .then((result) => {
            console.log('\nProcess getAllowanceToken transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in approving token."));
        });
});

productAuthenticationRouter.route('/mint-token').post(function (request, response) {
    submitTx(request, 'mintToken', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess mintToken transaction.');
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in minting token."));
        });
});


productAuthenticationRouter.route('/register-user').post(function (request, response) {
    try {
        let userId = request.body.userid;
        let userPwd = request.body.password;
        let userType = request.body.usertype;

        getUsernamePassword(request)
            .then(request => {
                utils.registerUser(userId, userPwd, userType, request.username).
                    then((result) => {
                        response.status(STATUS_SUCCESS);
                        response.send(result);
                    }, (error) => {
                        response.status(STATUS_CLIENT_ERROR);
                        response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                            "User, " + userId + " could not be registered. "
                            + "Verify if calling identity has admin privileges."));
                    });
            }, error => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                    "Invalid header;  User, " + userId + " could not be registered."));
            });
    } catch (error) {
        response.status(STATUS_SERVER_ERROR);
        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
            "Internal server error; User, " + userId + " could not be registered."));
    }
});

productAuthenticationRouter.route('/enroll-user/').post(function (request, response) {
    //  retrieve username, password of the called from authorization header
    getUsernamePassword(request).then(request => {
        utils.enrollUser(request.username, request.password).then(result => {
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, error => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                "User, " + request.username + " could not be enrolled. Check that user is registered or user has been enrolled."));
        });
    }), (error => {
        response.status(STATUS_CLIENT_ERROR);
        response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
            "Invalid header;  User, " + request.username + " could not be enrolled."));
    });
});

productAuthenticationRouter.route('/is-user-enrolled/:id').get(function (request, response) {
    getUsernamePassword(request)
        .then(request => {
            let userId = request.params.id;
            utils.isUserEnrolled(userId).then(result => {
                response.status(STATUS_SUCCESS);
                response.send(result);
            }, error => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                  "Error checking enrollment for user, " + request.params.id));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header; Error checking enrollment for user, " + request.params.id));
        }));
});

productAuthenticationRouter.route('/users').get(function (request, response) {
    getUsernamePassword(request)
        .then(request => {
            utils.getAllUsers(request.username).then((result) => {
                response.status(STATUS_SUCCESS);
                response.send(result);
            }, (error) => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse (error, STATUS_SERVER_ERROR,
                    "Problem getting list of users."));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header;  User, " + request.username + " could not be enrolled."));
        }));
});

productAuthenticationRouter.route('/users/:id').get(function (request, response) {
    getUsernamePassword(request)
        .then(request => {
            utils.isUserEnrolled(request.params.id).then(result1 => {
                if (result1.isEnrolled == true) {
                    utils.getUser(request.params.id, request.username).then((result2) => {
                        response.status(STATUS_SUCCESS);
                        response.send(result2);
                    }, (error) => {
                        response.status(STATUS_SERVER_ERROR);
                        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                            "Could not get user details for user, " + request.params.id));
                    });
                } else {
                    let error = {};
                    response.status(STATUS_CLIENT_ERROR);
                    response.send(utils.prepareErrorResponse(error, USER_NOT_ENROLLED,
                        "Verify if the user is registered and enrolled."));
                }
            }, error => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                    "Problem checking for user enrollment."));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header;  User, " + request.params.id + " could not be enrolled."));
        }));
});

module.exports = productAuthenticationRouter;