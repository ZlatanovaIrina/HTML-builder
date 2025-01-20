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

    const bundlePath = path.join(__dirname, 'project-dist', 'style.css');
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

const copyDir = async (originFolderPath, destinationFolderPath) => {
  try {
    await fsPromise.mkdir(destinationFolderPath, { recursive: true });

    const originFolderContents = await fsPromise.readdir(originFolderPath, {
      withFileTypes: true,
    });

    for (let item of originFolderContents) {
      const itemPath = path.join(item.parentPath, item.name);
      const destinationItemPath = path.join(destinationFolderPath, item.name);

      if (item.isDirectory()) {
        await copyDir(itemPath, destinationItemPath);
      } else {
        const readStream = fs.createReadStream(itemPath);
        const writeStream = fs.createWriteStream(destinationItemPath);

        readStream.pipe(writeStream);
      }
    }
  } catch (err) {
    console.log('An error occurred while copying:', err.message);
  }
};

const buildPage = async () => {
  try {
    const templatePath = path.join(__dirname, 'template.html');
    const readStream = fs.createReadStream(templatePath, { encoding: 'utf-8' });
    let pageTemplate = '';
    readStream.on('data', (chunk) => (pageTemplate += `${chunk}\n`));
    readStream.on('end', () => {
      (async () => {
        readStream.close();
        const componentsPath = path.join(__dirname, 'components');
        const tagsFromComponents = await fsPromise.readdir(componentsPath, {
          withFileTypes: true,
        });

        tagsFromComponents.forEach((dirent) => {
          const filePath = path.join(dirent.parentPath, dirent.name);
          const fileName = path.parse(filePath).name;
          const readStream = fs.createReadStream(filePath, {
            encoding: 'utf-8',
          });
          let fileContent = '';
          readStream.on('data', (chunk) => (fileContent += `${chunk}\n`));
          readStream.on('end', () => {
            (async () => {
              readStream.close();
              pageTemplate = pageTemplate.replaceAll(
                `{{${fileName}}}`,
                fileContent,
              );

              const buildPath = path.join(__dirname, 'project-dist');
              await fsPromise.mkdir(buildPath, { recursive: true });

              const indexHTMLPath = path.join(buildPath, 'index.html');

              const writeStream = fs.createWriteStream(indexHTMLPath, {
                encoding: 'utf-8',
              });
              writeStream.write(pageTemplate);

              const stylesFolderPath = path.join(__dirname, 'styles');
              makeBundle(stylesFolderPath);

              const originFolderPath = path.join(__dirname, 'assets');
              const destinationFilePath = path.join(buildPath, 'assets');
              copyDir(originFolderPath, destinationFilePath);
            })();
          });
        });
      })();
    });
  } catch (err) {
    console.log('An error ocurred while building the page', err.message);
  }
};

buildPage();
