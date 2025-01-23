const fs = require('fs');
const path = require('path');
const rl = require('readline');
const process = require('node:process');

const outputFilePath = path.join(__dirname, 'text.txt');

const messages = {
  promptText: '\x1b[34m Type your text here: \x1b[0m\n',
  errorText: '\x1b[31m \u274C Error! \x1b[0m',
  sucsessText:
    '\x1b[32m \u2714 Added. \x1b[0m \n \x1b[34m Write new text for add. Type "exit" or press ctrl+c for exit \x1b[0m\n',
  farewellPhraseText: `\uD83D\uDE0E \x1b[32m Success. Find your text in the file: \x1b[0m \x1b[33m "${outputFilePath}" \x1b[0m`,
};

const writeStream = fs.createWriteStream(outputFilePath, { flags: 'a' });
const readLine = rl.createInterface(process.stdin, process.stdout);

const closeAll = () => {
  console.log(messages.farewellPhraseText);
  readLine.close();
  writeStream.close();
  process.exit();
};

readLine.setPrompt(messages.promptText);
readLine.prompt();

readLine.on('line', (newLine) => {
  if (newLine.toLowerCase() === 'exit') {
    closeAll();
  }
  writeStream.write(`${newLine}\n`, (err) => {
    if (err) {
      console.log(messages.errorText, err.message);
    } else {
      console.log(messages.sucsessText);
    }
  });
});

readLine.on('SIGINT', () => {
  closeAll();
});
