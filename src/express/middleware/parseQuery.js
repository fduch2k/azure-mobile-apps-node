// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var queries = require('../../query');

// parse OData query from querystring into queryjs query object and attach to request object
module.exports = function (table) {
    return function (req, res, next) {
        var context = req.azureMobile;

        context.table = table;

        if(req.params.id) {
            context.id = req.params.id;
            context.query = queries.create(table.name).where({ id: context.id });
            context.query.id = context.id;
            context.query.single = true;
        } else {
            enforceMaxTop();
            context.query = queries.fromRequest(req);
        }

        if(req.query.__includeDeleted)
            context.query.includeDeleted = true;

        var etag = req.get('if-match');
        if(etag)
            context.version = etag;

        next();

        function enforceMaxTop() {
            if(table.maxTop) {
                var top = req.query.$top;
                if(top > table.maxTop) {
                    var error = new Error("You cannot request more than " + table.maxTop + " records");
                    error.badRequest = true;
                    next(error);
                }
                if(!top)
                    req.query.$top = table.maxTop
            }
        }
    };
};
