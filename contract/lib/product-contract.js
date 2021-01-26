'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Product = require('./product.js');
const EVENT_TYPE = "productContractEvent";

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
        console.info('============= START : Initialize Ledger ===========');
        const products = [
            {
                productId: '001',
                companyId: '123123',
                productName: 'Lorem Ipsum',
                productCode: '123123',
                productPrice: 123123,
                productDescription: 'Lorem Ipsum',
                productImageHash: 'Lorem Ipsum',
                productImageLink: 'Lorem Ipsum',
            },
            {
                productId: '002',
                companyId: '123123',
                productName: 'Lorem Ipsum',
                productCode: '123123',
                productPrice: 123123,
                productDescription: 'Lorem Ipsum',
                productImageHash: 'Lorem Ipsum',
                productImageLink: 'Lorem Ipsum',
            },
            {
                productId: '003',
                companyId: '123123',
                productName: 'Lorem Ipsum',
                productCode: '123123',
                productPrice: 123123,
                productDescription: 'Lorem Ipsum',
                productImageHash: 'Lorem Ipsum',
                productImageLink: 'Lorem Ipsum',
            }
        ];

        for (let i = 0; i < products.length; i++) {
            let product = new Product(
                products[i].productId, 
                products[i].companyId,
                products[i].productName, 
                products[i].productCode,
                products[i].productPrice.toString(),
                products[i].productDescription,
                products[i].productImageHash,
                products[i].productImageLink
            );

            await ctx.stub.putState(product.productId, product.toBuffer());
            
            console.info('Added <--> ', products[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createProduct(ctx, args) {
        let userType = await this.getCurrentUserType(ctx);
        if ((userType != "admin") &&
            (userType != "company"))
            throw new Error(`This user does not have access to create an product`);

        const product_details = JSON.parse(args);
        const productId = product_details.productId;
        console.log("incoming asset fields: " + JSON.stringify(product_details));

        let productAsBytes = await ctx.stub.getState(productId);
        if (productAsBytes && productAsBytes.length > 0) {
            throw new Error(`Error Message from createProduct. Product with productId = ${productId} already exists.`);
        }

        let product = new Product(
            product_details.productId, 
            product_details.companyId, 
            product_details.productName, 
            product_details.productCode,
            product_details.productPrice.toString(),
            product_details.productDescription,
            product_details.productImageHash,
            product_details.productImageLink
        );

        await ctx.stub.putState(product.productId, product.toBuffer());

        try {
            await ctx.stub.setEvent(EVENT_TYPE, product.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }

        return product.toBuffer();
    }

    async readProduct(ctx, productId) {
        if (productId.length < 1) {
            throw new Error('productId is required as input')
        }
        console.log("input, productId = " + productId);
        
        let productAsBytes = await ctx.stub.getState(productId);

        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Error Message from readProduct. Product with productId = ${productId} does not exists.`);
        }
        
        let product = Product.deserialize(productAsBytes);
        let userId = await this.getCurrentUserId(ctx);
        if ((userId != "admin")
            && (userId != product.companyId))
            throw new Error(`${userId} does not have access to the details of product ${productId}`);

        try {
            await ctx.stub.setEvent(EVENT_TYPE, productAsBytes);
        }
        catch (error) {
            console.log("Error in sending event");
        }

        return productAsBytes;
    }

    async readAllProducts(ctx) {
        let userId = await this.getCurrentUserId(ctx);
        let userType = await this.getCurrentUserType(ctx);
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
            case "customer": {
                queryString = {
                    "selector": {},
                    "fields": ["productId", "companyId", "productName", "productPrice", "productDescription", "productImageHash", "productImageLink"],
                }
                break;
            }
            default: {
                return [];
            }
        }
        console.log("In queryAllProducts: queryString = ");
        console.log(queryString);

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allProducts = [];
        while (true) {
            const product = await iterator.next();
            
            if (product.value && product.value.value.toString()) {
                console.log(product.value.value.toString('utf8'));
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
                console.log('end of data');
                await iterator.close();
                console.info(allProducts);
                return allProducts;
            }
        }
    }

    async readProductHistory(ctx, productId) {
        if (productId.length < 1) {
            throw new Error('productId is required as input')
        }
        console.log("input, productId = " + productId);

        const iterator = await ctx.stub.getHistoryForKey(productId);        

        const productHistory = [];
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
                console.log('end of data');
                await iterator.close();
                console.info(productHistory);
                return productHistory;
            }
        }
    }

    async updateProduct(ctx, args) {
        const product_details = JSON.parse(args);
        const productId = product_details.productId;

        let productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Error Message from updateProduct: Product with productId = ${productId} does not exist.`);
        }

        let product = Product.deserialize(productAsBytes);
        let userId = await this.getCurrentUserId(ctx);
        if ((userId != "admin") &&
            (userId != product.companyId))
            throw new Error(`${userId} does not have access to update details for product ${productId}`);

        if (product.productName !== product_details.productName) {
            product.setProductName(product_details.productName);
        }
        if (product.productPrice !== product_details.productPrice) {
            product.setProductPrice(product_details.productPrice.toString());
        }
        if (product.productDescription !== product_details.productDescription) {
            product.setProductDescription(product_details.productDescription);
        }
        if (product.productImageHash !== product_details.productImageHash) {
            product.setProductImageHash(product_details.productImageHash);
        }
        if (product.productImageLink !== product_details.productImageLink) {
            product.setProductImageLink(product_details.productImageLink);
        }

        await ctx.stub.putState(productId, product.toBuffer());

        try {
            await ctx.stub.setEvent(EVENT_TYPE, product.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }

        return product.toBuffer();
    }

    async deleteProduct(ctx, productId) {
        if (productId.length < 1) {
            throw new Error('Product Id required as input')
        }
        console.log("productId = " + productId);

        let productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Error Message from deleteProduct: Product with productId = ${productId} does not exist.`);
        }

        let product = Product.deserialize(productAsBytes);
        let userId = await this.getCurrentUserId(ctx);
        if ((userId != "admin")
            && (userId != product.companyId))
            throw new Error(`${userId} does not have access to delete product ${productId}`);

        await ctx.stub.deleteState(productId);

        try {
            await ctx.stub.setEvent(EVENT_TYPE, productId);
        }
        catch (error) {
            console.log("Error in sending event");
        }
    }

    async getCurrentUserId(ctx) {
        let id = [];
        id.push(ctx.clientIdentity.getID());
        let begin = id[0].indexOf("/CN=");
        let end = id[0].lastIndexOf("::/C=");
        let userid = id[0].substring(begin + 4, end);
        return userid;
    }

    async getCurrentUserType(ctx) {
        let userid = await this.getCurrentUserId(ctx);
        if (userid == "admin") {
            return userid;
        }
        return ctx.clientIdentity.getAttributeValue("usertype");
    }
}

module.exports = ProductContract;
