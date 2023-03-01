const fs = require("fs");
const path = require('path');
var headlessGL = require('gl');
var express = require('express')

const { PNGConverter } = require('./pngconverter.js');
const { STLRenderer } = require('./stlrenderer');
const { GIFConverter } = require('./gifconverter');
const { STLToGIF } = require('./stltogifconverter.js')

const port = 3000
var app = express()
app.listen(port, ()=> { console.log("Port listening at 3000") })
app.get('/', function(req, res) {})
