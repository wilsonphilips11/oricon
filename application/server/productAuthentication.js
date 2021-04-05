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

async function getUsernamePassword(request) {
    if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
        return new Promise().reject('Missing Authorization Header');
    }

    const base64Credentials = request.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
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

productAuthenticationRouter.route('/create-product/').post(function (request, response) {
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

productAuthenticationRouter.route('/products/:productCode').get(function (request, response) {
    evalTx(request, 'readProduct', request.params.productCode)
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

productAuthenticationRouter.route('/products').get(function (request, response) {
    evalTx(request, 'readAllProducts', '')
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

productAuthenticationRouter.route('/product-history/:productCode').get(function (request, response) {
    evalTx(request, 'readProductHistory', request.params.productCode)
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
    let userType = request.body.usertype;
    //  retrieve username, password of the called from authorization header
    getUsernamePassword(request).then(request => {
        utils.enrollUser(request.username, request.password, userType).then(result => {
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, error => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                "User, " + request.username + " could not be enrolled. Check that user is registered."));
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