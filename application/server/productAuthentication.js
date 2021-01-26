'use strict';

const express = require('express');
const utils = require('./utils.js');
const productAuthenticationRouter = express.Router();

const Product = require('../../contract/lib/product.js');

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

productAuthenticationRouter.route('/create-product/').post(function (request, response) {
    submitTx(request, 'createProduct', JSON.stringify(request.body))
        .then((result) => {
            console.log('\nProcess createProduct transaction.');
            let product = Product.fromBuffer(result);
            response.status(STATUS_SUCCESS);
            response.send(product);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem creating the product."));
        });
});

productAuthenticationRouter.route('/products/:id').get(function (request, response) {
    submitTx(request, 'readProduct', request.params.id)
        .then((readProductResponse) => {
            let product = Product.fromBuffer(readProductResponse);
            response.status(STATUS_SUCCESS);
            response.send(product);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, PRODUCT_NOT_FOUND,
                'Product id, ' + request.params.id +
                ' does not exist or the user does not have access to read product at this time.'));
        });
});

productAuthenticationRouter.route('/products').get(function (request, response) {
    submitTx(request, 'readAllProducts', '')
        .then((readAllProductsResponse) => {
            let products = readAllProductsResponse;
            response.status(STATUS_SUCCESS);
            response.send(products);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem getting the list of products."));
        });
});

productAuthenticationRouter.route('/product-history/:id').get(function (request, response) {
    submitTx(request, 'readProductHistory', request.params.id)
        .then((readProductHistoryResponse) => {
            console.log('\n>>>Process readProductHistory response', readProductHistoryResponse);
            response.status(STATUS_SUCCESS);
            response.send(readProductHistoryResponse);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem fetching history for order, ", request.params.id));
        });
});

productAuthenticationRouter.route('/update-product').put(function (request, response) {
    submitTx(request, 'updateProduct', JSON.stringify(request.body))
        .then((updateProductResponse) => {
            console.log('Process updateProduct transaction.');
            let product = Product.fromBuffer(updateProductResponse);
            response.status(STATUS_SUCCESS);
            response.send(product);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in updating product."));
        });

});

productAuthenticationRouter.route('/delete-product/:id').delete(function (request, response) {
    submitTx(request, 'deleteProduct', request.params.id)
        .then((deleteOrderResponse) => {
            console.log('Process DeleteOrder transaction.');
            console.log('Transaction complete.');
            response.status(STATUS_SUCCESS);
            response.send(deleteOrderResponse);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in deleting product, " + request.params.id));
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
                if (result1 == true) {
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