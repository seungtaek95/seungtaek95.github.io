---
title: "supertest를 이용한 웹 API 테스트 (with Jest)"
date: 2020-12-05 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

javascript로 어플리케이션을 만들 때 사용할 수 있는 테스트 툴이 여러개가 있다. 대표적으로 [mocha](https://mochajs.org/), [jest](https://jestjs.io/)가 있다. 필자는 mocha를 사용해 본 적은 없고 첫 테스트 프레임워크로 jest를 사용해봐서 jest를 계속 사용하고 있다. Node.js로 웹서버를 만들 때는 jest를 이용한 단위테스트 이외에 현재 작업중인 웹 API가 올바른 응답을 보내는지에 대한 테스트도 필요하다. 이때 [supertest](https://www.npmjs.com/package/supertest)를 사용하면 편하게 API를 테스트할 수 있다. supertest는 [superagent](https://visionmedia.github.io/superagent/)를 사용한다. supertest의 더 자세한 사용법은 superagent를 참고하면 좋다. jest에 대한 설명은 넘어가고 supertest를 사용하는 법을 중심으로 글을 작성한다.

jest와 supertest를 설치해준다.

~~~
$ npm install -D jest supertest
~~~

웹 프레임워크로는 express를 쓴다고 가정하고 http 서버를 생성하고 export해주는 기초 코드를 작성한다. 테스트 할 웹 서버는 루트 경로로 GET 요청이 왔을 때 json형식으로 { "message": "Hello world!" } 라는 응답을 보내주는 기능을 한다.  

app.js
~~~javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: "Hello world!" });
})

module.exports = app;
~~~

위에서 작성한 어플리케이션을 테스트할 테스트 파일을 작성한다.  

app.test.js
~~~javascript
const request = require('supertest')
const app = require('./app')

describe('GET / ', () => {
  test('response "Hello world"', (done) => {
    request(app)
      .get('/')    // 1
      .expect(200, {  // 2
        message: "Hello world!"
      }, done)  // 3
  });
})
~~~

supertest모듈을 로드하면 request함수를 가져오게 되고 이 request의 매개변수로 웹 어플리케이션을 넘겨주면 체이닝을 통해 테스트 코드를 작성활 수 있다. (매개변수로 테스트할 서버의 url을 넘겨줄 수도 있다.)  

1) get 함수를 통해 매개변수로 넘긴 주소로 GET 요청을 보낸다.  
2) expect 함수를 통해 기대하는 결과값을 작성한다. 첫번쨰 매개변수는 HTTP 응답 코드, 두번째 매개변수는 HTTP 응답 body, 세번째 매개변수로 콜백을 넘겨주게 된다.
3) 비동기 테스트 코드의 완료를 알리는 done을 콜백 함수로 넘겨주었다.

~~~
$ jest app.test.js
~~~

테스트를 돌려보고 통과하는 것을 확인한다. HTTP 응답을 직접 다루고 싶다면 위 테스트를 다음과 같이 작성할 수도 있다.  

~~~javascript
const request = require('supertest')
const app = require('./app')

describe('GET / ', () => {
  test('response "Hello world"', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .then(res => {
        expect(res.body.message).toBe("Hello world!");
        done()
      });
  });
})
~~~

POST 요청을 테스트해보기 위해 json 형식의 요청 바디에서 숫자 하나를 요청으로 받으면 그 숫자에 1을 더해서 응답으로 주는 웹 어플리케이션을 작성해보자.  

app.js
~~~javascript
app.use(express.json())

app.post('/add', (req, res) => {
  const result = Number(req.body.number) + 1
  res.json({ result });
})
~~~

어플리케이션을 테스트해보자.  

app.test.js
~~~javascript
describe('POST /add ', () => {
  test('response number 5', (done) => {
    request(app)
      .post('/add')
      .expect(200)
      .send({ number: 4 })
      .then(res => {
        expect(res.body.result).toBe(5);
        done()
      });
  });
})
~~~

get 함수 대신 post 함수를 사용하였고, send 함수를 통해 json 형식의 request body를 보내주었다.  
<br>
cookie를 통한 인증 서비스를 제공하는 웹 서버를 테스트할 경우, 브라우저가 해당 서버에 요청을 보낼 때마다 요청 헤더에 쿠키를 담아서 전송해준다. 지금까지 작성한 테스트 코드에서는 서버에서 set-cookie를 통해 쿠키를 설정했더라도 다음 request 함수 호출 시에는 set 함수를 통해 헤더를 지정해주지 않으면 이 쿠키를 요청에 담아서 보내주지 않는다. 그럴때 supertest의 agent라는 것을 사용하면 된다.
<br>
사용자가 로그인을 하면 그 사용자의 로그인 인증정보를 auth라는 값으로 쿠키에 설정해주는 웹 서버가 있다면 다음과 같은 테스트 코드를 작성할 수 있다.

app.test.js
~~~javascript
const agent = request(app)

test('login with response', async (done) => {
  await agent
    .post('/login')
    .expect(200)
    .expect('set-cookie', 'auth=someAuth; Path=/')

  await agent
    .get('/auth')
    .expect(200)

  done()
});
~~~

## References

<https://jeonghwan-kim.github.io/dev/2020/05/25/supertest.html>