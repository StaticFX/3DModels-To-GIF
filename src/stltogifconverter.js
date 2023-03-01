const { PNGConverter } = require('./pngconverter.js');
const { STLRenderer } = require('./stlrenderer');
const { GIFConverter } = require('./gifconverter');
const GL = require('gl');

class STLToGIFConverter {

    #ready = false
    #pngConverter = null
    #stlRenderer = null
    #gifConverter = null
    #gl = null

    constructor(stl, out, width, height) {
        this.stl = stl;
        this.out = out;
        this.width = width;
        this.height = height;
        this.#gl = new GL(width, height);
        this.#pngConverter = new PNGConverter(this.#gl);
        this.#stlRenderer = new STLRenderer(stl, this.#gl, width, height);
        this.#gifConverter = new GIFConverter(width, height);
        this.#setup();
    }

    async #setup() {
        await waitUntilTrue(() => renderer.loaded);
        this.#ready = true;
    }

    #waitUntilTrue(booleanFn) {
        return new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (booleanFn()) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }

    async generateGIF(angle, delay, quality) {
        if (this.#ready) throw new Error("Converter not ready yet!");

        let pictures = 360 / angle;

        for (let i = 0; i < pictures; i++) {
          this.#stlRenderer.rotateMeshZ(angle);
      
          let image = this.#stlRenderer.renderImage();
          this.#pngConverter.convertToPNG(`images/frame${i}.png`, image);
          console.log("rendering frame " + i);
        } 
        
        setTimeout(() => { this.#gifConverter.createGif("images", "finish.gif", pictures, true);}, 5000)
    } 

    getReady() { return this.#ready }

}

module.exports = { STLToGIFConverter }