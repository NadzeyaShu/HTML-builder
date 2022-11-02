function copyDir() {

    const path = require('path')
    const fs = require('fs');

    let copyFolderPath = path.join(__dirname, 'files-copy');
    let sourceFolderPath = path.join(__dirname, 'files');

    function createFolderAndCopyFiles() {
        fs.mkdir(copyFolderPath, err1 => {
            if (err1) throw err1;

            fs.readdir(sourceFolderPath, {withFileTypes: true}, (err2, files) => {
                if (err2) throw err2;

                files.forEach(file => {
                    let sourceFilePath = path.join(__dirname, 'files', file.name);
                    let destinationFilePath = path.join(__dirname, 'files-copy', file.name);
                    fs.copyFile(sourceFilePath, destinationFilePath, err3 => {
                        if (err3) throw err3;
                        console.log(`copied ${destinationFilePath}`)
                    })
                })
            })
        })
    }

    fs.stat(copyFolderPath, err =>  {
        if (!err) {
            fs.rmdir(copyFolderPath, { recursive: true }, err1 => {
                if (err1) throw err1;
                createFolderAndCopyFiles();
            })
        } else if (err.code === 'ENOENT') {
            createFolderAndCopyFiles();
        }
    });
}

copyDir();