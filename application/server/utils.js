'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const path = require('path');
const { FileSystemWallet, Gateway, User, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const {K768_Decrypt} = require('../../contract/lib/crystals-kyber/index.js');
const Crypto = require('crypto');

//  global variables for HLFabric
var gateway;
var network;
var contract = null;
var configdata;
var wallet;
var bLocalHost;
var ccp;
var orgMSPID;
const EVENT_TYPE = "productContractEvent";  //  HLFabric EVENT

const SUCCESS = 0;
const utils = {};
const { inspect } = require('util');

utils.prepareErrorResponse = (error, code, message) => {
    let errorMsg;
    try {
        // Pull specific fabric transaction error message out of error stack
        let entries = Object.entries(error);
        errorMsg = entries[0][1][0]["message"];
    } catch (exception) {
        // Error wasn't sent from fabric, so can't pull error out.
        errorMsg = null;
    }

    let result = { "code": code, "message": errorMsg?errorMsg:message, "error": error };
    console.log("utils.js:prepareErrorResponse(): " + message);
    console.log(result);
    return result;
}

utils.connectGatewayFromConfig = async () => {
    console.log(">>>connectGatewayFromConfig:  ");

    // A gateway defines the peers used to access Fabric networks
    gateway = new Gateway();

    try {

        // Read configuration file which gives
        //  1.  connection profile - that defines the blockchain network and the endpoints for its CA, Peers
        //  2.  network name
        //  3.  channel name
        //  4.  wallet - collection of certificates
        //  5.  username - identity to be used for performing transactions

        const platform = process.env.PLATFORM || 'LOCAL';
        configdata = JSON.parse(fs.readFileSync('../../gateway/config.json', 'utf8'));
        console.log("Platform = " + platform);
        bLocalHost = true;

        const walletpath = configdata["wallet"];
        console.log("walletpath = " + walletpath);

        // Parse the connection profile. This would be the path to the file downloaded
        // from the IBM Blockchain Platform operational console.
        const ccpPath = path.resolve(__dirname, configdata["connection_profile_filename"]);
        var userid = process.env.FABRIC_USER_ID || "admin";
        var pwd = process.env.FABRIC_USER_SECRET || "adminpw";
        var usertype = process.env.FABRIC_USER_TYPE || "admin";
        console.log('user: ' + userid + ", pwd: ", pwd + ", usertype: ", usertype);

        // Load connection profile; will be used to locate a gateway
        ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Set up the MSP Id
        orgMSPID = ccp.client.organization;
        console.log('MSP ID: ' + orgMSPID);

        // Open path to the identity wallet
        wallet = new FileSystemWallet(walletpath);

        const idExists = await wallet.exists(userid);
        if (!idExists) {
            // Enroll identity in the wallet
            console.log(`Enrolling and importing ${userid} into wallet`);
            await utils.enrollUser(userid, pwd, usertype);
        }

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await gateway.connect(ccp, {
            identity: userid, wallet: wallet, discovery: { enabled: true, asLocalhost: bLocalHost }
        });

        // Access channel: channel_name
        console.log('Use network channel: ' + configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        network = await gateway.getNetwork(configdata["channel_name"]);
        console.log('Use ' + configdata["smart_contract_name"] + ' smart contract.');

        //  this variable, contract will be used in subsequent calls to submit transactions to Fabric
        contract = await network.getContract(configdata["smart_contract_name"]);

    } catch (error) {
        console.log('Error connecting to Fabric network. ' + error.toString());
    } finally {
    }
    return contract;
}

utils.events = async () => {
    // get an eventhub once the fabric client has a user assigned. The user
    // is required because the event registration must be signed

    //  Eventhub is attached to a peer.  Get the peer, to register an event hub.
    //  client -> channel -> peer -> eventHub

    const client = gateway.getClient();
    var channel = client.getChannel(configdata["channel_name"]);
    var peers = channel.getChannelPeers();
    if (peers.length == 0) {
        throw new Error("Error after call to channel.getChannelPeers(): Channel has no peers !");
    }

    console.log("Connecting to event hub..." + peers[0].getName());
    //  Assuming that we want to connect to the first peer in the peers list
    var channel_event_hub = channel.getChannelEventHub(peers[0].getName());

    // to see the event payload, use 'true' in the call to channel_event_hub.connect(boolean)
    channel_event_hub.connect(true);

    let event_monitor = new Promise((resolve, reject) => {
        /*  Sample usage of registerChaincodeEvent
        registerChaincodeEvent ('chaincodename', 'regularExpressionForEventName',
               callbackfunction(...) => {...},
               callbackFunctionForErrorHandling (...) => {...},
               // options:
               {startBlock:23, endBlock:30, unregister: true, disconnect: true}
        */
        var regid = channel_event_hub.registerChaincodeEvent(configdata["smart_contract_name"], EVENT_TYPE,
            (event, block_num, txnid, status) => {
                // This callback will be called when there is a chaincode event name
                // within a block that will match on the second parameter in the registration
                // from the chaincode with the ID of the first parameter.

                //let event_payload = JSON.parse(event.payload.toString());

                console.log("Event payload: " + event.payload.toString());
                console.log(`Block Number: ${block_num} Transaction ID: ${txnid} Status: ${status}`);
                console.log("\n------------------------------------");
            }, (err) => {
                // this is the callback if something goes wrong with the event registration or processing
                reject(new Error('There was a problem with the eventhub in registerTxEvent ::' + err));
            },
            { disconnect: false } //continue to listen and not disconnect when complete
        );
    }, (err) => {
        console.log("At creation of event_monitor: Error:" + err.toString());
        throw (err);
    });

    Promise.all([event_monitor]);
}

utils.submitTx = async (contract, txName, ...args) => {
    console.log(">>>utils.submitTx..."+txName+" ("+args+")");
    let result = contract.submitTransaction(txName, ...args);
    return result.then (response => {
        // console.log ('Transaction submitted successfully;  Response: ', response.toString());
        console.log ('utils.js: Transaction submitted successfully');
        return Promise.resolve(response.toString());
    },(error) =>
        {
          console.log ('utils.js: Error:' + error.toString());
          return Promise.reject(error);
        });
}

utils.evalTx = async (contract, txName, ...args) => {
    console.log(">>>utils.evalTx..."+txName+" ("+args+")");
    let result = contract.evaluateTransaction(txName, ...args);
    return result.then (response => {
        // console.log ('Transaction submitted successfully;  Response: ', response.toString());
        console.log ('utils.js: Transaction evaluated successfully');
        return Promise.resolve(response.toString());
    },(error) =>
        {
          console.log ('utils.js: Error:' + error.toString());
          return Promise.reject(error);
        });
}

utils.queryTransactionByID = async (trId) => {      
    console.log(">>>utils.queryTransactionByID... trId"+trId);
    const client = gateway.getClient();
    const channel = client.getChannel(configdata["channel_name"]);
    const peers = channel.getChannelPeers();

    let response_payload = channel.queryTransaction(trId, peers[0].getName());
    return response_payload.then(response => {
        const writeSet = response.transactionEnvelope
                            .payload
                            .data
                            .actions[0]
                            .payload
                            .action
                            .proposal_response_payload
                            .extension
                            .results
                            .ns_rwset[1]
                            .rwset
                            .writes[0];
        const writeSetValue = JSON.parse(writeSet.value);
        const productDetails = writeSetValue.detail;
        const cipherKey = writeSetValue.cipherKey;

        const userWallet = require.resolve(`../../contract/lib/wallet/admin/sk-K768.txt`);
        let secretKey;
        try {
            secretKey = fs.readFileSync(`${userWallet}`, 'utf8');
            secretKey = secretKey.split(",").map(Number);
          } catch (err) {
            console.error('Error: ', err);
        }
        
        const symKey = K768_Decrypt(cipherKey, secretKey);
        const symBuffer = Buffer.from(symKey);
        const decipher = Crypto.createDecipher('aes256', symBuffer);    
        let decrypted = decipher.update(productDetails, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return Promise.resolve({
            status: "Successfully read product by transaction ID",
            isDeleted: writeSet.is_delete,
            result: JSON.parse(decrypted.toString())
        });
    },(error) =>
        {
            console.log ('utils.js: Error:' + error.toString());
            return Promise.reject(error);
        });
}

utils.registerUser = async (userid, userpwd, usertype, adminIdentity) => {
    console.log("\n------------  utils.registerUser ---------------");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype: " + usertype)

    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });

    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });

    var newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role: "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
        maxEnrollments: 5
    };

    //  Register is done using admin signing authority
    return ca.register(newUserDetails, gateway.getCurrentIdentity())
        .then(newPwd => {
            //  if a password was set in 'enrollmentSecret' field of newUserDetails,
            //  the same password is returned by "register".
            //  if a password was not set in 'enrollmentSecret' field of newUserDetails,
            //  then a generated password is returned by "register".
            console.log('\n Secret returned: ' + newPwd);
            return {
                status: 'Successfully register new user!',
                result: {
                    enrollmentID: userid,
                    enrollmentSecret: userpwd ? userpwd : newPwd,
                }
            };
        }, error => {
            console.log('Error in register();  ERROR returned: ' + error.toString());
            return Promise.reject(error);
        });
}

