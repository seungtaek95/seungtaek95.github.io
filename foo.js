function Foo() {
  this.name = 'Kim'
}

const foo = new Foo()
console.log(foo);
console.log(foo.age);
console.log(Foo.prototype);

console.log("");

Foo.prototype.age = 20
console.log(foo);
console.log(foo.age);
console.log(Foo.prototype);