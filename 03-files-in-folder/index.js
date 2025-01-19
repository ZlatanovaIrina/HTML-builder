const fsPromises = require('node:fs/promises');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

const getFilesInfo = async (folderPath) => {
  try {
    const readDirPromise = fsPromises.readdir(folderPath, {
      withFileTypes: true,
    });
    const folderContents = await readDirPromise;
    const folderFiles = folderContents.filter(($) => $.isFile());

    folderFiles.map((dirent) => {
      const filePath = path.join(dirent.parentPath, dirent.name);

      (async () => {
        const fileStat = await fsPromises.stat(filePath);
        const fileParse = path.parse(filePath);

        console.log(
          `${fileParse.name} - ${fileParse.ext.substring(1)} - ${(
            fileStat.size / 1024
          ).toFixed(2)}kb`,
        );
      })();
    });
  } catch (err) {
    console.log(
      'An error occurred while reading the contents of the folder:',
      err.message,
    );
  }
};

getFilesInfo(folderPath);
