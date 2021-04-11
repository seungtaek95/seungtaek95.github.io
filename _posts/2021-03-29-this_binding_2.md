---
title: "[JS] 알쏭달쏭 this 바인딩 (2)"
date: 2021-04-11 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

[앞서](https://seungtaek95.github.io/dev/this_binding_1/) 설명한 4개의 this binding 규칙 중 나머지 두 가지를 알아본다. 

<br>

## 명시적 바인딩 (Explicit Binding)  

자바스크립트의 모든 Function 은 [`call()`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/call), [`apply()`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/apply), [`bind()`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)라는 프로토타입 메소드를 호출함으로서 this 바인딩을 코드에 명시할 수 있다. 이 3가지 메소드 중 하나를 이용해서 this 바인딩을 하는 것을 명시적 바인딩이라고 한다.  

#### call(), apply()  

~~~javascript
function foo() {
  console.log(this.a);
}

const bar = {
  a: 20,
}

foo.call(bar) // 20
foo.apply(bar) //20
~~~

foo의 프로토타입 메소드 `call`, `apply`를 호출할 때 바인딩할 객체를 넘겨줌으로서 foo 함수의 this를 `bar`로 직접 바인딩 해주었다. `call`과 `aplly`는 두번째 매개변수로 객체의 인자를 전달해주는데(e.g. 생성자의 매개변수), `call`은 매개변수의 목록, `apply`는 배열을 받는다.  

#### bind()  
~~~javascript
function foo() {
  console.log(this.a);
}

const bar = {
  a: 20,
}

const bound = foo.bind(bar)

bound() //20
~~~

`bind`는 매개변수로 전달받은 오브젝트로 this가 바인딩된 함수를 반환한다. 이것을 하드 바인딩이라고 하는데 하드 바인딩 된 함수는 이후 호출될 때마다 정해진 this 바인딩대로 호출된다.

## new 바인딩 (New Binding)  

자바스크립트의 new 키워드는 함수를 호출할 때 앞에 new 키워드를 사용하는 것으로 객체를 초기화할 때 사용하는데, 이때 사용되는 함수를 생성자 함수라고 한다. (컨벤션으로 생성자 함수는 대문자로 시작한다)

~~~javascript
function Foo() {
  this.a = 20
}

const foo = new Foo()

console.log(foo.a) // 20
~~~

위 코드에서 Foo 함수가 new 키워드와 함께 호출되는 순간 새로운 객체가 생성되고, 새로 생성된 객체가 this로 바인딩이 된다. 그리고 생성된 객체를 반환하게 되고, 그 객체는 foo라는 변수에 할당되었다.

<br>

## 그 외  

#### self, _this  

apply, call, bind같은 바인딩 메소드가 제공되기 전에는 골치아픈 this 바인딩을 어휘적 스코프(lexical scope)를 이용해서 해결하였다. 호출시 결정되는 this를 어휘적 스코프를 이용해 선언시에 정해주는 효과를 주는 것이다.

~~~javascript
function foo() {
  setTimeout(function () {
    console.log(this.a)
  }, 1)
}

const bar = {
  a: 20,
  foo: foo
}

bar.foo() // undefined
~~~

위 상황에서 setTimeout에 콜백으로 넘겨진 함수의 this는 setTimeout에 의해 실행될때 전역객체에 바인딩이 된다.

~~~javascript
function foo() {
  const self = this

  setTimeout(function () {
    console.log(self.a)
  }, 1)
}

const bar = {
  a: 20,
  foo: foo
}

bar.foo() // 20
~~~

위와같이 self(또는 _this)라는 변수를 만들어서 함수 실행시에 bar 객체에 바인딩된 this를 할당해놓으면, 콜백이 실행될때 렉시컬 스코프에 의해 self라는 변수를 this 오브젝트에 접근하는데 사용할 수 있다.  

#### 화살표 함수

ES6에 추가된 화살표 함수(Arrow Function)는 this를 바인딩할 때 앞서 설명한 규칙들이 적용되지 않고, 렉시컬 스코프를 이용해 함수 선언시에 this를 바인딩한다.

~~~javascript
function foo() {
  setTimeout(() => {
    console.log(this.a)
  }, 1)
}

const bar = {
  a: 20,
  foo: foo
}

bar.foo() // 20
~~~

화살표 함수로 선언시에 렉시컬 스코프를 통해 바인딩된 this는 apply, bind등의 함수나 new 함수로 오버라이드할 수 없다. 그렇기때문에 주로 콜백 함수로 사용할 때 유용하다.

## References  

도서: You Dont't Know JS (this와 객체 프로토타입, 비동기와 성능)  
