---
title: "node의 EventEmitter 기초"
date: 2020-12-20 21:34:00 -0400
fontsize: 10pt
categories: node
---

<br>

node를 이용해서 웹 어플리케이션을 만들다보면 다음과 같은 스타일의 코드를 작성해봤을 것이다.  

~~~javascript
const http = require('http');

const server = http.createServer();

server.on('request', (request, response) => {
  // request, response 작업
});
~~~

노드의 핵심 모듈들인 stream, http, fs 등은 특정 상황에서 이벤트를 발생시키고, 개발자들은 위 코드처럼 특정 이벤트에 이벤트 리스너를 등록하는 방식으로 어플리케이션을 만든다. 위 코드에서 server라는 변수에 `on()` 메소드를 통해 이벤트 리스터를 등록할 수 있는 이유는 node의 Server 클래스와 앞서 얘기한 모듈들이 export하는 클래스들이 node의 [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) 클래스를 상속받았기 때문이다.  

자바스크립트의 기본적인 목적이 브라우저에서 사용자가 발생시키는 돔 객체의 이벤트를 처리하기 위한 것임을 생각하면, 자바스크립트의 핵심은 event이고 node또한 event 기반으로 핵심 API들이 구현되어있다. 이번 게시글에서는 node의 events 모듈의 구현체인 EventEmitter에 대해서 알아보려고 한다.  

<br>

## EventEmitter

node의 events 모듈은 EventEmitter를 exports하기 때문에 events 모듈을 로드해서 EventEmitter를 바로 사용할 수 있다. 다음 코드는 EventEmitter의 인스턴스를 생성하고 하나의 이벤트 리스너를 등록하고, 이벤트를 발생시킨다.

~~~javascript
const EventEmitter = require('events')

const callEventEmitter = new EventEmitter() // 1

callEventEmitter.on('call', () => {  //2
  console.log('you got a call!');
})

callEventEmitter.emit('call')  //3
~~~

1. EventEmitter의 인스턴스를 생성한다.  
1. 'call' 라는 이벤트를 다루는 리스너를 `on()` 메소드를 통해 등록해준다. 'hello' 이벤트가 발생하면 실행할 콜백 메소드를 등록한다.  
1. `emit()` 메소드의 인자로 'call'을 넘겨줌으로서 'call' 이벤트를 발생시킨다.  

위 코드를 실행하면 로그를 확인할 수 있다.

> hello event emitted!  

EventEmitter는 기본적으로 리스너의 등록과 해제 시, 'newListener'이벤트와 'removeListener'이벤트를 발생시킨다.  

~~~javascript
callEventEmitter.on('newListener', (event, listener) => {
  console.log(`'${event}' event listener added`);
})

callEventEmitter.on('call', () => {
  console.log('you got a call!');
})
~~~

> 'call' event listener added

<br>

## 리스너 등록하기

`on()` 메소드를 통해 이벤트 리스너를 등록할 수 있다. 첫번째 매개변수로 이벤트의 이름, 두번재 매개변수로 해당 이벤트가 발생했을 때 실행할 콜백을 넘겨준다. 하나의 이벤트에 대해 여러개의 리스너를 등록할 수 있으며, EventEmitter 인스턴스 내부의 listener array에 리스너가 추가되고, 추가된 순서대로 리스너가 실행된다.

~~~javascript
callEventEmitter.on('call', () => {
  console.log('you got a call!');
})

callEventEmitter.on('call', () => {
  const date = new Date()
  console.log(`current time is ${date.getHours()}:${date.getMinutes()}` );
})

callEventEmitter.emit('call')
~~~

> you got a call!  
> current time is 18:32  

<br>

현재 EventEmitter 인스턴스 내부의 listener array를 확인하고 싶으면 `listeners()` 메소드에 원하는 이벤트의 이름을 매개변수로 넘겨주는 것으로 확인할 수 있다.  

~~~javascript
callEventEmitter.on('call', () => {
  console.log('you got a call!');
})

console.log(callEventEmitter.listeners('call'));
~~~

> [ [Function: onCall] ]  

<br>

`once()` 메소드를 통해 이벤트 발생 시 처음 한 번만 작동하는 리스너를 등록할 수 있다. 이 리스너는 다음 이벤트 호출 때 제거된다.

~~~javascript
function onFirstCall() {
  console.log('this is your first call');
}
function onCall() {
  console.log('you got a call!');
}

callEventEmitter.once('call', onFirstCall)
callEventEmitter.on('call', onCall)

callEventEmitter.emit('call')
callEventEmitter.emit('call')
~~~

> this is your first call  
> you got a call!  
> you got a call!  

_node는 이벤트 리스너를 등록하는 `addListener()`와 `prependListener()`라는 똑같은 기능을 메소드도 제공한다._

<br>

## 리스너 제거하기

`removeListener()` 메소드를 통해 인스턴스에 등록된 이벤트 리스터를 제거할 수 있다. 매개변수로 이벤트의 이름과 제거할 리스너의 콜백을 넘겨주어야 한다.

~~~javascript
function onCall() {
  console.log('you got a call!');
}

callEventEmitter.on('call', onCall)
console.log(callEventEmitter.listeners('call'));

callEventEmitter.removeListener('call', onCall)
console.log(callEventEmitter.listeners('call'));
~~~

> [ [Function: onCall] ]  
> []  

<br>

`removeAllListener()` 메소드에 이벤트의 이름을 넘겨주면 해당 이벤트에 등록된 모든 리스너를 제거한다.

~~~javascript
function onCall() {
  console.log('you got a call!');
}

callEventEmitter.on('call', onCall)
console.log(callEventEmitter.listeners('call'));

callEventEmitter.removeAllListeners('call')
console.log(callEventEmitter.listeners('call'));
~~~

> [ [Function: onCall] ]  
> []  

<br>

## `emit()`의 매개변수 이용하기

`emit()` 메소드의 매개변수로 첫번째는 이벤트의 이름을 넘겨주고, 두번째 이상으로 넘겨주는 매개변수들은 그대로 이벤트 리스너의 콜백의 매개변수로 전달돼서, 이벤트 리스너에서 이용할 수 있다.

~~~javascript
callEventEmitter.on('call', (caller) => {
  console.log(`you got a call from ${caller}!`);
})

callEventEmitter.emit('call', 'mom')
~~~

> you got a call from mom!  

<br>

## References