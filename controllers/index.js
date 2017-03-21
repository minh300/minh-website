// server.js

    // set up ========================
    var express  = require('express');
    var app      =  express.Router();                            // create our app w/ express

    app.get('*', function(req, res) {
        res.sendfile('./public/html/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    module.exports = app;