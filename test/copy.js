// Copy Text File
const {
  promises: { copyFile },
} = require('fs');
const { join } = require('path');

copyFile(join(__dirname, 'mit.txt'), '.', (err) => {
  if (err) console.log(err);
}).catch((error) => console.log(error));
