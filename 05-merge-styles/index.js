function mergeStyles() {
    const fs = require('fs');
    const path = require('path');

    let stylesPath = path.join(__dirname, 'styles');
    let bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');

    function addCssToBundle() {
        fs.readdir(stylesPath, {withFileTypes: true}, (err, files) => {
            if (err) throw err;

            files.forEach(file => {
                let fileExt = path.extname(file.name);

                if (file.isFile() && fileExt === '.css') {
                    let filePath = path.join(stylesPath, file.name);

                    const readableStream = fs.createReadStream(filePath, 'utf-8');
                    readableStream.on('data', fileData => {
                        fs.appendFile(bundlePath, fileData, err1 => {
                            if (err1) throw err1;
                        })
                    });
                }
            });
        });
    }

    fs.stat(bundlePath, err => {
        if (!err) {
            fs.rm(bundlePath, err1 => {
                if (err1) throw err1;
                addCssToBundle();
            })
        } else if (err.code === 'ENOENT') {
            addCssToBundle();
        }
    });
}

mergeStyles()