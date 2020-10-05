---
title: "[Node] CommonJS 모듈 시스템의 이해"
date: 2020-10-04 21:34:00 -0400
fontsize: 10pt
categories: node
---

<br>

Node.js는 모듈 시스템 방식으로 [CommonJS 모듈](http://www.commonjs.org/) 시스템을 따르고 있다. 따라서 자바스크립트 표준 방식인 [ES 모듈](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Modules) 시스템은 node 실행 시 experimental-modules 옵션을 주고 실행하거나 [babel](https://babeljs.io/)같은 트랜스파일러를 이용하지 않으면 사용할 수 없다. Node.js는 실험적으로 ES 모듈 시스템을 사용할 수 있게 적용중이다.  

## module.exports, exports

CommonJS 모듈 시스템에서는 다음과 같이 module.exports에 내보낼 객체를 할당하거나, key/value를 할당해서  모듈을 내보낼 수 있다.  

~~~javascript
module.exports = {
  name: 'Kim',
  sayHello: function() {
    console.log('안녕하세요');
  }
}

//위 코드는 다음과 같다.
module.exports.name = 'Kim';
module.exports.sayHello = function() {
  console.log('안녕하세요');
}
~~~

다른 방법으로는 module.exports를 참조하고있는 exports 변수에 key, value를 할당하는 방법이다.  

~~~javascript
exports.name = 'Kim';
exports.sayHello = function() {
  console.log('안녕하세요');
};
~~~
exports는 module.exports를 참조하고있으므로 다음과 같이 선언하게 되면 exports의 참조가 바뀌게 되므로 **아래와 같은 방식으로는 모듈을 내보낼 수 없다**.  

~~~javascript
exports = { // 더이상 module.exports를 참조하지 않음
  name: 'Kim',
  sayHello: function() {
    conseole.log('안녕하세요');
  }
}
~~~

## require()

앞서 작성한 코드를 통해 모듈을 내보냈다면 모듈을 다른 파일에서 불러올 때는 다음과 같이 require()라는 함수를 이용한다.  

~~~javascript
// 내가 작성한 모듈 로드
const me = require('./my_code/index.js')
console.log(me) // { name: 'Kim', sayHello: [Function] }
~~~
~~~javascript
// .js를 생략할 수 있다.
const me = require('./my_code/index');
~~~
~~~javascript
// index.js의 경우 이렇게도 가능하다.
const me = require('./my_code');
~~~

이 때 require함수의 매개변수로 모듈 파일 또는 JSON파일의 경로를 넣어줘야 하는데, 현재 파일로부터의 상대경로로도 모듈을 불러올 수 있다. 이때 .js 파일의 경우 .js를 생략할 수 있고 index.js파일의 경우 부모 디렉토리까지만 명시해주면 index.js파일을 로드해준다. Node의 빌트인 모듈이나 npm 모듈인 경우 모듈의 이름만 넣어주면 알아서 불러와준다.  

~~~javascript
// JSON파일
const jsonData = require('./my_file.json');

// Node built-in 모듈
const crypto = require('crypto');

// node_modules에 있는 외부 모듈
const express = require('express');
~~~

require() 함수는 먼저 caching된 모듈 중 동일한 모듈이 있는지 검사한다. 처음 모듈을 불러오는 경우 모듈을 한 번 실행한 뒤에 모듈을 caching한다. caching된 모듈이 있다면 그 모듈을 바로 재사용하기 때문에 여러 파일에서 require()로 모듈을 불러와도 **모듈은 처음 require()로 불러올 때만 실행 된다**.  

~~~javascript
//bar.js
console.log('this is bar.js')

module.exports = {
  name: 'Kim'
}
~~~

~~~javascript
//foo.js
const bar = require('./bar')
console.log(bar);

const baz = require('./bar')
console.log(baz);
~~~

따라서 위 코드는 다음과 같은 결과를 보여준다.  

> this is bar.js
> { name: 'Kim' }
> { name: 'Kim' }

caching된 모듈을 재사용한다는건 싱글톤 객체를 사용하는 것과 같다. 따라서 다음과 같은 결과를 확인할 수 있다.  

~~~javascript
const bar = require('./bar')
const baz = require('./bar')

console.log(bar.name)
console.log(baz.name)

bar.name = 'Lee'

console.log(bar.name)
console.log(baz.name)
~~~

> this is bar.js
> Kim
> Kim
> Lee
> Lee

## module wrapper

require() 함수는 모듈을 처음 로드 할 때 한 번 실행한다고 했는데, 이 때 **require()는 모듈을 module wrapper라는 것으로 감싼 후 실행 한 뒤 module.exports를 return한다**. module wrapper는 다음과 같은 형태로 생겼다.  

~~~javascript
(function(exports, require, module, __filename, __dirname) {
  // 모듈 코드가 실제로 위치하는 곳
});
~~~

이 과정을 거침으로써 얻을 수 있는 것은 다음과 같다.  

1. 변수의 scope를 global대신 모듈 내부로 제한할 수 있다.  
2. module과 exports를 이용해서 모듈을 내보낼 수 있다.  
3. 모듈의 절대경로를 나타내는 __filename, __dirname을 사용할 수 있다.  

## References
<https://nodejs.org/api/modules.html>  

<https://medium.com/@chullino/require-exports-module-exports-%EA%B3%B5%EC%8B%9D%EB%AC%B8%EC%84%9C%EB%A1%9C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-1d024ec5aca3>  