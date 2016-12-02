// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var Query = require('azure-query-js').Query;

module.exports = function(name, table) {
    var query;

    ['where', 'select', 'orderBy', 'orderByDescending', 'skip', 'take', 'includeTotalCount'].forEach(attachOperator);

    return table;

    function attachOperator(operator) {
        table[operator] = function () {
            if(!query) {
                query = new Query(name);
                query.read = function () {
                    return table.read(query);
                }
            }

            query[operator].apply(query, arguments);

            return query;
        };
    }
}
