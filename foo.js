const myRegex = /(Seoul|Incheon)/;
const result = "I live in Seoul, I love Incheon".replace(myRegex, "Busan");
console.log(result);
const myRegex2 = /(Seoul|Incheon)/g;
const result2 = "I live in Seoul, I love Incheon".replace(myRegex2, "Busan");
console.log(result2);