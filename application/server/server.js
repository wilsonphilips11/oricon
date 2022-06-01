'use strict';

// Classes for Node Express
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const utils = require('./utils.js');
const bodyParser = require('body-parser');

const productAuthenticationRoute = require('./productAuthentication.js');

// Start up the Express functions to listen on server side
app.use(bodyParser.json({limit: '5mb'}));
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});
app.use(cors());

//  routes defined
app.use('/api', productAuthenticationRoute);

app.get('/ping', (req, res) => {
    res.send('Response from Product Authentication backend server');
});

async function main() {

    try {
        await utils.connectGatewayFromConfig ();
        await utils.events();
    } catch (error) {
        return console.log ('Error in connecting to Fabric network. ', error);
    }

    const port = process.env.PORT || 3000;
    app.listen(port, (error) => {
        if (error) {
            return console.log('Error: ' + err);
        }
        console.log(`Server listening on ${port}`)
    });
}


main();