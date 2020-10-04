---
title: "[Node] CommonJS시스템과 require()의 이해"
date: 2020-10-04 21:34:00 -0400
fontsize: 10pt
categories: node
---

<br>

Node.js는 모듈 시스템 방식으로 [CommonJS 모듈](http://www.commonjs.org/) 시스템을 따르고 있다. 따라서 자바스크립트 표준 방식인 [ES 모듈](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Modules) 시스템은 experimental-modules옵션을 주고 실행하거나 babel같은 트랜스파일러를 이용하지 않으면 사용할 수 없다. Node.js는 실험적으로 ES 모듈 시스템을 사용할 수 있게 적용중이다.

## CommonJS

CommonJS 모듈 시스템에서는 다음과 같이 모듈을 내보낼 수 있다.
~~~javascript
module.exports = {
  name: 'Kim',
  sayHello: function() {
    console.log('안녕하세요');
  }
}

//위 코드는 다음과 같다.

exports.name = 'Kim';
exports.sayHello = function() {
  console.log('안녕하세요');
};
~~~

exports는 module.exports를 참조하고있는 변수이므로 다음과 같이 선언하게 되면 exports의 참조가 바뀌게 되고 모듈을 내보낼 수 있는 방법이 아니다.

~~~javascript
exports = {
  name: 'Kim',
  sayHello: function() {
    conseole.log('안녕하세요');
  }
} // module.exports = ... 와 다름
~~~

## References