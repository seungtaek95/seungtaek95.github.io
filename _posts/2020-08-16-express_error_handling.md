---
title: "[Node.js]express의 오류 처리 미들웨어"
date: 2020-08-16 14:42:00 -0400
fontsize: 8pt
# categories: node
---

어느 어플리케이션이든 코드를 작성할 때 기본적으로 에러가 날 수 있는 로직은 try-catch구문으로 감싸서 에러로 인해 프로세스가 종료되는 것을 방지해야합니다. 오류가 날 수 있는 모든 구문에서 try-catch로 오류를 처리해줄 수도 있지만 express에서는 오류 처리 미들웨어를 정의해주는 것으로 오류를 처리해줄 수도 있습니다.

## Error Handling Middleware  

일반적인 express 미들웨어와는 달리 오류 처리 미들웨어는 4개의 인자를 받는 함수로 다음과 같이 정의할 수 있습니다. 

```javascript
app.use((error, req, res, next) => {
  res.status(500).send(error.toString())
})
```

미들웨어에서 try-catch로 감싸져있지 않은 곳에서 에러가 발생하거나 next에 인자를 넘기는 경우 오류 처리 미들웨어가 호출됩니다. 그리고 오류 처리 미들웨어는 반드시 라우팅의 맨 마지막에 자리해야합니다.

```javascript
const app = require("express")

...

app.use((error, req, res, next) => {
  // 이 미들웨어는 에러를 전달받거나 처리하지 못합니다.
})
app.get('/foo', (req, res) => {
  throw new Error('error')
})
app.get('/bar', (req, res) => {
  const error =  new Error('error')
  next(error)
})
app.use((req, res, next) => {
  // 에러가 발생하면 이 미들웨어는 실행되지 않습니다.
})
app.use((error, req, res, next) => {
  // 두 라우팅 함수에서 발생한 에러는 이 미들웨어에 도달합니다.
})

...
```

다음과 같이 에러의 타입별로 에러를 처리해주거나 next의 인자로 에러를 넣어줘서 다음 오류 처리 미들웨어로 에러 처리를 넘겨줄 수 있습니다.

```javascript
app.use((error, req, res, next) => {
  if (error instanceof MongoError) {
    res.satatus(503).send('DB error')
  } else {
    next(error)
  }
})
```

## Asynchronous Error

하지만 다음과 같이 try-catch로 감싸지 않은 비동기 함수 안에서 에러가 발생한다면 express의 비동기 미들웨어는 작동하지 않을것입니다.

```javascript
app.get('/foo', async (req, res) => {
  const result = await someAsyncFunc()
  throw new Error()// 에러 발생
  // 에러 처리 미들웨어는 작동하지 않고 어플리케이션은 중지
  res.status(200).json(result)
})
```

역시 모든 비동기 함수 안에 try-catch문을 넣어서 에러를 처리할 수 있지만 오류가 발생할 수 있는 비동기 함수를 감싸주는 wrapper함수를 하나 정의하면 모든 비동기 에러를 한번에 처리할 수 있습니다.

```javascript
function wrapAsync(asnycFun) {
  return function(req, res, next) {
    asyncFun(req, res, next).catch(next)
  }
}
```

이 wrapper 함수는 비동기 미들웨어 함수를 인자로 받아서 그것을 실행시키고 오류가 나면 next함수를 catch로 전달해서 에러가 에러 처리 미들웨어로 전달되게 합니다. 다음 비동기 함수는 어플리케이션을 종료시키지 않고 에러를 처리합니다.

```javascript
app.get('foo', wrapAsync(async (req, res) => {
  const result = await someAsyncFunc()
  throw new Error()// 에러 발생
  //wrapAsync 함수 덕분에 비동기 에러도 처리가 가능합니다.
}))
```

## References  

<http://expressjs.com/ko/guide/error-handling.html#%EC%98%A4%EB%A5%98-%EC%B2%98%EB%A6%AC>
<http://jeonghwan-kim.github.io/node/2017/08/17/express-error-handling.html>