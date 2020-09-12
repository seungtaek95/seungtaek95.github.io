const fs = require('fs')

// function main() {
//   checkMemory()

//   fs.readFile('/Users/seungtaek/Downloads/srcFile', (error , data) => {
//     if (error) throw error

//     checkMemory()
  
//     fs.writeFile('./destFile', data, (error) => {
//       if (error) throw error
//       console.log('file successfully writed');
//     })
//   })
// }

function main() {
  const readable = fs.createReadStream('/Users/seungtaek/Downloads/srcFile');
  const writable = fs.createWriteStream('./destFile');
  readable.on('data', (chunk) => {
    writable.write(chunk)
  })
  readable.on('end', () => {
    checkMemory()

    writable.end()
    console.log('file successfully writed');
  })
}

// function main() {
//   const readable = fs.createReadStream('/Users/seungtaek/Downloads/srcFile');
//   const writable = fs.createWriteStream('./destFile');
//   readable.pipe(writable)
// }

function checkMemory() {
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
  console.log(`memory usage : ${Math.round(memoryUsage)} MB`)
}

main();