const fs = require("fs");
const path = require('path');
var headlessGL = require('gl');
var express = require('express')

const { PNGConverter } = require('./pngconverter.js');
const { STLRenderer } = require('./stlrenderer');
const { GIFConverter } = require('./gifconverter');

const port = 3000
var app = express()
app.listen(port, ()=> { console.log("Port listening at 3000") })
app.get('/', function(req, res) {})

const width = 1024;
const height = 1024;

const gl = new headlessGL(width, height);
const renderer = new STLRenderer("infinity.stl", gl, width, height);
const converter = new PNGConverter(gl);

renderTest();

async function renderTest() {
  await waitUntilTrue(() => renderer.loaded);

  let pictures = 99;

  for (let i = 0; i < pictures; i++) {

    let angle = 360 / pictures;
    renderer.rotateMeshZ(angle);

    let image = renderer.renderImage();
    const number = ('0' + i).slice(-2);
    converter.convertToPNG(`images/frame${number}.png`, image);
    console.log("rendering " + i);
  } 

  const gifConverter = new GIFConverter(width, height);
  setTimeout(() => {gifConverter.createGif("images", "finish.gif", pictures, true);}, 5000)
}

function waitUntilTrue(booleanFn) {
  return new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (booleanFn()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
}
