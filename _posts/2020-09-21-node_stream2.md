---
title: "[Node] Stream 모듈"
date: 2020-09-12 21:43:00 -0400
fontsize: 10pt
categories: node
---

<br>

## Node의 stream 종류

Node에는 두 stream 말고도 **Duplex**, **Transform** 이라는 stream이 있다.  
Duplex는 Readable 인터페이스와 Writable 인터페이스를 모두 구현하고 있는 stream이다. Duplex를 사용한 모듈로는 [TCP 소켓](https://nodejs.org/api/net.html#net_class_net_socket)이 있다.
Transform은 Duplex와 같지만 읽고 쓴 데이터를 변형할 수 있다. Transform을 사용한 모듈로는 [zlib](https://nodejs.org/api/zlib.html)이 있다.

## pipe 메서드

[이전 포스트](https://seungtaek95.github.io/node/node_stream/)에서 createReadStream()과 createWriteStream()을 통해 **Readable**, **Writable** stream을 생성해서 다음과 같은 로직으로 파일내용 읽고 쓰기를 해보았다. 1) Readable stream에 이벤트 리스너를 등록해서 데이터 chunk를 읽어오는 data이벤트가 발생하면 2) Writable stream을 통해 chunk를 보내 파일에 쓰기를 하고 3) 더이상 읽을 데이터가 없을 때 발생하는 end 이벤트 리스너를 등록해서 write stream을 닫아주었다.  
위와 같은 로직을 readable stream의 pipe() 메서드를 이용하면 한 줄로 구현할 수 있다.  

~~~javascript
const fs = require('fs')

const readable = fs.createReadStream('./src.txt');
const writable = fs.createWriteStream('./dest.txt');

readable.on('data', (chunk) => {
  writable.write(chunk)
})

readable.on('end', () => {
  writable.end()
})
~~~

이 코드를  

~~~javascript
const fs = require('fs')

const readable = fs.createReadStream('./src.txt');
const writable = fs.createWriteStream('./dest.txt');

readable.pipe(writable);
~~~

이렇게 작성할 수 있다. pipe 메서드는 더이상 읽어올 데이터가 없을 때 writable stream의 end()를 호출면서 끝난다. pipe 메서드의 두 번째 파라미터로 { end: false } 옵션을 넘겨주면 이 기본동작을 비활성화할 수 있다.  
만약 pipe메서드를 호출한 객체가 Duplex나 Transform의 인스턴스라면 다음과 같이 pipe chain을 만들 수 있다.

~~~javascript
const fs = require('fs');

const readable = fs.createReadStream('src.txt');
const myZip = zlib.createGzip();
const writable = fs.createWriteStream('dest.txt.gz');

readable.pipe(myZip).pipe(writable);
~~~

## references

<https://jeonghwan-kim.github.io/node/2017/07/03/node-stream-you-need-to-know.html>  

<https://real-dongsoo7.tistory.com/71>