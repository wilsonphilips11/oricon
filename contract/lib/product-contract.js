'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Product = require('./product.js');
const EVENT_NAME = "productContractEvent";

// Token Composite Key Prefix
const tokenNameKey = 'name';
const tokenSymbolKey = 'symbol';
const tokenDecimalsKey = 'decimals';
const tokenTotalSupplyKey = 'totalSupply';
const balanceKeyPrefix = 'balance';
const allowanceKeyPrefix = 'allowance';

// Token Init
const tokenName = 'Product Authentication Token';
const tokenSymbol = 'XYZ';
const tokenDecimals = 3;
const tokenTotalSupply = 0;

// Transaction Fee
const txFee = 1;

class ProductContext extends Context {
    
    constructor() {
        super();
    }
    
}

class ProductContract extends Contract {

    constructor() {
        super('org.productauthentication.contract');
    }

    createContext() {
        return new ProductContext();
    }

    async init(ctx) {
        await ctx.stub.putState(tokenNameKey, Buffer.from(tokenName));
        await ctx.stub.putState(tokenSymbolKey, Buffer.from(tokenSymbol));
        await ctx.stub.putState(tokenDecimalsKey, Buffer.from(tokenDecimals.toString()));
        await ctx.stub.putState(tokenTotalSupplyKey, Buffer.from(tokenTotalSupply.toString()));
    }

