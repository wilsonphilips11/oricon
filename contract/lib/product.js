'use strict';

class Product {

    constructor(txId, productCode, productName, productPrice, productOrigin, productReleaseDate, productDescription, productImageBase64) {
        this.productTxId = txId;
        this.productCode = productCode;
        this.productName = productName;
        this.productPrice = productPrice;
        this.productOrigin = productOrigin;
        this.productReleaseDate = productReleaseDate;
        this.productDescription = productDescription;
        this.productImageBase64 = productImageBase64;
    }
    
    setProductName(productName) {
        this.productName = productName;
    }

    setProductPrice(productPrice) {
        this.productPrice = productPrice;
    }

    setProductOrigin(productOrigin) {
        this.productOrigin = productOrigin;
    }

    setProductReleaseDate(productReleaseDate) {
        this.productReleaseDate = productReleaseDate;
    }

    setProductDescription(productDescription) {
        this.productDescription = productDescription;
    }

    setProductImageBase64(productImageBase64) {
        this.productImageBase64 = productImageBase64;
    }

    getProductTxId() {
        return this.productTxId;
    }

    getProductCode() {
        return this.productCode;
    }

    getProductName() {
        return this.productName;
    }

    getProductPrice() {
        return this.productPrice;
    }

    getProductOrigin() {
        return this.productOrigin;
    }

    getProductReleaseDate() {
        return this.productReleaseDate;
    }

    getProductDescription() {
        return this.productDescription;
    }

    getProductImageBase64() {
        return this.productImageBase64;
    }

    static toBuffer(buffer) {
        return Buffer.from(JSON.stringify(buffer));
    }

    static deserializeProduct(productData) {
        const productDetails = JSON.parse(productData.toString());
        const product = new Product(
            productDetails.txId,
            productDetails.productCode,
            productDetails.productName,  
            productDetails.productPrice,
            productDetails.productOrigin,
            productDetails.productReleaseDate, 
            productDetails.productDescription, 
            productDetails.productImageBase64
        );
        return product;
    }

}

module.exports = Product;