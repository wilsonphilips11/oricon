'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Product = require('./product.js');
const EVENT_NAME = "productContractEvent";

// Crypto Modules
const {K768_Encrypt, K768_Decrypt} = require('./crystals-kyber/index.js');
const Crypto = require('crypto');
const fs = require('fs');

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

    encrypt(data, userId, objectType) {
        const cipher_symKey = this.pqEncrypt(userId);
        const symBuffer = Buffer.from(cipher_symKey[1]);
        
        const cipher = Crypto.createCipher('aes256', symBuffer);  
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
            
        return {
            'detail': encrypted,
            'cipherKey': cipher_symKey[0],
            'objectType': `${objectType}`
        };
    }

    decrypt(data, userId) {
        const symKey = this.pqDecrypt(data.cipherKey, userId);
        const symBuffer = Buffer.from(symKey);
        
        const decipher = Crypto.createDecipher('aes256', symBuffer);    
        let decrypted = decipher.update(data.detail, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted.toString();
    }

    pqEncrypt(userId) {
        const userWallet = require.resolve(`./wallet/${userId}/pk-K768.txt`);
        let publicKey;
        try {
            publicKey = fs.readFileSync(`${userWallet}`, 'utf8');
            publicKey = publicKey.split(",").map(Number);
          } catch (err) {
            console.error('Error: ', err);
        }
        
        const cipher_symKey = K768_Encrypt(publicKey);

        return cipher_symKey;
    }

    pqDecrypt(cipherKey, userId) {
        const userWallet = require.resolve(`./wallet/${userId}/sk-K768.txt`);
        let secretKey;
        try {
            secretKey = fs.readFileSync(`${userWallet}`, 'utf8');
            secretKey = secretKey.split(",").map(Number);
          } catch (err) {
            console.error('Error: ', err);
        }
        
        const symKey = K768_Decrypt(cipherKey,secretKey);

        return symKey;
    }

    async init(ctx) {
        const cipherTokenName = this.encrypt(tokenName, 'admin', 'token');
        const cipherTokenSymbol = this.encrypt(tokenSymbol, 'admin', 'token');
        const cipherTokenDecimals = this.encrypt(tokenDecimals.toString(), 'admin', 'token');
        const cipherTotalSupply = this.encrypt(tokenTotalSupply.toString(), 'admin', 'token');

        await ctx.stub.putState(tokenNameKey, Buffer.from(JSON.stringify(cipherTokenName)));
        await ctx.stub.putState(tokenSymbolKey, Buffer.from(JSON.stringify(cipherTokenSymbol)));
        await ctx.stub.putState(tokenDecimalsKey, Buffer.from(JSON.stringify(cipherTokenDecimals)));
        await ctx.stub.putState(tokenTotalSupplyKey, Buffer.from(JSON.stringify(cipherTotalSupply)));
    }

    async createProduct(ctx, args) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin") {
            throw new Error('This user does not have access to create an product');
        }

        const productDetails = JSON.parse(args);
        productDetails['productTxId'] = await ctx.stub.getTxID();
        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (productBuffer && productBuffer.length > 0) {
            throw new Error(`Error Message from createProduct. Product with productCode = ${productDetails.productCode} already exists.`);
        }
        
        const product = Product.deserializeProduct(JSON.stringify(productDetails));
        const cipherProduct = this.encrypt(JSON.stringify(product), 'admin', 'product');
        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));
        await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(cipherProduct));

        return {
            status: 'Successfully create a product',
            result: cipherProduct
        };
    }

    async readProduct(ctx, productCode) {
        if (productCode.length < 1) {
            throw new Error('productCode is required as input')
        } 
        const productBuffer = await ctx.stub.getState(productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from readProduct. Product with productCode = ${productCode} does not exists.`);
        }
        
        const cipherProduct = JSON.parse(productBuffer);
        const decipherProduct = this.decrypt(cipherProduct, 'admin');
        const product = Product.deserializeProduct(decipherProduct);

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
                    Record.detail = JSON.parse(this.decrypt(Record, 'admin'));
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
                    jsonRes.Value.detail = JSON.parse(this.decrypt(jsonRes.Value, 'admin'));
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
        if (userType !== "admin")
            throw new Error('This user does not have access to update a product detail.');

        const productDetails = JSON.parse(args);
        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from updateProduct: Product with productCode = ${productDetails.productCode} does not exist.`);
        }

        let cipherProduct = JSON.parse(productBuffer);
        const decipherProduct = this.decrypt(cipherProduct, 'admin');
        const product = Product.deserializeProduct(decipherProduct);

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
        cipherProduct = this.encrypt(JSON.stringify(product), 'admin', 'product');
        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));
        await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(cipherProduct));
        
        return {
            status: 'Successfully update a product',
            result: cipherProduct
        };
    }

    async deleteProduct(ctx, productCode) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin")
            throw new Error('This user ddoes not have access to delete a product.');

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
        }
        
        return ctx.clientIdentity.getAttributeValue("usertype");
    }

    async getTokenDecimals(ctx) {
        const tokenDecimalsBuffer = await ctx.stub.getState(tokenDecimalsKey);
        const cipherTokenDecimals = JSON.parse(tokenDecimalsBuffer.toString());
        const decipherTokenDecimals = parseInt(this.decrypt(cipherTokenDecimals, 'admin'));
        
        return decipherTokenDecimals;
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
        const cipherBalance = JSON.parse(balanceBuffer);
        const decipherBalance = parseFloat(this.decrypt(cipherBalance, 'admin'));

        return decipherBalance;
    }

    async getTotalSupply(ctx) {
        const tokenTotalSupplyBuffer = await ctx.stub.getState(tokenTotalSupplyKey);
        const cipherTokenSupply = JSON.parse(tokenTotalSupplyBuffer);
        const decipherTokenSupply = parseFloat(this.decrypt(cipherTokenSupply, 'admin'));
        
        return decipherTokenSupply;
    }

    async getAllowance(ctx, owner, spender) {
        const allowanceKey = ctx.stub.createCompositeKey(allowanceKeyPrefix, [owner, spender]);
        const allowanceBuffer = await ctx.stub.getState(allowanceKey);
        if (!allowanceBuffer || allowanceBuffer.length === 0) {
            throw new Error(`Spender ${spender} has no allowance from ${owner}`);
        }
        const cipherTokenAllowance = JSON.parse(allowanceBuffer);
        const decipherTokenAllowance = parseFloat(this.decrypt(cipherTokenAllowance, 'admin'));
        
        return decipherTokenAllowance;
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
                let cipherTokenAllowance, decipherTokenAllowance;

                try {
                    cipherTokenAllowance = JSON.parse(allowance.value.value.toString('utf8'));
                    decipherTokenAllowance = parseFloat(this.decrypt(cipherTokenAllowance, 'admin'));
                } catch (err) {
                    console.log(err);
                    decipherTokenAllowance = allowance.value.value.toString('utf8');
                }
                
                allowances.push({
                    spender: attributes[1],
                    value: decipherTokenAllowance
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

        const cipherTokenName = JSON.parse(tokenNameBuffer);
        const cipherTokenSymbol = JSON.parse(tokenSymbolBuffer);
        const cipherTokenDecimals = JSON.parse(tokenDecimalsBuffer);

        const decipherTokenName = this.decrypt(cipherTokenName, 'admin');
        const decipherTokenSymbol = this.decrypt(cipherTokenSymbol, 'admin');
        const decipherTokenDecimals = parseInt(this.decrypt(cipherTokenDecimals, 'admin'));

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
                tokenName: decipherTokenName,
                tokenSymbol: decipherTokenSymbol,
                tokenDecimals: decipherTokenDecimals,
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

        const cipherSenderBalance = this.encrypt(senderBalance.toString(), 'admin', 'token');
        const cipherReceiverBalance = this.encrypt(receiverBalance.toString(), 'admin', 'token');
        const cipherSenderBalanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [sender]);
        const cipherReceiverBalanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [receiver]);
        
        await ctx.stub.putState(cipherSenderBalanceKey, Buffer.from(JSON.stringify(cipherSenderBalance)));
        await ctx.stub.putState(cipherReceiverBalanceKey, Buffer.from(JSON.stringify(cipherReceiverBalance)));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(JSON.stringify(cipherSenderBalance)));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(JSON.stringify(cipherReceiverBalance)));

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
        const cipherAllowanceBalance = this.encrypt(allowanceBalance.toString(), 'admin', 'token');
        const allowanceKey = ctx.stub.createCompositeKey(allowanceKeyPrefix, [transferFromDetails.owner, userId]);
        await ctx.stub.putState(allowanceKey, Buffer.from(JSON.stringify(cipherAllowanceBalance)));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(JSON.stringify(cipherAllowanceBalance)));
        
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
        const cipherAllowance = this.encrypt(approveDetails.value.toString(), 'admin', 'token');
        await ctx.stub.putState(allowanceKey, Buffer.from(JSON.stringify(cipherAllowance)));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(JSON.stringify(cipherAllowance)));

        return {
            status: 'Successfully approve tokens',
            result: {
                allowance: approveDetails.value
            }
        };
    }

    async mintToken(ctx, args){
        const userId = await this.getCurrentUserId(ctx);
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin")
            throw new Error('This user does not have access to mint tokens.');
        const mintDetails = JSON.parse(args);
        if (typeof(mintDetails.value) !== 'number' || mintDetails.value <= 0) {
            throw new Error('Mint amount must be positive number!');
        }
        const tokenDecimals = await this.getTokenDecimals(ctx);
        mintDetails.value = parseFloat(mintDetails.value.toFixed(tokenDecimals));

        let minterBalance = await this.getBalanceOf(ctx, userId, true);
        minterBalance += mintDetails.value;
        const cipherMinterBalance = this.encrypt(minterBalance.toString(), 'admin', 'token');
        const minterBalanceKey = ctx.stub.createCompositeKey(balanceKeyPrefix, [userId]);
        await ctx.stub.putState(minterBalanceKey, Buffer.from(JSON.stringify(cipherMinterBalance)));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(JSON.stringify(cipherMinterBalance)));

        let tokenTotalSupply = await this.getTotalSupply(ctx);
        tokenTotalSupply += mintDetails.value;
        const cipherTokenTotalSupply = this.encrypt(tokenTotalSupply.toString(), 'admin', 'token');
        await ctx.stub.putState(tokenTotalSupplyKey, Buffer.from(JSON.stringify(cipherTokenTotalSupply)));
        await ctx.stub.setEvent(EVENT_NAME, Buffer.from(cipherTokenTotalSupply.toString()));

        return {
            status: 'Successfully mint tokens',
            result: {
                totalSupply: tokenTotalSupply
            }
        };
    }
}

module.exports = ProductContract;
