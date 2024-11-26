'use strict';
const util = require('util');
const Path = require('path');
const axios = require("axios");
const JWT = require(Path.join(__dirname, '../..', 'lib', 'jwtDecoder.js'));

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for /edit/ route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {
    // Edit request
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {
    // Save request
    logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {
    // Public request
    logData(req);
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {
    // Validate request
    logData(req);
    res.send(200, 'Validate');
};

/*
 * POST Handler for /stop/ route of Activity.
 */
exports.stop = async (req, res) => {
    // Stop request
    logData(req);
    res.send(200, 'Validate');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = async (req, res) => {

    let channel = '@VCB_poc';
    let contact = '632717898';
    const token = '8091993565:AAE_BFhW4GU3e1702RlwdUTycr_DL1gOhBo';
    const endpoint = 'https://api.telegram.org/bot';
    const url = `${endpoint}${token}/`;

    let contactKey = req.body.keyValue;
    let inArguments = req.body.inArguments;

    console.log('Contact Key: ------------------------------------------------------');
    console.log(contactKey);
    console.log('InArguments: ------------------------------------------------------');
    console.log(inArguments);
    // console.log(fln + ' Complete Request!')

    try {
        if (inArguments) {
            const customMessage = inArguments[2]['customMessage'];
            const response = await axios.get(`${url}sendMessage?chat_id=${contact}&text=${customMessage}`);
            console.log(response)
            // Process decode JWT
            // JWT(req.body, process.env.jwtSecret, (err, decoded) => {

            //     // verification error -> unauthorized request
            //     if (err) {
            //         console.error(err);
            //         return res.status(401).end();
            //     }

            //     if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            //         // decoded in arguments
            //         var decodedArgs = decoded.inArguments[0];
            //         logData(req);
            //         res.send(200, 'Execute');
            //     } else {
            //         console.error('inArguments invalid.');
            //         return res.status(400).end();
            //     }
            // });
            // res.send(response.data);
            res.send('Complete Request!');
        }
    } catch (error) {
        console.error("Error triggering API call:", error);
        res.status(500).send("Error triggering API call");
    }
};