// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var helpers = require('../helpers'),
    _ = require('lodash');

module.exports = function (table, item) {
    var tableName = helpers.formatTableName(table.schema || 'dbo', table.name),
        columnNames = [],
        valueParams = [],
        parameters = [];

    Object.keys(item).forEach(function (prop) {
        if (helpers.isSystemProperty(prop)) {
            var err = new Error('Cannot insert item with property ' + prop + ' as it is reserved');
            err.badRequest = true;
            throw err;
        }

        // ignore the property if it is an autoIncrement id
        if ((prop !== 'id' || !table.autoIncrement) && item[prop] !== undefined) {
            columnNames.push(helpers.formatMember(prop));
            valueParams.push('@' + prop);
            parameters.push({ name: prop, value: item[prop], type: helpers.getMssqlType(item[prop], prop === 'id') });
        }
    });

    var sql = columnNames.length > 0
        ? templates["INSERT INTO %s (%s) VALUES (%s); "]({table: tableName, columns: columnNames.join(','), values: valueParams.join(',')})
        : templates["INSERT INTO %s DEFAULT VALUES; "]({table: tableName})

    if(table.autoIncrement)
        sql += templates['SELECT * FROM %s WHERE [id] = SCOPE_IDENTITY()']({table: tableName});
    else
        sql += templates['SELECT * FROM %s WHERE [id] = @id']({table: tableName});

    return {
        sql: sql,
        parameters: parameters
    };
}

var templates = {
    'INSERT INTO %s (%s) VALUES (%s); ': _.template('INSERT INTO <%table%> (<%columns%>) VALUES (<%values%>); '),
    'INSERT INTO %s DEFAULT VALUES; ': _.template('INSERT INTO <%table%> DEFAULT VALUES; '),
    'SELECT * FROM %s WHERE [id] = SCOPE_IDENTITY()': _.template('SELECT * FROM <%table%> WHERE [id] = SCOPE_IDENTITY()'),
    'SELECT * FROM %s WHERE [id] = @id': _.template({table: tableName})
};
