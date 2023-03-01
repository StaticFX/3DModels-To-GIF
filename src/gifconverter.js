const GIFEncoder = require('gifencoder')
const pngFileStream = require('png-file-stream')
const fs = require('fs');
const fsextra = require('fs-extra')

class GIFConverter {

    constructor(width, heigth) {
        this.gifencoder = new GIFEncoder(width, heigth);
    }

    createGif(inPath, out, pictures, deleteDir) {
        const stream = pngFileStream(inPath + "/frame??.png").pipe(this.gifencoder.createWriteStream( { repeat: 1, delay: 10, quality: pictures })).pipe(fs.createWriteStream(out))

        stream.on('finish', () => { 
            if(deleteDir) fsextra.emptyDirSync("images");

            console.log("GIF Done") 
        })
    }
}

module.exports = { GIFConverter };