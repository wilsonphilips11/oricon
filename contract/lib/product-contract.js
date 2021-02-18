'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Product = require('./product.js');
const EVENT_NAME = "productContractEvent";
const Crypto = require('crypto');
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

    encrypt(data, userId){
        const cipher_symKey = this.pqEncrypt(userId);
        const symBuffer = Buffer.from(cipher_symKey[1]);
        const cipher = Crypto.createCipher('aes256', symBuffer);  
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');   

        return JSON.stringify({
            'productDetail': encrypted,
            'cipherKey': cipher_symKey[0],
        });
    }

    decrypt(data, userId)  {
        data = JSON.parse(data);
        const symKey = this.pqDecrypt(data.cipherKey, userId);
        const symBuffer = Buffer.from(symKey);

        const decipher = Crypto.createDecipher('aes256', symBuffer);    
        let decrypted = decipher.update(data.productDetail, 'hex', 'utf8');
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

    async initializeProducts(ctx) {
        const products = [
            {
                productCode: '001',
                companyId: 'Lorem Ipsum',
                productBrand: 'Lorem Ipsum',
                productName: 'Lorem Ipsum',
                productPrice: 123123,
                productOrigin: 'Lorem Ipsum',
                productReleaseDate: 'Lorem Ipsum',
                productDescription: 'Lorem Ipsum',
                productImageHash: 'Lorem Ipsum',
                productImageLink: 'Lorem Ipsum',
            },
            {
                productCode: '002',
                companyId: 'Lorem Ipsum',
                productBrand: 'Lorem Ipsum',
                productName: 'Lorem Ipsum',
                productPrice: 123123,
                productOrigin: 'Lorem Ipsum',
                productReleaseDate: 'Lorem Ipsum',
                productDescription: 'Lorem Ipsum',
                productImageHash: 'Lorem Ipsum',
                productImageLink: 'Lorem Ipsum',
            },
            {
                productCode: '003',
                companyId: 'Lorem Ipsum',
                productBrand: 'Lorem Ipsum',
                productName: 'Lorem Ipsum',
                productPrice: 123123,
                productOrigin: 'Lorem Ipsum',
                productReleaseDate: 'Lorem Ipsum',
                productDescription: 'Lorem Ipsum',
                productImageHash: 'Lorem Ipsum',
                productImageLink: 'Lorem Ipsum',
            }
        ];

        for (let i = 0; i < products.length; i++) {
            let product = new Product(
                products[i].productCode,
                products[i].companyId, 
                products[i].productBrand, 
                products[i].productName,  
                products[i].productPrice,
                products[i].productOrigin,
                products[i].productReleaseDate, 
                products[i].productDescription, 
                products[i].productImageHash, 
                products[i].productImageLink
            );
            
            const cipherProduct = this.encrypt(JSON.stringify(product), 'admin');

            await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));
        }
    }

    async createProduct(ctx, args) {
        const userType = await this.getCurrentUserType(ctx);
        if ((userType !== "admin") &&
            (userType !== "company"))
            throw new Error(`This user does not have access to create an product`);

        const productDetails = JSON.parse(args);

        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (productBuffer && productBuffer.length > 0) {
            throw new Error(`Error Message from createProduct. Product with productCode = ${productDetails.productCode} already exists.`);
        }

        const product = Product.deserializeProduct(args);
        const userId = await this.getCurrentUserId(ctx);
        const cipherProduct = this.encrypt(JSON.stringify(product), userId);

        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));

        try {
            await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(cipherProduct));
        }
        catch (error) {
            console.log("Error in sending createProduct event");
        }

        return {
            status: 'Successfully create a product',
            cipherProduct: `${cipherProduct}`
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
        const userId = await this.getCurrentUserId(ctx);
        const decipherProduct = this.decrypt(cipherProduct, userId);
        const product = Product.deserializeProduct(decipherProduct);

        if ((userId !== "admin")
            && (userId !== product.getCompanyId()))
            throw new Error(`${userId} does not have access to the details of product ${productCode}`);

        try {
            await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(product));
        }
        catch (error) {
            console.log("Error in sending readProduct event");
        }

        return {
            status: 'Successfully read a product',
            product: product
        };
    }

    async readAllProducts(ctx) {
        const userId = await this.getCurrentUserId(ctx);
        const userType = await this.getCurrentUserType(ctx);
        
        let queryString;
        switch (userType) {
            case "admin": {
                queryString = {
                    "selector": {}
                }
                break;
            }
            case "company": {
                queryString = {
                    "selector": {
                        "companyId": userId,
                    }
                }
                break;
            }
            default: {
                return [];
            }
        }

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allProducts = [];
        while (true) {
            const product = await iterator.next();
            
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
                    allProducts: allProducts
                };
            }
        }
    }

    async readProductHistory(ctx, productCode) {
        if (productCode.length < 1) {
            throw new Error('productCode is required as input')
        }

        const iterator = await ctx.stub.getHistoryForKey(productCode);
        const productHistory = [];
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
                    productHistory: productHistory
                };
            }
        }
    }

    async updateProduct(ctx, args) {
        const productDetails = JSON.parse(args);
        const productBuffer = await ctx.stub.getState(productDetails.productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from updateProduct: Product with productCode = ${productDetails.productCode} does not exist.`);
        }

        let cipherProduct = JSON.parse(productBuffer);
        const userId = await this.getCurrentUserId(ctx);
        const decipherProduct = this.decrypt(cipherProduct, userId);
        let product = Product.deserializeProduct(decipherProduct);
        if ((userId !== "admin") &&
            (userId !== product.getCompanyId()))
            throw new Error(`${userId} does not have access to update details for product ${product.getProductCode()}`);

        if (product.getProductBrand() !== productDetails.productBrand) {
            product.setProductBrand(productDetails.productBrand);
        }
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
        if (product.getProductImageHash() !== productDetails.productImageHash) {
            product.setProductImageHash(productDetails.productImageHash);
        }
        if (product.getProductImageLink() !== productDetails.productImageLink) {
            product.setProductImageLink(productDetails.productImageLink);
        }

        cipherProduct = this.encrypt(JSON.stringify(product), userId);

        await ctx.stub.putState(product.getProductCode(), Product.toBuffer(cipherProduct));

        try {
            await ctx.stub.setEvent(EVENT_NAME, Product.toBuffer(cipherProduct));
        }
        catch (error) {
            console.log("Error in sending updateProduct event");
        }

        return {
            status: 'Successfully update a product',
            product: cipherProduct
        };
    }

    async deleteProduct(ctx, productCode) {
        if (productCode.length < 1) {
            throw new Error('productCode required as input')
        }

        let productBuffer = await ctx.stub.getState(productCode);
        if (!productBuffer || productBuffer.length === 0) {
            throw new Error(`Error Message from deleteProduct: Product with productCode = ${productCode} does not exist.`);
        }

        const cipherProduct = JSON.parse(productBuffer);
        const userId = await this.getCurrentUserId(ctx);
        const decipherProduct = this.decrypt(cipherProduct, userId);
        const product = Product.deserializeProduct(decipherProduct);
        if ((userId !== "admin")
            && (userId !== product.getCompanyId()))
            throw new Error(`${userId} does not have access to delete product ${product.getProductCode()}`);

        await ctx.stub.deleteState(product.getProductCode());

        try {
            await ctx.stub.setEvent(EVENT_NAME, productCode);
        }
        catch (error) {
            console.log("Error in sending deleteProduct event");
        }

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
}

module.exports = ProductContract;
