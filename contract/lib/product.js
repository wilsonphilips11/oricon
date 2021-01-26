'use strict';

class Product {

    constructor(productId, companyId, productName, productCode, productPrice, productDescription, productImageHash, productImageLink) {
        this.productId = productId;
        this.companyId = companyId;
        this.productName = productName;
        this.productCode = productCode;
        this.productPrice = productPrice;
        this.productDescription = productDescription;
        this.productImageHash = productImageHash;
        this.productImageLink = productImageLink;
    }

    setProductName(productName) {
        this.productName = productName;
    }

    setProductPrice(productPrice) {
        this.productPrice = productPrice;
    }

    setProductDescription(productDescription) {
        this.productDescription = productDescription;
    }

    setProductImageHash(productImageHash) {
        this.productImageHash = productImageHash;
    }

    setProductImageLink(productImageLink) {
        this.productImageLink = productImageLink;
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static fromBuffer(buffer) {
        return Product.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    static deserialize(data) {
        let product_details = JSON.parse(data.toString());
        let product = new Product(
            product_details.productId,
            product_details.companyId, 
            product_details.productName, 
            product_details.productCode, 
            product_details.productPrice, 
            product_details.productDescription, 
            product_details.productImageHash, 
            product_details.productImageLink
        );
        return product;
    }

}

module.exports = Product;