---
title: "[React] Native Event와 Synthetic Event"
date: 2020-08-23 12:15:00 -0400
fontsize: 10pt
categories: react
---
<br>

react를 이용한 웹 페이지 개발 중, 상위 컴포넌트에 click 이벤트리스너가 있는 상황에서 하위 컴포넌트에 click 이벤트리스너를 등록하고 이벤트 버블링(event-bubbling)을 막아야하는 상황이 있었다. 평소처럼 event.stopPropagation() 을 사용해서 이벤트 버블링을 막으려고 했는데 생각했던 대로 작동하지 않고 상위 컴포넌트의 이벤트가 발생하는 것이었다. 이때 문제의 코드는 대략 다음과 같은 상황이었다.

```jsx
const myComponent = () => {
  const outside = document.getElementById('outside')
  outside.addEventListener('click', () => {
    console.log('onclick div')
  })
  
  return(
    <div id='outside'>
      <button onClick={event => {
          event.stopPropagation()
          console.log('onclick button')
        }}
      />
    </div>
  )
}
```

그래서 알아본 결과 리액트에서 관리하는 event는 브라우저의 DOM event와는 다른 것이라는 것을 알게되었다. 

<br>

## 뭐가 문제였을까? 

우리가 리액트 컴포넌트의 프로퍼티로 정의해주는 이벤트 핸들러(위 button태그의 onClick()) 가 처리하는 이벤트는 브라우저가 처리하는 일반적인 DOM의 event와는 다르다. 리액트에서는 이것을 SynthethicEvent라고 하며 이 이벤트 래퍼는 모든 브라우저에서 동일한 동작을 하고 DOM event와 똑같은 인터페이스를 가진다. 위에서 onClick()으로 정의한 이벤트 핸들러들은 이벤트 버블링 단계에서 호출되며 캡처 단계에서 호출하려면 이벤트 핸들러 뒤에 Capture를 붙여야 한다(onClick -> onClickCapture). 위 코드에서 각각의 event객체를 로그 찍어보면 두 가지가 다르다는 것을 알 수 있다.

```jsx
...

outside.addEventListener('click', event => {
  console.log(event)
  // NativeEvent
  // MouseEvent {isTrusted: true, screenX: 10, screenY: 128, clientX: 9, clientY: 16, …}
})

...
```

```jsx
...

<button onClick={event => {
  console.log(event)
  // SyntheticEvent
  // Class {dispatchConfig: {…}, _targetInst: FiberNode, nativeEvent: MouseEvent, type: "click", target: button, …}
  }}
/>

...
```
_syntheticEvent의 nativeEvent 필드를 통해 DOM event에 접근할 수 있음을 알 수 있다._

<br>

## NativeEvent와 SyntheticEvent  

syntheticEvent는 브라우저의 DOM event와 동일한 인터페이스를 제공하기 때문에 두 이벤트가 같은 이벤트 객체라는 착각을 만든다. 하지만 둘은 엄연히 다른 객체이며 **리액트의 컴포넌트에 onClick으로 작성한 이벤트 핸들러에서 stopPropagation()으로 이벤트 버블링을 막는다고 해도 이 이벤트 핸들러가 브라우저의 native event의 버블링까지 막아주지는 않는다.** 또한 native event에서 return false는 event.preventDefault()와 같은 기능을 하지만 synthetic event에서는 기본동작방지 기능을 하지 않으므로 명시적으로 event.preventDefault()를 콜해줘야 한다.

<br>

## Solution

문제는 리액트 어플리케이션에서 NativeEvent와 SyntheticEvent를 혼용해서 썼다는 것이다. 리액트에서 DOM의 native event를 사용할 수는 있지만 리액트에서는 기본적으로 SyntheticEvent만 사용하도록 하자. 위와 같은 상황이 발생할 수 있기 때문이다. 따라서 위 코드를 다음과 같이 고치면 문제는 해결된다.

```jsx
const myComponent = () => {
  return(
    <div onClick={() => {
      console.log('onclick div')
      }}
    >
      <button onClick={event => {
          event.stopPropagation()
          console.log('onclick button')
        }}
      />
    </div>
  )
}
```
<br>

> 리액트 어플리케이션에서 NativeEvent와 SyntheticEvent를 혼용해서 사용하는 일이 없도록 하자.

<br>

## References

<https://ko.reactjs.org/docs/events.html>  

<https://ryankubik.com/blog/dont-mix-react-synthetic-and-native-events/>  

<https://medium.com/tapjoykorea/%EB%A6%AC%EC%95%A1%ED%8A%B8-react-%EC%9D%98-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%ED%95%B8%EB%93%A4%EB%9F%AC-event-handler-syntheticevent-nativeevent-3a0da35e9e3f>  
