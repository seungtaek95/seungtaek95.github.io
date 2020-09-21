---
title: "[Node] Stream 모듈"
date: 2020-09-12 21:43:00 -0400
fontsize: 10pt
categories: node
---

<br>

## stream 이란?

컴퓨터에서 stream이란 입력과 출력을 연결해주는 데이터가 이동하는  통로라고 생각할 수 있다. Node.js도 운영체제의 filesystem을 이용하는 fs라는 모듈이 있기 때문에 호스트 운영체제의 file 입출력 stream을 이용할 수 있다. stream을 이용할 때에는 메모리에 올릴 버퍼의 사이즈를 조절해서 어플리케이션이 한번에 많은 메모리를 잡아먹는 것을 방지할 수 있다.  
  
Node.js의 모듈 중 stream을 이용하는 것은 http의 request/response, fs의 read/write stream, zlib stream 등이 있다.  

## Node.js의 file read/write  

대용량 파일의 내용을 읽어와서 읽어온 내용과 똑같은 파일을 작성하는 어플리케이션을 만들어보자. 이 파일은 약 500MB의 대용량 파일이다. fs 모듈의 readFile()을 이용해서 파일을 읽은 뒤 writeFile()을 이용해서 파일을 작성한다. 두 메소드 모두 비동기 함수이기 때문에 괜찮은 코드라고 생각할 수 있다.  

~~~javascript
const fs = require('fs')

fs.readFile('./src.txt', (error , data) => {
  if (error) throw error

  fs.writeFile('./dest.txt', data, (error) => {
    if (error) throw error

    console.log('file successfully writed');
  })
})
~~~

다음과 같이 프로그램이 차지하는 메모리를 확인하는 함수를 만들자.

~~~javascript
function checkMemory() {
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
  console.log(`memory usage : ${Math.round(memoryUsage)} MB`)
}
~~~

먼저 작성했던 프로그램의 파일 불러오기가 끝났을 때 프로그램의 메모리 사용량을 확인해보자.

~~~javascript
checkMemory() // memory usage : 16 MB

fs.readFile('./src.txt', (error , data) => {
  if (error) throw error

  checkMemory() // memory usage : 517 MB

  fs.writeFile('./dest.txt', data, (error) => {
    if (error) throw error

    console.log('file successfully writed');
  })
})
~~~

파일크기만큼 메모리 사용량이 늘어난 것을 확인할 수 있다. 파일을 작성하기 위해 메모리에 통째로 파일을 올려놓았기 때문이다. 결국 메모리 사용의 관점에서 상당히 좋지 않은 프로그램이라고 할 수 있다.

## stream객체를 활용한 read/write  

[Node.js documentation](https://nodejs.org/api/stream.html)에서 stream모듈의 자세한 사용법을 확인할 수 있다.  
파일을 읽어올 readable stream과 writeable stream을 생성한다. 이 때 파라미터로 버퍼 사이즈를 지정하는 옵션을 넘겨주지 않으면 생성된 스트림이 사용할 기본 버퍼의 메모리(highWaterMark)는 64KB이다.

~~~javascript
const fs = require('fs')

const readable = fs.createReadStream('./src.txt');
const writable = fs.createWriteStream('./dest.txt');
~~~

stream은 EventEmitter의 메소드를 사용할 수 있기 때문에 다음과 같이 이벤트를 등록해줄 수 있다.  

~~~javascript
// data event listener를 등록함으로 read시작
readable.on('data', (chunk) => {
  writable.write(chunk)
})
// read stream이 끝날 대 write stream도 종료
readable.on('end', () => {
  writable.end()
})
~~~

reable stream의 data 이벤트에 listener를 등록함으로써 file read가 시작되고 버퍼에 chunk data가 쌓일 때마다 data이벤트가 호출된다. 그리고 그 때 writable stream은 readable stream을 통해 넘어온 chunk data를 이용해서 파일을 작성한다. 더이상 읽어올 데이터가 없을 때는 end이벤트가 발생하고 이 때 writable stream을 close() 함수를 호출해서 닫아준다.

~~~javascript    
readable.on('end' () => {
  checkMemory() // memory usage : 51 MB
  writable.end()
})
~~~

버퍼에 지정한 chunk사이즈만큼의 데이터가 올라올 때마다 파일을 작성하고 버퍼를 비우기 때문에 메모리 사용량이 파일이 버퍼에 통째로 올라오는 것과는 다르게 적은 것을 확인할 수 있다.

## References

<https://jeonghwan-kim.github.io/node/2017/07/03/node-stream-you-need-to-know.html>  

<https://real-dongsoo7.tistory.com/71>
