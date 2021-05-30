/*
 *  SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const fixtures = path.resolve(__dirname, '../../network');

// A wallet stores a collection of identities
const wallet = new FileSystemWallet('./wallet');

async function main() {

    // Main try/catch block
    try {

        let credPath, cert, key, identityLabel, identity;

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/Admin@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/4837617a6dd2783c9e36b776407b7b6e65987c1a1bbce1dbb76b8d78d7ceacd7_sk')).toString();
        identityLabel = 'Admin@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import admin');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User1@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/0cfb64a784f75f25f65d1fc2f3b9bd78a5c78a24b511b5d021229db10a166805_sk')).toString();
        identityLabel = 'User1@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user1');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User2@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User2@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/3ea2ac893ff106cbe584ee1d40c845776f4b3ca87ef2d75d385177909b520d49_sk')).toString();
        identityLabel = 'User2@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user2');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User3@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User3@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/e132ad3150a29b91fa17d12ce4a1c19dcd508cb8d976d782bfdc032498623abc_sk')).toString();
        identityLabel = 'User3@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user3');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User4@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User4@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/d2874d5380cbae56fec4cd354e7312dac081c09706ebbe65b73ea05ea4a0e73f_sk')).toString();
        identityLabel = 'User4@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user4');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User5@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User5@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/3c5589b4d0b08b2e89ed446aa208f67660fef4349f7bccf7fa149265bd505b36_sk')).toString();
        identityLabel = 'User5@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user5');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User6@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User6@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/cd99a33464e8d905df2ac0ecc2e2f4c93294994d63d95e8f650287d55b8ba208_sk')).toString();
        identityLabel = 'User6@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user6');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User7@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User7@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/af24cdbd0b90081f8d89580e7cb8991355245b2141029b68a0b22b4140274825_sk')).toString();
        identityLabel = 'User7@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user7');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User8@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User8@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/0374c8fb2cd31a59d85f7c11b1e619ffdae5f336549968106582652551d19e71_sk')).toString();
        identityLabel = 'User8@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user8');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User9@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User9@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/20b3043e1f044efe07553e04e27a1919ba6722686db20303a04a3887e9c2ae64_sk')).toString();
        identityLabel = 'User9@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user9');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User10@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User10@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/0d65f03ab9009bc2d1eeef54672fc22ef95f89563520dded3dcccdc2c92c4e08_sk')).toString();
        identityLabel = 'User10@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user10');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User11@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User11@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/455ee3f7e0546ea52008050375433a47b0536fdd96664b2fd7cf0ac6ee82117e_sk')).toString();
        identityLabel = 'User11@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user11');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User12@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User12@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/2c0fdd90f0256ead242fe6e38b032eb37ded9241493f9d453c58f96703e33c65_sk')).toString();
        identityLabel = 'User12@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user12');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User13@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User13@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/408afe4009795adcecd7c91df5e632bc6d4d1d4270784d4847f8a079cad8a387_sk')).toString();
        identityLabel = 'User13@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user13');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User14@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User14@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/fd0daf266c498fd8eb15dc5970a1dadd105e7833b408b4acfee31e3d6c198d8f_sk')).toString();
        identityLabel = 'User14@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user14');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User15@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User15@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/703bdb1775b3c3a2f9ec097e421915d2b8cbbf77bb814533d050d6838a17e754_sk')).toString();
        identityLabel = 'User15@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user15');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User16@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User16@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/2a7767b5bef56f0f10828b87de9b9982308b33f413cfded85692d67cd6ab3fce_sk')).toString();
        identityLabel = 'User16@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user16');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User17@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User17@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/e819b07f5c8324b56c1d47e29b7e8ed2f9296ef532d913131a472369ed14a708_sk')).toString();
        identityLabel = 'User17@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user17');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User18@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User18@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/f2d0f06f919dc49425a94598dad3b6bf1445bfa487f8006efb524d82f870910c_sk')).toString();
        identityLabel = 'User18@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user18');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User19@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User19@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/854e4cbaff4e7396241b154d72e0f567db1e8d6f52a53571cc5317e03f375cf5_sk')).toString();
        identityLabel = 'User19@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user19');

        credPath = path.join(fixtures, '/crypto-config/peerOrganizations/org1.example.com/users/User20@org1.example.com');
        cert = fs.readFileSync(path.join(credPath, '/msp/signcerts/User20@org1.example.com-cert.pem')).toString();
        key = fs.readFileSync(path.join(credPath, '/msp/keystore/994a32a71bb36255f9b5d4b58974dd5bd577648ccf11277aaeaf7e0b998fb629_sk')).toString();
        identityLabel = 'User20@org1.example.com';
        identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        await wallet.import(identityLabel, identity);
        console.log('import user20');

        
    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});