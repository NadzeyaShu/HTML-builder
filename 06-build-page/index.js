const fs = require('fs');
const path = require('path');

let projectDistPath = path.join(__dirname, 'project-dist');
let indexPath = path.join(projectDistPath, 'index.html');
let templatePath = path.join(__dirname, 'template.html');
let componentsFolderPath = path.join(__dirname, 'components');

buildPage();

function buildPage() {
    fs.stat(projectDistPath, err => {
        if (!err) {
            fs.rm(projectDistPath, {recursive: true}, err1 => {
                if (err1) throw err1;
                fs.mkdir(projectDistPath, err1 => {
                    if (err1) throw err1;
                    createIndexPage();
                    mergeStyles();
                    copyDir();
                })
            })
        } else if (err.code === 'ENOENT') {
            fs.mkdir(projectDistPath, err1 => {
                if (err1) throw err1;
                createIndexPage();
                mergeStyles();
                copyDir();
            })
        }
    })
}

async function createIndexPage() {
    let templateHtml = await fs.promises.readFile(templatePath, 'utf-8');
    let componentsFiles = await fs.promises.readdir(componentsFolderPath, {withFileTypes: true});

    for (const componentFile of componentsFiles) {
        let fileExt = path.extname(componentFile.name);
        let templateForReplace = `{{${path.basename(componentFile.name, fileExt)}}}`;

        if (fileExt === '.html' && templateHtml.match(templateForReplace)) {
            let componentFilePath = path.join(__dirname, 'components', componentFile.name);
            let componentData = await fs.promises.readFile(componentFilePath, 'utf-8');

            templateHtml = templateHtml.replace(templateForReplace, componentData);
            await fs.promises.writeFile(indexPath, templateHtml);
        }
    }
}

function mergeStyles() {
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