'use strict';

class Product {

    constructor(productCode, companyId, productBrand, productName, productPrice, productOrigin, productReleaseDate, productDescription, productImageHash, productImageLink) {
        this.productCode = productCode;
        this.companyId = companyId;
        this.productBrand = productBrand;
        this.productName = productName;
        this.productPrice = productPrice;
        this.productOrigin = productOrigin;
        this.productReleaseDate = productReleaseDate;
        this.productDescription = productDescription;
        this.productImageHash = productImageHash;
        this.productImageLink = productImageLink;
    }

    setProductBrand(productBrand) {
        this.productBrand = productBrand;
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

    setProductImageHash(productImageHash) {
        this.productImageHash = productImageHash;
    }

    setProductImageLink(productImageLink) {
        this.productImageLink = productImageLink;
    }

    getProductCode() {
        return this.productCode;
    }

    getCompanyId() {
        return this.companyId;
    }

    getProductBrand() {
        return this.productBrand;
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

    getProductImageHash() {
        return this.productImageHash;
    }

    getProductImageLink() {
        return this.productImageLink;
    }

    static toBuffer(buffer) {
        return Buffer.from(JSON.stringify(buffer));
    }

    static deserializeProduct(productData) {
        const productDetails = JSON.parse(productData.toString());
        const product = new Product(
            productDetails.productCode,
            productDetails.companyId, 
            productDetails.productBrand, 
            productDetails.productName,  
            productDetails.productPrice,
            productDetails.productOrigin,
            productDetails.productReleaseDate, 
            productDetails.productDescription, 
            productDetails.productImageHash, 
            productDetails.productImageLink
        );
        return product;
    }

}

module.exports = Product;