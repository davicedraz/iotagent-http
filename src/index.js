'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const MicroService = require('@dojot/iotagent-nodejs');

const HttpAgent = require('./HttpAgent');

const iotAgent = new MicroService.IoTAgent();

iotAgent.init().then(() => {
    const server = express();

    const context = {
        port: process.env.SERVER_PORT || 8002,
        service: iotAgent,
        server
    };

    context.server.use(bodyParser.json());
    const httpAgent = new HttpAgent(context);

    httpAgent.init().then(() => {
        app.listenUserData(httpAgent);
    });

}).catch((error) => {
    console.log(`Failed to initialize the basic IoT agent: ${error}`);
    process.exit(1);
});
