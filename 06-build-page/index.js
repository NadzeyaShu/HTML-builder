const fs = require('fs');
const path = require('path');

let projectDistPath = path.join(__dirname, 'project-dist');
let indexPath = path.join(projectDistPath, 'index.html');

function createProjectDist() {

    let templatePath = path.join(__dirname, 'template.html');
    //read template
    const readableStream = fs.createReadStream(templatePath, 'utf-8');
    readableStream.on('data', templateData => {
        //join components in index.html
        let articlesFilePath = path.join(__dirname, 'components', 'articles.html');
        const articlesReadableStream = fs.createReadStream(articlesFilePath, 'utf-8');
        articlesReadableStream.on('data', articles => {
            let searchValue = RegExp('{{articles}}', 'gi');
            templateData = templateData.replace(searchValue, articles);

            let footerFilePath = path.join(__dirname, 'components', 'footer.html');
            const footerReadableStream = fs.createReadStream(footerFilePath, 'utf-8');
            footerReadableStream.on('data', footer => {
                let searchValue = RegExp('{{footer}}', 'gi');
                templateData = templateData.replace(searchValue, footer);

                let headerFilePath = path.join(__dirname, 'components', 'header.html');
                const headerReadableStream = fs.createReadStream(headerFilePath, 'utf-8');
                headerReadableStream.on('data', header => {
                    let searchValue = RegExp('{{header}}');
                    templateData = templateData.replace(searchValue, header);

                    let aboutFilePath = path.join(__dirname, 'components', 'about.html');
                    fs.stat(aboutFilePath, err => {
                        if (!err) {
                            const aboutReadableStream = fs.createReadStream(aboutFilePath, 'utf-8');
                            aboutReadableStream.on('data', about => {
                                let searchValue = RegExp('{{about}}');
                                templateData = templateData.replace(searchValue, about);

                                fs.writeFile(indexPath, templateData, err => {
                                    if (err) throw err;

                                    mergeStyles()
                                    copyDir();
                                })
                            })

                        } else {
                            fs.writeFile(indexPath, templateData, err => {
                                if (err) throw err;

                                mergeStyles()
                                copyDir();
                            })
                        }
                    })

                })
            })
        });
    })
}

fs.stat(projectDistPath, err => {
    if (!err) {
        fs.rm(projectDistPath, {recursive: true}, err1 => {
            if (err1) throw err1;
            fs.mkdir(projectDistPath, err1 => {
                createProjectDist();
            })
        })
    } else if (err.code === 'ENOENT') {
        fs.mkdir(projectDistPath, err1 => {
            if (err1) throw err1;
            createProjectDist();
        })

    }
})

function mergeStyles() {
    const fs = require('fs');
    const path = require('path');

    let stylesPath = path.join(__dirname, 'styles');
    let bundlePath = path.join(__dirname, 'project-dist', 'style.css');

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

function copyDir() {

    const path = require('path')
    const fs = require('fs');

    let copyFolderPath = path.join(__dirname, 'project-dist', 'assets');
    let sourceFolderPath = path.join(__dirname, 'assets');

    function createFolderAndCopyFiles() {
        fs.mkdir(copyFolderPath, err1 => {
            if (err1) throw err1;

            fs.readdir(sourceFolderPath, {withFileTypes: true}, (err2, files) => {
                if (err2) throw err2;

                files.forEach(file => {
                    if (file.isFile()) {
                        let sourceFilePath = path.join(sourceFolderPath, file.name);
                        let destinationFilePath = path.join(copyFolderPath, file.name);
                        fs.copyFile(sourceFilePath, destinationFilePath, err3 => {
                            if (err3) throw err3;
                            console.log(`copied ${destinationFilePath}`)
                        })
                    } else {
                        let copyFolderPth = path.join(copyFolderPath, file.name);
                        fs.mkdir(copyFolderPth, err => {
                            if (err) throw err;
                            let srcFolderPath = path.join(sourceFolderPath, file.name);
                            fs.readdir(srcFolderPath, {withFileTypes: true}, (err2, files) => {
                                if (err2) throw err2;

                                files.forEach(file => {
                                    if (file.isFile()) {
                                        let sourceFilePath = path.join(srcFolderPath, file.name);
                                        let destinationFilePath = path.join(copyFolderPth, file.name);
                                        fs.copyFile(sourceFilePath, destinationFilePath, err3 => {
                                            if (err3) throw err3;
                                            console.log(`copied ${destinationFilePath}`)
                                        })
                                    }
                                });
                            })
                        })
                    }
                })
            })
        })
    }

    fs.stat(copyFolderPath, err => {
        if (!err) {
            fs.rmdir(copyFolderPath, {recursive: true}, err1 => {
                if (err1) throw err1;
                createFolderAndCopyFiles();
            })
        } else if (err.code === 'ENOENT') {
            createFolderAndCopyFiles();
        }
    });
}