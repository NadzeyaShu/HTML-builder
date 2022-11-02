let fs = require('fs');
const path = require('path');

fs.readdir(path.join(__dirname, 'secret-folder'), {withFileTypes: true}, (err, files) => {
    if (err) throw err; // не прочитать содержимое папки

    files.forEach(file => {
        if (file.isFile()) {
            let filePath = path.join(__dirname, 'secret-folder', file.name);
            fs.stat(filePath, (err1, stats) => {
                if (err1) throw err1;

                let fileExt = path.extname(file.name);
                console.log(`${path.basename(file.name, fileExt)} - ${fileExt} - ${stats.size}`)
            })

        }

    });
});