// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
The azure-mobile-apps module is the Nodejs implementation of Azure Mobile Apps
@module azure-mobile-apps
@see {@link http://azure.microsoft.com/en-us/services/app-service/mobile/ Azure Mobile Apps}
*/

var loadConfiguration = require('./configuration'),
    environment = require('./utilities/environment'),
    table = require('./express/tables/table'),
    logger = require('./logger'),
    assign = require('deeply'),
    path = require('path'),

    platforms = {
        express: require('./express'),
    },

    defaults = {
        platform: 'express',
        basePath: path.dirname(module.parent.filename),
        configFile: 'azureMobile',
        promiseConstructor: Promise,
        apiRootPath: '/api',
        tableRootPath: '/tables',
        debug: environment.debug,
        version: 'node-' + require('../package.json').version,
        maxTop: 1000,
        logging: {
            level: environment.debug ? 'debug' : 'info',
            transports: {
                Console: {
                    colorize: true,
                    timestamp: true,
                    showLevel: true
                }
            }
        },
        cors: {
            maxAge: 300,
            origins: ['localhost']
        },
        data: {
            provider: 'memory',
            schema: 'dbo',
            dynamicSchema: true
        },
        notifications: { },
        auth: { }
    };

/**
Creates an instance of the azure-mobile-apps server object for the platform specified in the configuration.
Express 4.x is currently the only supported platform.
@param {configuration} configuration
@returns {module:azure-mobile-apps/express}
*/
module.exports = function (configuration) {
    configuration = configuration || {};
    var configFile = path.resolve(configuration.basePath || defaults.basePath, configuration.configFile || defaults.configFile);
    configuration = assign({ logging: {}, data: {}, auth: {} }, loadConfiguration.fromFile(configFile), defaults, configuration);
    loadConfiguration.fromEnvironment(configuration);
    loadConfiguration.fromSettingsJson(configuration);

    return platforms[configuration.platform](configuration);
};

module.exports.table = table;
