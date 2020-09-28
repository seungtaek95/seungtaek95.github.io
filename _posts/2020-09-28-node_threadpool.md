---
title: "[Node] libuv와 Threadpool"
date: 2020-09-28 21:34:00 -0400
fontsize: 10pt
categories: node
---

<br>

Node.js는 비동기 작업들 중 운영체제에서 기본적으로 인터페이스를 지원하는 작업의 경우(e.g. network I/O), 운영체제가 생성하는 쓰레드를 사용해서 event loop를 block하지 않고 작업을 처리한다. 하지만 운영체제가 지원하지 않는 작업의 경우, libuv가 관리하는 threadpool의 쓰레드를 활용해서 비동기 작업을 non-blocking 방식으로 처리한다.  

## Threadpool  

libuv는 node 인스턴스가 생성될 때 기본적으로 4개의 쓰레드를 가지는 threadpool을 생성한다. 이것은 4개의 비동기 작업을 한 번에 처리할 수 있음을 말한다. node에서 제공하는 API 중 crypto 모듈의 비동기 메서드 pbkdf2로 threadpool의 동작을 확인할 수 있다.

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

Node.js는 threadpool의 쓰레드 수를 조절할 수 있는 기능을 제공한다(최대 128). 코드의 가장 상단에 다음과 같이 코드를 추가해준다. (프로그램 실행시 환경변수로 넘겨줄 수도 있다.)

~~~javascript
process.env.UV_THREADPOOL_SIZE = 2
...
~~~

threadpool의 쓰레드 개수를 2개로 지정해주었다. 이제 다시 위의 코드를 돌렸을 때 결과를 예상해보자. 결과는 다음과 같다. 실행하는 환경에 따라 다를 수 있지만 다음과 같은 양상을 보인다.

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

음... 전체 작업을 완료하는 시간은 줄어들었지만 4개의 쓰레드를 사용할 때에는 4개의 작업이 74ms만에 끝났던 것을 생각해보면 원했던 결과는 아니다.  

## Conclusion

위와 같은 결과가 나온 이유는 본인의 실행환경은 4코어 CPU를 사용하기 때문이다. 4코어 CPU가 4개의 쓰레드를 이용하는 과정을 그림으로 표현하면 다음과 같다.

![4threads](https://user-images.githubusercontent.com/50684454/94440287-79a19e80-01dc-11eb-8d5c-43c18e6310e0.png)

6개의 작업이 들어왔을 때 4개의 쓰레드가 4개의 작업을 끝낼 때까지 2개의 작업은 대기한다. 4개의 CPU코어가 있기 때문에 4개의 쓰레드 작업은 동시에 처리될 수 있다. 그 후 먼저 작업을 끝낸 쓰레드가 남은 작업을 처리하게 된다.  
6개의 쓰레드로 작업을 처리하는 과정은 다음과 같다.

![6threads](https://user-images.githubusercontent.com/50684454/94440294-7c9c8f00-01dc-11eb-983e-f54d317e171d.png)

6개의 작업을 4개의 코어가 스케쥴러를 통해 동시에 처리하기 때문에 하나의 코어가 하나의 작업을 처리할 때 보다는 처리시간이 더 걸리게 된다.  

threadpool에 쓰레드가 많다고 무작정 더 나은 성능을 얻을 수 있는 것은 아니다. 중요한 것은 실행환경의 CPU사양과 예상 시나리오, 메모리 오버헤드 등을 고려해서 적절한 threadpool의 크기를 조정하는 것이 될 것이다.

## References
<https://www.udemy.com/advanced-node-for-developers>
