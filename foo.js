const fs = require('fs')

function main(exception=[]) {
  fs.readdir('/Users/seungtaek/Documents/Github_Page/seungtaek95.github.io/_sass',
  { withFileTypes: true },
  (err, files) => {
    console.log(exception);
    files.forEach(file => console.log(exception.includes(file.name)))
  })
}

main(['480p', '720p'])