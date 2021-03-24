'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Product = require('./product.js');
const EVENT_NAME = "productContractEvent";
const Crypto = require('crypto');
const ERC20Token = require('./token/ERC20Token.js');
const fs = require('fs');
const {K768_KeyGen, K768_Encrypt, K768_Decrypt} = require('./crystals-kyber/index.js');

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

    async init(ctx, args) {
        const tokenDetails = JSON.parse(args);
        const token = new ERC20Token(
            tokenDetails.name,
            tokenDetails.symbol, 
            tokenDetails.decimals, 
            tokenDetails.owner, 
            tokenDetails.totalSupply, 
            tokenDetails.balanceOf,  
            tokenDetails.allowance
        );

        // Cipher
        const cipherToken = this.encrypt(JSON.stringify(token), 'admin', 'token');
        await ctx.stub.putState('token', ERC20Token.toBuffer(cipherToken));
        
        // Plain
        // await ctx.stub.putState('token', ERC20Token.toBuffer(token));
    }

    async createProduct(ctx, args) {
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "admin")
            throw new Error('This user does not have access to create an product');

        const productDetails = JSON.parse(args);
        productDetails['txId'] = await ctx.stub.getTxID();
        console.log('txIdCreate', productDetails['txId']);

        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (productBuffer && productBuffer.length > 0) {
            throw new Error(`Error Message from createProduct. Product with productCode = ${productDetails.productCode} already exists.`);
        }
        
        const product = Product.deserializeProduct(JSON.stringify(productDetails));

        // Cipher
        const cipherProduct = this.encrypt(JSON.stringify(product), 'admin', 'product');
        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));
        await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(cipherProduct));
        
        // Plain
        // await ctx.stub.putState(product.getProductCode(), Product.toBuffer(product));
        // await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(product));

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
        
        // Cipher
        const cipherProduct = JSON.parse(productBuffer);
        const decipherProduct = this.decrypt(cipherProduct, 'admin');
        const product = Product.deserializeProduct(decipherProduct);

        // Plain
        // const product = Product.deserializeProduct(productBuffer);

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
        const allProducts = [];
        while (true) {
            const product = await iterator.next();
            
            if (product.value && product.value.value.toString()) {
                let Record;
                try {
                    Record = JSON.parse(product.value.value.toString('utf8'));
                    
                    // Cipher
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
                    result: allProducts
                };
            }
        }
    }

    async readStateHistory(ctx, stateKey) {
        if (stateKey.length < 1) {
            throw new Error('State key is required as input.');
        }

        const iterator = await ctx.stub.getHistoryForKey(stateKey);
        const stateHistory = [];
        while (true) {
            const history = await iterator.next();
            
            if (history.value && history.value.value.toString()) {
                let jsonRes = {};
                jsonRes.TxId = history.value.tx_id;
                jsonRes.IsDelete = history.value.is_delete.toString();
                
                let d = new Date(0);
                d.setUTCSeconds(history.value.timestamp.seconds.low);
                jsonRes.Timestamp = d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
                
                try {
                    jsonRes.Value = JSON.parse(history.value.value.toString('utf8'));

                    // Cipher
                    jsonRes.Value.detail = JSON.parse(this.decrypt(jsonRes.Value, 'admin'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = history.value.value.toString('utf8');
                }

                stateHistory.push(jsonRes);
            }

            if (history.done) {
                await iterator.close();
                return {
                    status: 'Successfully read state history',
                    result: stateHistory
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

        // Cipher
        const cipherProduct = JSON.parse(productBuffer);
        const decipherProduct = this.decrypt(cipherProduct, 'admin');
        decipherProduct['txId'] = await ctx.stub.getTxID();
        const product = Product.deserializeProduct(decipherProduct);

        // Plain
        // const product = Product.deserializeProduct(productBuffer);

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
        
        // Cipher
        cipherProduct = this.encrypt(JSON.stringify(product), 'admin', 'product');
        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));
        await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(cipherProduct));
        
        // Plain
        // await ctx.stub.putState(product.getProductCode(), Product.toBuffer(product));
        // await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(product));

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

    async getTokenDetail(ctx) {
        const tokenBuffer = await ctx.stub.getState('token');
        if (!tokenBuffer || tokenBuffer.length === 0) {
            throw new Error(`Error Message from getTokenDetail: token does not exist.`);
        }
        
        // Cipher
        const cipherToken = JSON.parse(tokenBuffer);
        const decipherToken = this.decrypt(cipherToken, 'admin');
        const token = ERC20Token.deserializeToken(decipherToken);

        // Plain
        // const token = ERC20Token.deserializeToken(tokenBuffer);
        
        const userId = await this.getCurrentUserId(ctx);
        const tokenDetails = {
            name: `${token.getName()}`,
            symbol: `${token.getSymbol()}`,
            decimals: token.getDecimals(),
            owner: `${token.getOwner()}`,
            balance: token.getBalanceOf(userId) ? token.getBalanceOf(userId) : 'undefined'
        };
        if (userId === token.getOwner()) {
            tokenDetails['totalSupply'] = token.getTotalSupply();
        }

        return {
            status: 'Successfully get token details',
            result: tokenDetails
        };
    }

    async transferToken(ctx, args){
        const transferDetails = JSON.parse(args);
        const tokenBuffer = await ctx.stub.getState('token');
        if (!tokenBuffer || tokenBuffer.length === 0) {
            throw new Error(`Error Message from getTokenDetail: token does not exist.`);
        }
        
        // Cipher
        const cipherToken = JSON.parse(tokenBuffer);
        const decipherToken = this.decrypt(cipherToken, 'admin');
        const token = ERC20Token.deserializeToken(decipherToken);

        // Plain
        // const token = ERC20Token.deserializeToken(tokenBuffer);
        
        const userId = await this.getCurrentUserId(ctx);
        token.transfer(userId, transferDetails.receiver, transferDetails.value);
        
        // Cipher
        const newCipherToken = this.encrypt(JSON.stringify(token), 'admin', 'token');
        await ctx.stub.putState('token', ERC20Token.toBuffer(newCipherToken));
        await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(newCipherToken));

        // Plain
        // await ctx.stub.putState('token', ERC20Token.toBuffer(token));
        // await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(token));

        return {
            status: 'Successfully transfer tokens',
            result: {
                balance: token.getBalanceOf(userId)
            }
        };
    }

    async transferFromToken(ctx, args){
        const transferFromDetails = JSON.parse(args);
        const tokenBuffer = await ctx.stub.getState('token');
        if (!tokenBuffer || tokenBuffer.length === 0) {
            throw new Error(`Error Message from getTokenDetail: token does not exist.`);
        }
        
        // Cipher
        const cipherToken = JSON.parse(tokenBuffer);
        const decipherToken = this.decrypt(cipherToken, 'admin');
        const token = ERC20Token.deserializeToken(decipherToken);

        // Plain
        // const token = ERC20Token.deserializeToken(tokenBuffer);
        
        const userId = await this.getCurrentUserId(ctx);
        token.transferFrom(userId, transferFromDetails.owner, transferFromDetails.receiver, transferFromDetails.value);
        
        // Cipher
        const newCipherToken = this.encrypt(JSON.stringify(token), 'admin', 'token');
        await ctx.stub.putState('token', ERC20Token.toBuffer(newCipherToken));
        await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(newCipherToken));

        // Plain
        // await ctx.stub.putState('token', ERC20Token.toBuffer(token));
        // await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(token));

        return {
            status: 'Successfully transfer tokens from owner',
            result: {
                allowance: token.getAllowance(userId, transferFromDetails.owner)
            }
        };
    }

    async approveToken(ctx, args){
        const approveDetails = JSON.parse(args);
        const tokenBuffer = await ctx.stub.getState('token');
        if (!tokenBuffer || tokenBuffer.length === 0) {
            throw new Error(`Error Message from getTokenDetail: token does not exist.`);
        }
        
        // Cipher
        const cipherToken = JSON.parse(tokenBuffer);
        const decipherToken = this.decrypt(cipherToken, 'admin');
        const token = ERC20Token.deserializeToken(decipherToken);

        // Plain
        // const token = ERC20Token.deserializeToken(tokenBuffer);
        
        const userId = await this.getCurrentUserId(ctx);
        token.approve(userId, approveDetails.spender, approveDetails.value);
        
        // Cipher
        const newCipherToken = this.encrypt(JSON.stringify(token), 'admin', 'token');
        await ctx.stub.putState('token', ERC20Token.toBuffer(newCipherToken));
        await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(newCipherToken));

        // Plain
        // await ctx.stub.putState('token', ERC20Token.toBuffer(token));
        // await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(token));

        return {
            status: 'Successfully approve tokens',
            result: {
                allowance: token.getAllowance(approveDetails.spender, userId)
            }
        };
    }

    async getAllowanceToken(ctx, owner){
        const tokenBuffer = await ctx.stub.getState('token');
        if (!tokenBuffer || tokenBuffer.length === 0) {
            throw new Error(`Error Message from getTokenDetail: token does not exist.`);
        }
        
        // Cipher
        const cipherToken = JSON.parse(tokenBuffer);
        const decipherToken = this.decrypt(cipherToken, 'admin');
        const token = ERC20Token.deserializeToken(decipherToken);

        // Plain
        // const token = ERC20Token.deserializeToken(tokenBuffer);
        
        const userId = await this.getCurrentUserId(ctx);

        return {
            status: 'Successfully get allowance tokens',
            result: {
                allowance: token.getAllowance(userId, owner)
            }
        };
    }

    async mintToken(ctx, args){
        const userType = await this.getCurrentUserType(ctx);
        if (userType !== "superadmin")
            throw new Error('This user does not have access to mint tokens.');

        const mintDetails = JSON.parse(args);
        const tokenBuffer = await ctx.stub.getState('token');
        if (!tokenBuffer || tokenBuffer.length === 0) {
            throw new Error(`Error Message from getTokenDetail: token does not exist.`);
        }
        
        // Cipher
        const cipherToken = JSON.parse(tokenBuffer);
        const decipherToken = this.decrypt(cipherToken, 'admin');
        const token = ERC20Token.deserializeToken(decipherToken);

        // Plain
        // const token = ERC20Token.deserializeToken(tokenBuffer);
        
        const userId = await this.getCurrentUserId(ctx);
        token.mint(userId, mintDetails.value);

        // Cipher
        const newCipherToken = this.encrypt(JSON.stringify(token), 'admin', 'token');
        await ctx.stub.putState('token', ERC20Token.toBuffer(newCipherToken));
        await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(newCipherToken));
        
        // Plain
        // await ctx.stub.putState('token', ERC20Token.toBuffer(token));
        // await ctx.stub.setEvent(EVENT_NAME, ERC20Token.toBuffer(token));

        return {
            status: 'Successfully mint tokens',
            result: {
                totalSupply: token.getTotalSupply()
            }
        };
    }
}

module.exports = ProductContract;
