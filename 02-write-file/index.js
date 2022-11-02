const {stdin: input, stdout: output} = require('process');

const path = require('node:path');
let pathString = path.join('02-write-file', 'text.txt');

const fs = require('fs');
fs.writeFile(pathString, '', err => {
    if (err) {
        output.write(err.message);
    }
})

output.write('Введите строку\n');
const readline = require('readline');
const rl = readline.createInterface({input, output});

rl.on('line', data => {
    if (data.toString() === 'exit') {
        output.write('прощальная фраза!');
        process.exit(0);
    }
    fs.appendFile(pathString, `${data}\n`, err => err => {
        if (err) {
            output.write(err.message)
        }
    })
}).on('close', () => output.write('прощальная фраза!'));
