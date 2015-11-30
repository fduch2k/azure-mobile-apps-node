// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
module.exports = function (configuration) {
    // these require statements must appear within this function to avoid circular reference issues between dynamicSchema and schema
    var statements = require('./statements'),
        execute = require('./execute'),
        dynamicSchema = require('./dynamicSchema'),
        promises = require('../../utilities/promises'),
        log = require('../../logger'),
        data = require('./index');

    var api = {
        initialize: function (table) {
            return api.createTable(table)
                .catch(function () {
                    return api.updateSchema(table);
                });
        },

        createTable: function(table, item) {
            log.info('Creating table ' + table.name);
            return execute(configuration, statements.createTable(table, item))
                .then(function () {
                    return execute(configuration, statements.createTrigger(table));
                })
                .then(function () {
                    return api.createIndexes(table);
                })
                .then(function () {
                    return api.seedData(table);
                });
        },

        updateSchema: function(table, item) {
            log.info('Updating schema for table ' + table.name);
            return execute(configuration, statements.getColumns(table))
                .then(function (columns) {
                    return execute(configuration, statements.updateSchema(table, columns, item));
                })
                .then(function () {
                    return api.createIndexes(table);
                });
        },

        createIndexes: function(table) {
            if(table.indexes) {
                if(Array.isArray(table.indexes)) {
                    log.info('Creating indexes for table ' + table.name);
                    return promises.all(
                        table.indexes.map(function (indexConfig) {
                            return execute(configuration, statements.createIndex(table, indexConfig));
                        })
                    );
                } else {
                    throw new Error('Index configuration of table \'' + table.name + '\' should be an array containing either strings or arrays of strings.');
                }
            } else {
                return promises.resolved();
            }
        },

        seedData: function (table) {
            if(table.seed)
                return promises.all(table.seed.map(insert));
            return promises.resolved();

            function insert(item) {
                return dynamicSchema(configuration).execute(table, statements.insert(table, item), item);
            }
        }
    };
    return api;
}
