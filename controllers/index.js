// server.js

    // set up ========================
    var express  = require('express');
    var app      =  express.Router();                            // create our app w/ express

    app.get('/home', function(req, res) {
        res.sendfile('./public/html/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    app.get('*/home2', function(req, res) {
        res.sendfile('./public/html/animated-background.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    app.get('*/home3', function(req, res) {
        res.sendfile('./public/html/scrolling-divs.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    app.get('*/home4', function(req, res) {
        res.sendfile('./public/html/misc_controls_pointerlock.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

        app.get('*/home5', function(req, res) {
        res.sendfile('./public/html/main.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
    module.exports = app;