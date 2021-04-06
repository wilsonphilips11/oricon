/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const {Kyber_KeyGen} = require('../../contract/lib/crystals-kyber');

async function main() {
    try {

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const walletContractPath = path.join(process.cwd(), '../../contract/lib/wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log(`Wallet Contact path: ${walletContractPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('admin', identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        
        fs.mkdirSync(`${walletContractPath}/admin`, {
            recursive: true,
            mode: 0o77
        });

        const keySize = [512, 768, 1024];

        for(let iterator = 0; iterator < keySize.length; iterator++) {
            let pk_sk = Kyber_KeyGen(keySize[iterator]);
            let pk = pk_sk[0].toString();
            let sk = pk_sk[1].toString();
    
            fs.appendFile(`${walletContractPath}/admin/pk-K${keySize[iterator]}.txt`, pk, function (err) {
                if (err) throw err;
                console.log('Saved admin K', keySize[iterator],' public key into the wallet!');
            });
            fs.appendFile(`${walletContractPath}/admin/sk-K${keySize[iterator]}.txt`, sk, function (err) {
                if (err) throw err;
                console.log('Saved admin K', keySize[iterator], 'private key into the wallet!');
            });
        }
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();
