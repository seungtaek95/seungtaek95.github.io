const bar = require('./')
const baz = require('./')
console.log(bar.name)
console.log(baz.name)

bar.name = 'Lee'

console.log(bar.name)
console.log(baz.name)

console.log(__filename);
console.log(__dirname);