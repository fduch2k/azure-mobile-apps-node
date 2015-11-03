// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var helpers = require('../helpers'),
    mssql = require('mssql'),
    _ = require('lodash');

module.exports = function (table, item) {
    var tableName = helpers.formatTableName(table.schema || 'dbo', table.name),
        setStatements = [],
        versionValue,
        parameters = [];

    for (var prop in item) {
        if(item.hasOwnProperty(prop)) {
            var value = item[prop];

            if (prop.toLowerCase() === 'version') {
                versionValue = value;
            } else if (helpers.isSystemProperty(prop)) {
                var err = new Error('Cannot update item with property ' + prop + ' as it is reserved');
                err.badRequest = true;
                throw err;
            } else if (prop.toLowerCase() !== 'id') {
                setStatements.push(helpers.formatMember(prop) + ' = @' + prop);
                parameters.push({ name: prop, value: value, type: helpers.getMssqlType(value) });
            }
        }
    }

    var sql = templates["UPDATE %s SET %s WHERE [id] = @id "]({table: tableName, statements: setStatements.join(',')});
    parameters.push({ name: 'id', type: helpers.getMssqlType(item.id, true), value: item.id });

    if (versionValue) {
        sql += "AND [version] = @version ";
        parameters.push({ name: 'version', type: mssql.VarBinary, value: new Buffer(versionValue, 'base64') })
    }

    sql += templates["; SELECT @@ROWCOUNT as recordsAffected; SELECT * FROM %s WHERE [id] = @id"]({table: tableName});

    return {
        sql: sql,
        parameters: parameters,
        multiple: true
    };
};

var templates = {
    'UPDATE %s SET %s WHERE [id] = @id ': _.template('UPDATE <%table%> SET <%statements%> WHERE [id] = @id '),
    '; SELECT @@ROWCOUNT as recordsAffected; SELECT * FROM %s WHERE [id] = @id': _.template('; SELECT @@ROWCOUNT as recordsAffected; SELECT * FROM <%table%> WHERE [id] = @id')
}
