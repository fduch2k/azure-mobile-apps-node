// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var https = require('https'),
    promises = require('../utilities/promises'),
    log = require('../logger');

module.exports = function (authConfiguration, token, provider) {
    return promises.create(function (resolve, reject) {
        var request = https.request({
            hostname: authConfiguration.gatewayUrl,
            path: '/api/tokens?tokenName=' + provider + '&api-version=2015-01-14',
            headers: {
                'x-zumo-auth': token
            }
        }, resolve);

        request.on('error', function (error) {
            log.error('Could not retrieve identity from gateway', error);
            console.error(error);
            reject(error);
        });
        request.end();
    });
};
