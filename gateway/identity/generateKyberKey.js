const {Kyber_KeyGen} = require('../../contract/lib/crystals-kyber');
const fire = require('./fire.js');
const db = fire.firestore();

async function main() {
    try {
        const keySize = [512, 768, 1024];
        for(let iterator = 0; iterator < keySize.length; iterator++) {
            let pk_sk = Kyber_KeyGen(keySize[iterator]);
            let pk = pk_sk[0];
            let sk = pk_sk[1];

            await db.collection(`kyber-key`).doc(`pk-K${keySize[iterator]}`).set({
                pk: pk
            });
            console.log('Saved admin K', keySize[iterator],' public key into the firebase!');
            await db.collection(`kyber-key`).doc(`sk-K${keySize[iterator]}`).set({
                sk: sk
            });
            console.log('Saved admin K', keySize[iterator],' public key into the firebase!');
        }
        process.exit(1);
    } catch (error) {
        console.error(`Failed to generate kyber key: ${error}`);
        process.exit(1);
    }
}

main();