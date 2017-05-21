// set up ========================
var express = require('express');
var app = express.Router(); // create our app w/ express
var fs = require("fs");
var path = require('path');


app.use(express.static(path.resolve('../client/dist'))); // set the static files location /public/img will be /img for users

app.get('/', function(req, res) {
    res.sendfile(path.resolve('../client/dist/index.html')); 
});

app.get('*/musicList', function(req, res) {

    fs.readdir("../client/dist/music/", function(err, files) {
        if (err) {
            return console.error(err);
        }

        res.json(files);

    });
});
module.exports = app;
