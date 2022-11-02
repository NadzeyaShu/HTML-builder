const fs = require('fs');
const path = require('node:path');
const {stdout} = process;

let pathString = path.join('01-read-file', 'text.txt');
const readableStream = fs.createReadStream(pathString, 'utf-8');
readableStream.on('data', fileData => stdout.write(fileData));