utils.enrollUser = async (userid, userpwd, usertype) => {
    console.log("\n------------  utils.enrollUser -----------------");
    console.log("userid: " + userid + ", pwd: " + userpwd + ", usertype:" + usertype);

    // get certificate authority
    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });

    var newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        attrs: [
            {
                "name": "usertype", // application role
                "value": usertype,
                "ecert": true
            }]
    };

    return ca.enroll(newUserDetails).then(enrollment => {
        //console.log("\n Successful enrollment; Data returned by enroll", enrollment.certificate);
        var identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        return wallet.import(userid, identity).then(notused => {
            return {
                status: 'Successfully enroll user and import into the wallet!'
            };
        }, error => {
            console.log("error in wallet.import\n" + error.toString());
            throw error;
        });
    }, error => {
        console.log("Error in enrollment " + error.toString());
        throw error;
    });
}

utils.setUserContext = async (userid, pwd) => {
    console.log('\n>>>setUserContext...');

    // It is possible that the user has been registered and enrolled in Fabric CA earlier
    // and the certificates (in the wallet) could have been removed.
    // Note that this case is not handled here.

    // Verify if user is already enrolled
    const userExists = await wallet.exists(userid);
    if (!userExists) {
        console.log("An identity for the user: " + userid + " does not exist in the wallet");
        console.log('Enroll user before retrying');
        throw ("Identity does not exist for userid: " + userid);
    }

    try {
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway with userid:' + userid);
        let userGateway = new Gateway();
        await userGateway.connect(ccp, { identity: userid, wallet: wallet, discovery: { enabled: true, asLocalhost: bLocalHost } });

        network = await userGateway.getNetwork(configdata["channel_name"]);
        contract = await network.getContract(configdata["smart_contract_name"]);

        return contract;
    }
    catch (error) { throw (error); }
}

