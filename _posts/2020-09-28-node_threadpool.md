---
title: "[Node] libuv와 Threadpool"
date: 2020-09-28 21:34:00 -0400
fontsize: 10pt
categories: node
---

<br>

Node.js는 비동기 작업들 중 운영체제에서 기본적으로 인터페이스를 지원하는 작업의 경우(e.g. network I/O), 운영체제가 생성하는 쓰레드를 사용해서 event loop를 block하지 않고 작업을 처리한다. 하지만 운영체제가 지원하지 않는 작업의 경우, libuv가 관리하는 threadpool의 쓰레드를 활용해서 비동기 작업을 non-blocking 방식으로 처리한다.  

## Threadpool  

libuv는 node 인스턴스가 생성될 때 기본적으로 4개의 쓰레드를 가지는 threadpool을 생성한다. 이것은 응용프로그램을 실행하는 CPU의 사양에 따라 최대 4개의 작업을 한 번에 처리할 수 있음을 말한다. node에서 제공하는 API 중 C/C++ 라이브러리로 binding된 crypto 모듈의 비동기 메서드 pbkdf2로 threadpool의 동작을 확인할 수 있다.

~~~javascript
const crypto = require('crypto')

const start = Date.now();

function hash() {
  crypto.pbkdf2('my_password', 'salt', 10000, 64, 'sha512', (err, hashed) => {  
    console.log(Date.now() - start);
  });
}

hash()
hash()
hash()
hash()
hash()
hash()
~~~

위 코드는 crypto모듈의 pbkdf2메서드를 이용해서 문자열을 암호화한 후 암호화에 걸리는 시간을 ms로 측정한다. 다음과같은 결과를 확인할 수 있다.  

>69
>74
>74
>74
>134
>135

총 6번의 호출이 있었기 때문에 기본 threadpool에서 한 번에 처리할 수 있는 4번의 실행이 완료되고 나머지 2번의 작업이 처리된 것을 확인할 수 있다.

# UV_THREADPOOL_SIZE  

Node.js는 threadpool의 쓰레드 수를 조절할 수 있는 기능을 제공한다. 코드의 가장 상단에 다음과 같이 코드를 추가해준다.

~~~javascript
process.env.UV_THREADPOOL_SIZE = 2
...
~~~

threadpool의 쓰레드 개수를 2개로 지정해주었다. 이제 다시 위의 코드를 돌렸을 때 결과를 예상해보자. 결과는 다음과 같다.(실행하는 환경에 따라 다를 수 있지만 다음과 같은 양상을 보인다)

>67
>73
>133
>133
>198
>199

한번에 처리할 수 있는 작업이 2개로 줄었기 때문에 2개씩 처리하는 바람에 결국 같은 6개의 작업을 처리하는데 걸리는 시간이 136ms에서 199ms로 늘게되었다. 그러면 threadpool의 쓰레드 수는 많을 수록 좋은거구나! 쓰레드 수를 늘려보자! 라고 생각할 수 있다. 다음과같이 쓰레드 수를 6개로 늘려보자.

~~~javascript
process.env.UV_THREADPOOL_SIZE = 6
...
~~~

이제 더 나은 결과를 기대하며 코드를 실행해서 결과를 확인해본다.

>98
>103
>104
>106
>106
>108

음... 전체 작업을 완료하는 시간은 줄어들었지만 4개의 쓰레드를 사용할 때에는 4개의 작업이 74ms만에 끝났던 것을 생각해보면  

## References
