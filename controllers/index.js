// server.js

// set up ========================
var express = require('express');
var app = express.Router(); // create our app w/ express
var fs = require("fs");

app.get('/', function(req, res) {
    res.sendfile('./public/html/main.html'); 
});

app.get('*/musicList', function(req, res) {

    fs.readdir("./public/music/", function(err, files) {
        if (err) {
            return console.error(err);
        }

        res.json(files);

    });
});
module.exports = app;
