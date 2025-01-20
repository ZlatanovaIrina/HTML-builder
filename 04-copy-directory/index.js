const fsPromises = require('node:fs/promises');
const path = require('node:path');

const copyDir = async (originFolderPath, destinationFolderPath) => {
  try {
    await fsPromises.rm(destinationFolderPath, {
      recursive: true,
      force: true,
    });

    await fsPromises.mkdir(destinationFolderPath, { recursive: true });

    const originFolderContents = await fsPromises.readdir(originFolderPath, {
      withFileTypes: true,
    });
    const originFolderContentsFiles = originFolderContents.filter((dirent) =>
      dirent.isFile(),
    );

    for (let file of originFolderContentsFiles) {
      const filePath = path.join(file.parentPath, file.name);
      const destinationFilePath = path.join(destinationFolderPath, file.name);
      await fsPromises.copyFile(filePath, destinationFilePath);
    }
  } catch (err) {
    console.log('An error occurred while copying:', err.message);
  }
};

const originFolderPath = path.join(__dirname, 'files');
const destinationFolderPath = path.join(__dirname, 'files-copy');

copyDir(originFolderPath, destinationFolderPath);