    async createProduct(ctx, args) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin") {
            throw new Error('This user does not have access to create an product');
        } else {
            const userId = await this.getCurrentUserId(ctx);
            const transferRes = await this.transfer(ctx, userId, 'Admin@org1.example.com', txFee);
            if (!transferRes) {
                throw new Error('Failed to transfer');
            }
        }

        const productDetails = JSON.parse(args);
        productDetails['productTxId'] = await ctx.stub.getTxID();
        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (productBuffer && productBuffer.length > 0) {
            throw new Error(`Error Message from createProduct. Product with productCode = ${productDetails.productCode} already exists.`);
        }
        
        const product = Product.deserializeProduct(JSON.stringify(productDetails));
        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(product));
        await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(product));

        return {
            status: 'Successfully create a product',
            result: product
        };
    }

    async readProduct(ctx, productCode) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin")
            throw new Error(`This user does not have access to read a product.`);

        if (productCode.length < 1) {
            throw new Error('productCode is required as input')
        } 
        const productBuffer = await ctx.stub.getState(productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from readProduct. Product with productCode = ${productCode} does not exists.`);
        }
        
        const product = Product.deserializeProduct(productBuffer);

        return {
            status: 'Successfully read a product',
            result: product
        };
    }

    async readAllProducts(ctx) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin")
            throw new Error(`This user does not have access to read all products.`);
        
        const queryString = {
            "selector": {
                "objectType": 'product',
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        let allProducts = [];
        while (true) {
            let product = await iterator.next();
            
            if (product.value && product.value.value.toString()) {
                let Record;
                try {
                    Record = JSON.parse(product.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = product.value.value.toString('utf8');
                }
                allProducts.push(Record);
            }

            if (product.done) {
                await iterator.close();
                return {
                    status: 'Successfully read all products',
                    result: (allProducts.length > 0) ? allProducts : 'No products added'
                };
            }
        }
    }

    async readProductHistory(ctx, productCode) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin")
            throw new Error(`This user does not have access to read all products.`);

        if (productCode.length < 1) {
            throw new Error('productCode is required as input.');
        }

        const iterator = await ctx.stub.getHistoryForKey(productCode);
        let productHistory = [];
        while (true) {
            let history = await iterator.next();
            
            if (history.value && history.value.value.toString()) {
                let jsonRes = {};
                jsonRes.TxId = history.value.tx_id;
                jsonRes.IsDelete = history.value.is_delete.toString();
                let d = new Date(0);
                d.setUTCSeconds(history.value.timestamp.seconds.low);
                jsonRes.Timestamp = d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
                
                try {
                    jsonRes.Value = JSON.parse(history.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = history.value.value.toString('utf8');
                }

                productHistory.push(jsonRes);
            }

            if (history.done) {
                await iterator.close();
                return {
                    status: 'Successfully read a product history',
                    result: productHistory
                };
            }
        }
    }

    async updateProduct(ctx, args) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin") {
            throw new Error('This user does not have access to update a product detail.');
        } else {
            const userId = await this.getCurrentUserId(ctx);
            const transferRes = await this.transfer(ctx, userId, 'Admin@org1.example.com', txFee);
            if (!transferRes) {
                throw new Error('Failed to transfer');
            }
        }

        const productDetails = JSON.parse(args);
        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from updateProduct: Product with productCode = ${productDetails.productCode} does not exist.`);
        }

        const product = Product.deserializeProduct(productBuffer);

        if (product.getProductName() !== productDetails.productName) {
            product.setProductName(productDetails.productName);
        }
        if (product.getProductPrice() !== productDetails.productPrice) {
            product.setProductPrice(productDetails.productPrice);
        }
        if (product.getProductOrigin() !== productDetails.productOrigin) {
            product.setProductOrigin(productDetails.productOrigin);
        }
        if (product.getProductReleaseDate() !== productDetails.productReleaseDate) {
            product.setProductReleaseDate(productDetails.productReleaseDate);
        }
        if (product.getProductDescription() !== productDetails.productDescription) {
            product.setProductDescription(productDetails.productDescription);
        }
        if (product.getProductImageBase64() !== productDetails.productImageBase64) {
            product.setProductImageBase64(productDetails.productImageBase64);
        }
        
        product.productTxId = await ctx.stub.getTxID();
        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(product));
        await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(product));
        
        return {
            status: 'Successfully update a product',
            result: product
        };
    }

    async deleteProduct(ctx, productCode) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin") {
            throw new Error('This user ddoes not have access to delete a product.');
        } else {
            const userId = await this.getCurrentUserId(ctx);
            const transferRes = await this.transfer(ctx, userId, 'Admin@org1.example.com', txFee);
            if (!transferRes) {
                throw new Error('Failed to transfer');
            }
        }

        if (productCode.length < 1) {
            throw new Error('productCode required as input');
        }
        const productBuffer = await ctx.stub.getState(productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from deleteProduct: Product with productCode = ${productCode} does not exist.`);
        }

        await ctx.stub.deleteState(productCode);
        await ctx.stub.setEvent(EVENT_NAME, productCode);

        return {
            status: 'Successfully delete a product',
        };
    }

    async getCurrentUserId(ctx) {
        let id = [];
        id.push(ctx.clientIdentity.getID());
        const begin = id[0].indexOf("/CN=");
        const end = id[0].lastIndexOf("::/C=");
        const userid = id[0].substring(begin + 4, end);
        
        return userid;
    }

    async getCurrentUserType(ctx) {
        const userid = await this.getCurrentUserId(ctx);
        if (userid === "admin") {
            return userid;
        } else if (userid.includes("@org1.example.com")) {
            return 'admin';
        }
        
        return ctx.clientIdentity.getAttributeValue("usertype");
    }

    async getTokenDecimals(ctx) {
        const tokenDecimalsBuffer = await ctx.stub.getState(tokenDecimalsKey);
        const tokenDecimals = parseInt(tokenDecimalsBuffer.toString());
        
        return tokenDecimals;
    }

    async getBalanceOf(ctx, userId, zeroBalance = false) {
        const balanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [userId]);
        const balanceBuffer = await ctx.stub.getState(balanceKey);
        if (!balanceBuffer || balanceBuffer.length === 0) {
            if (zeroBalance) {
                return 0;
            }
            throw new Error(`${userId} account does not have balance.`);
        }
        const balance = parseFloat(balanceBuffer.toString());

        return balance;
    }

    async getTotalSupply(ctx) {
        const tokenTotalSupplyBuffer = await ctx.stub.getState(tokenTotalSupplyKey);
        const tokenSupply = parseFloat(tokenTotalSupplyBuffer.toString());
        
        return tokenSupply;
    }

    async getAllowance(ctx, owner, spender) {
        const allowanceKey = ctx.stub.createCompositeKey(allowanceKeyPrefix, [owner, spender]);
        const allowanceBuffer = await ctx.stub.getState(allowanceKey);
        if (!allowanceBuffer || allowanceBuffer.length === 0) {
            throw new Error(`Spender ${spender} has no allowance from ${owner}`);
        }
        const tokenAllowance = parseFloat(allowanceBuffer.toString());
        
        return tokenAllowance;
    }

    async getAllowanceToken(ctx) {
        const userId = await this.getCurrentUserId(ctx);
        const iterator = await ctx.stub.getStateByPartialCompositeKey(allowanceKeyPrefix, [userId]);
        let allowances = [];
        while (true) {
            let allowance = await iterator.next();

            if (allowance.value && allowance.value.value.toString() && allowance.value.key) {
                let objectType, attributes;
                ({ objectType, attributes } = await ctx.stub.splitCompositeKey(allowance.value.key));       
                let tokenAllowance;

                try {
                    tokenAllowance = parseFloat(JSON.parse(allowance.value.value.toString('utf8')));
                } catch (err) {
                    console.log(err);
                    tokenAllowance = allowance.value.value.toString('utf8');
                }
                
                allowances.push({
                    spender: attributes[1],
                    value: tokenAllowance
                });
            }

            if (allowance.done) {
                await iterator.close();
                return {
                    status: 'Successfully get allowances',
                    result: (allowances.length > 0) ? allowances : 'No allowances given'
                };
            }
        }
    }

    async getTokenDetails(ctx) {
        const userId = await this.getCurrentUserId(ctx);
        const tokenNameBuffer = await ctx.stub.getState(tokenNameKey);
        const tokenSymbolBuffer = await ctx.stub.getState(tokenSymbolKey);
        const tokenDecimalsBuffer = await ctx.stub.getState(tokenDecimalsKey);

        const tokenName = tokenNameBuffer.toString();
        const tokenSymbol = tokenSymbolBuffer.toString();
        const tokenDecimals = parseInt(tokenDecimalsBuffer.toString());

        let currentUserBalance;
        try {
            currentUserBalance = await this.getBalanceOf(ctx, userId);
        } catch(err) {
            currentUserBalance = 'No balance';
        }
        const totalSupply = await this.getTotalSupply(ctx);

        const response = {
            status: 'Successfully get token details',
            result: {
                tokenName: tokenName,
                tokenSymbol: tokenSymbol,
                tokenDecimals: tokenDecimals,
                tokenBalance: currentUserBalance,
            }
        };

        if (userId === 'admin') {
            response.result['totalSupply'] = totalSupply;
        }

        return response;
    }

    async transfer(ctx, sender, receiver, value, skipValueCheck = false) {
        if (sender === receiver) {
            throw new Error('Cannot transfer to and from same account');
        }
        if (!skipValueCheck) {
            if (typeof(value) !== 'number' || value <= 0) {
                throw new Error('Transfer amount must be positive number!');
            }
            const tokenDecimals = await this.getTokenDecimals(ctx);
            value = parseFloat(value.toFixed(tokenDecimals));
        }

        let senderBalance = await this.getBalanceOf(ctx, sender);
        if (senderBalance < value) {
            throw new Error(`${sender} balance must be greater or equal to transfer value!`);
        }

        let receiverBalance = await this.getBalanceOf(ctx, receiver, true); 
        senderBalance -= value;
        senderBalance = parseFloat(senderBalance.toFixed(tokenDecimals));
        receiverBalance += value;
        receiverBalance = parseFloat(receiverBalance.toFixed(tokenDecimals));

        const senderBalanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [sender]);
        const receiverBalanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [receiver]);
        
        await ctx.stub.putState(senderBalanceKey, Buffer.from(senderBalance.toString()));
        await ctx.stub.putState(receiverBalanceKey, Buffer.from(receiverBalance.toString()));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(senderBalance.toString()));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(receiverBalance.toString()));

        return true;
    }

    async transferToken(ctx, args){
        const userId = await this.getCurrentUserId(ctx);
        const transferDetails = JSON.parse(args);
        
        const transferRes = await this.transfer(ctx, userId, transferDetails.receiver, transferDetails.value);
        if (!transferRes) {
            throw new Error('Failed to transfer');
        }

        return {
            status: 'Successfully transfer tokens',
            result: {
                balance: await this.getBalanceOf(ctx, userId, true) - transferDetails.value
            }
        };
    }

    async transferFromToken(ctx, args){
        const userId = await this.getCurrentUserId(ctx);
        const transferFromDetails = JSON.parse(args);
        let allowanceBalance = await this.getAllowance(ctx, transferFromDetails.owner, userId);
        if (typeof(transferFromDetails.value) !== 'number' || transferFromDetails.value <= 0) {
            throw new Error('Transfer from amount must be positive number!');
        }
        const tokenDecimals = await this.getTokenDecimals(ctx);
        transferFromDetails.value = parseFloat(transferFromDetails.value.toFixed(tokenDecimals));
        if (allowanceBalance < transferFromDetails.value) {
            throw new Error(`${transferFromDetails.spender} allowance must be greater or equal to transfer from amount!`);
        }

        const transferRes = await this.transfer(ctx, transferFromDetails.owner, transferFromDetails.spender, transferFromDetails.value, true);
        if (!transferRes) {
            throw new Error('Failed to transfer');
        }

        allowanceBalance -=  transferFromDetails.value;
        allowanceBalance = parseFloat(allowanceBalance.toFixed(tokenDecimals));
        const allowanceKey = ctx.stub.createCompositeKey(allowanceKeyPrefix, [transferFromDetails.owner, userId]);
        await ctx.stub.putState(allowanceKey, Buffer.from(allowanceBalance.toString()));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(allowanceBalance.toString()));
        
        return {
            status: 'Successfully transfer tokens from owner',
            result: {
                owner: transferFromDetails.owner,
                allowance: allowanceBalance
            }
        };
    }

    async approveToken(ctx, args){
        const userId = await this.getCurrentUserId(ctx);
        const approveDetails = JSON.parse(args);
        if (userId === approveDetails.spender) {
            throw new Error('Cannot approve to same account');
        }
        if (typeof(approveDetails.value) !== 'number' || approveDetails.value <= 0) {
            throw new Error('Approval amount must be positive number!');
        }
        const tokenDecimals = await this.getTokenDecimals(ctx);
        approveDetails.value = parseFloat(approveDetails.value.toFixed(tokenDecimals));
        const ownerTokenBalance = await this.getBalanceOf(ctx, userId);
        if (ownerTokenBalance < approveDetails.value) {
            throw new Error(`${userId} balance must be greater or equal to approve amount!`);
        }

        const allowanceKey = ctx.stub.createCompositeKey(allowanceKeyPrefix, [userId, approveDetails.spender]);
        await ctx.stub.putState(allowanceKey, Buffer.from(approveDetails.value.toString()));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(approveDetails.value.toString()));

        return {
            status: 'Successfully approve tokens',
            result: {
                allowance: approveDetails.value
            }
        };
    }

    async mintToken(ctx, args){
        const userId = await this.getCurrentUserId(ctx);
        if (userId !== "Admin@org1.example.com")
            throw new Error('This user does not have access to mint tokens.');
        
        const mintDetails = JSON.parse(args);
        if (typeof(mintDetails.value) !== 'number' || mintDetails.value <= 0) {
            throw new Error('Mint amount must be positive number!');
        }
        const tokenDecimals = await this.getTokenDecimals(ctx);
        mintDetails.value = parseFloat(mintDetails.value.toFixed(tokenDecimals));

        let minterBalance = await this.getBalanceOf(ctx, userId, true);
        minterBalance += mintDetails.value;
        const minterBalanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [userId]);
        await ctx.stub.putState(minterBalanceKey, Buffer.from(minterBalance.toString()));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(minterBalance.toString()));

        let tokenTotalSupply = await this.getTotalSupply(ctx);
        tokenTotalSupply += mintDetails.value;
        await ctx.stub.putState(tokenTotalSupplyKey, Buffer.from(tokenTotalSupply.toString()));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(tokenTotalSupply.toString()));

        return {
            status: 'Successfully mint tokens',
            result: {
                totalSupply: tokenTotalSupply
            }
        };
    }
}

module.exports = ProductContract;
