const fs = require('fs');
const fsPromise = require('node:fs/promises');
const path = require('path');

const makeBundle = async (stylesFolderPath) => {
  try {
    const stylesFolderContents = await fsPromise.readdir(stylesFolderPath, {
      withFileTypes: true,
    });

    if (stylesFolderContents.length === 0) {
      throw new Error('Style folder is empty');
    }

    const cssFilesFromStylesFolder = stylesFolderContents.filter((dirent) => {
      const filePath = path.join(dirent.parentPath, dirent.name);
      const fileExt = path.parse(filePath).ext.substring(1);
      return fileExt === 'css';
    });

    if (cssFilesFromStylesFolder.length === 0) {
      throw new Error('Css files not found');
    }

    const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
    const writeStream = fs.createWriteStream(bundlePath);

    for (let file of cssFilesFromStylesFolder) {
      const filePath = path.join(file.parentPath, file.name);
      const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

      readStream.on('data', (chunk) => writeStream.write(`${chunk}\n`));
    }
  } catch (err) {
    console.log('An error occurred while copying:', err.message);
  }
};

const stylesFolderPath = path.join(__dirname, 'styles');
makeBundle(stylesFolderPath);
