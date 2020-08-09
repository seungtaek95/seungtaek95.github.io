---
title: "Node.js의 libuv와 event-loop"
date: 2020-08-09 15:55:40 -0400
fontsize: 10pt
# categories: node
---

싱글스레드만을 사용하는 자바스크립트 실행환경인 Node.js는 어떻게 사용자의 여러가지 비동기 요청들을 처리하는것인지 Node.js를 구성하는 핵심 구성요소 중 하나인 libuv의 event-loop의 작동방식을 통해 알아보도록 하겠습니다.  
<br>

## libuv  

libuv는 Node.js의 실행 시 기본적으로 4개의 스레드로 이루어진 스레드 풀을 생성합니다. 하지만 libuv는 운영체제에서 비동기 API를 제공하지 않는 경우를 제외하면 이 스레드들을 사용하기 보다 운영체제에서 제공하는 비동기 인터페이스를 사용합니다. 그리고 이벤트 루프도 생성하게 되는데 이 이벤트 루프가 로직을 수행하게 되고 비동기 요청이 있는경우 그것을  처리하게 됩니다.
<br>

## Event-Loop  

_이벤트 루프에 대한 자세한 설명은 [Node.js 공식문서](https://nodejs.org/ko/docs/guides/event-loop-timers-and-nexttick/)에서 확인할 수 있습니다._  

공식문서에서는 이벤트 루프의 단계가 7-8단계가 있다고 합니다. 각각의 단계는 실행할 콜백들의 FIFO Queue이며 이벤트 루프가 해당 단계에 진입했을 때 큐를 모두 소진하거나 콜백 제한 수만큼 콜백을 실행하고 다음 단계로 넘어가게 됩니다. 그리고 더이상 수행할 콜백들이 없는 경우 프로세스가 종료되게 됩니다. 이 포스팅에서는 중요한 이벤트 루프 5가지만 알아보도록 하겠습니다.

#### timers  
setTimeout()과 setInterval()로 스케줄링된 콜백을 실행합니다. timer 단계에 진입하게 되면 등록된 타이머들을 검사한 후 시간이 지난 콜백들을 큐에 넣고 실행하게 됩니다. 하지만 100ms이후에 실행하도록 등록된 콜백이 있다해도 poll큐에 등록된 콜백들이 처리된 후 실행되므로 실제로는 100ms이후에 실행될 수 있습니다.
<br>

#### pending callbakcs  
이벤트 루프의 콜백 실행 제한에 걸려서 실행되지 못하고 다음 루프로 연기된 콜백들이나 ECONNERROR같은 에러가 발생했을 때 발생하는 시스템 작업들의 콜백들을 실행합니다.
<br>

#### polling  
I/O이벤트를 가져와서 I/O콜백들을 실행합니다. close 이벤트, setTimeout, setInterval setImmediate로 등록된 콜백을 제외한 모든 콜백은 여기서 실행됩니다. poll단계에 진입했을 때 콜백 **큐가 비어있지 않으면** 큐가 비거나 임계치에 도달할 때까지 등록된 콜백들을 실행합니다. **큐가 비어있다면** setImmediate로 등록된 콜백이 있으면 check단계로 넘어갑니다. setTimeout, setInterval로 등록된 타이머가 있는 경우 타이머의 시간이 만료될때까지 대기하고 만료된 시점에 timers단계로 넘어갑니다. 그렇지 않은 타이머가 만료되거나 새로운 연결이나 요청을 해당 단계에서 기다리게 됩니다.
<br>

#### check  
setImmediate()로 스케줄링된 콜백을 실행합니다. 사용자에게 poll 단계가 실행된 직후 콜백들을 실행할 수 있게 해줍니다.  
<br>

#### close callbacks  
on('close', ... ) 유형의 close 이벤트들의 콜백들 실행합니다.  
<br>

### References  

<https://medium.com/the-node-js-collection/what-you-should-know-to-really-understand-the-node-js-event-loop-and-its-metrics-c4907b19da4c>
<https://evan-moon.github.io/2019/08/01/nodejs-event-loop-workflow/>
<https://dev.to/lunaticmonk/understanding-the-node-js-event-loop-phases-and-how-it-executes-the-javascript-code-1j9>