utils.isUserEnrolled = async (userid) => {
    return wallet.exists(userid).then(result => {
        return Promise.resolve({
            status: 'Successfully check if user is enrolled!',
            isEnrolled: result
        });
    }, error => {
        console.log("error in wallet.exists\n" + error.toString());
        throw error;
    });
}

utils.getUser = async (userid, adminIdentity) => {
    console.log(">>>getUser...");
    const gateway = new Gateway();
    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = await idService.getOne(userid, gateway.getCurrentIdentity());
    let result = {"id": userid};

    // for admin, usertype is "admin";
    if (userid == "admin") {
        result.usertype = userid;
    } else { // look through user attributes for "usertype"
        let j = 0;
        while (user.result.attrs[j].name !== "usertype") j++;
            result.usertype = user.result.attrs[j].value;
    }
    console.log (result);
    return Promise.resolve({
        status: 'Successfully get current user logged in!',
        result: result
    });
}

utils.getAllUsers = async (adminIdentity) => {
    const gateway = new Gateway();
    
    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = gateway.getCurrentIdentity();
    let userList = await idService.getAll(user);
    let identities = userList.result.identities;
    let result = [];
    let tmp;
    let attributes;

    // for all identities
    for (var i = 0; i < identities.length; i++) {
        tmp = {};
        tmp.id = identities[i].id;
        tmp.usertype = "";

        if (tmp.id == "admin")
            tmp.usertype = tmp.id;
        else {
            attributes = identities[i].attrs;
            // look through all attributes for one called "usertype"
            for (var j = 0; j < attributes.length; j++)
                if (attributes[j].name == "usertype") {
                    tmp.usertype = attributes[j].value;
                    break;
                }
        }
        result.push(tmp);
    }
    
    return Promise.resolve({
        status: 'Successfully get all registered user!',
        result: result
    });
}

utils.getRandomNum = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    return `${s4()}${s4()}${s4()}${s4()}`
}

module.exports = utils;