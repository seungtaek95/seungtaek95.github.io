---
title: "[JS] Trailing-commas를 사용하는 이유"
date: 2021-04-19 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

## Trailing-commas

`Trailing-commas` 또는 `Final-commas`는 배열, 오브젝트 프로퍼티 등의 항목의 나열에서 마지막 항목에 콤마를 붙여도 컴파일 시 오류가 없는 자바스크립트의 특성을 이용한 구문 작성방법이다. (우리나라 말로는 후행 콤마? 정도로 부르는 것 같다) MDN에 [자세한 설명](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Trailing_commas)이 나와있다.  
```javascript
// array에서의 trailing-commas
const cities = [
  "Seoul",
  "Busan",
]

// object에서의 trailing-commas
const person = {
  name: "Kim",
  age: 27,
}
```

구글링을 해보면 이 구문 작성방법에 대한 호불호가 상당한 것을 찾아볼 수가 있는데, 한 포스트([원문](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8))를 보고 trailing-commas에 대해 느낀점을 정리해보려고 한다.

### 장점  

git과 같은 버전관리 시스템을 사용할 때, vs code의 extension이나 github 웹페이지 상에서 코드를 이전 커밋과 비교하는 경우가 있다. 배열에 항목이 추가되는 경우, trailing-commas를 사용하지 않은 코드라면 2줄의 코드에 변화가 있을 것이고, trailing-commas를 사용한다면 한줄의 코드 변화만 있을 것이다. 그리고 이것이 코드를 비교하는 입장에서 확실히 보기가 편하게 느껴진다.

<style>
		img { display: block; margin: 0px auto; }
</style>

<img src=https://user-images.githubusercontent.com/50684454/115234147-ad7dea80-a153-11eb-893d-b3318d844ac6.png width="300em" alt="plus-no-comma"/>
<p style="text-align: center;">항목 추가</p>

<img src=https://user-images.githubusercontent.com/50684454/115234503-0fd6eb00-a154-11eb-9562-c4be88e24586.png width="300em" alt="plus-comma">
<p style="text-align: center;">항목 추가 - trailing-commas</p>

배열의 항목이 제거되는 경우도 배열에 항목이 추가되는 경우와 같다.

<img src=https://user-images.githubusercontent.com/50684454/115234285-d0a89a00-a153-11eb-9d3f-c9bf157a3985.png width="300em" alt="minus-no-comma">
<p style="text-align: center;">항목 제거</p>

<img src=https://user-images.githubusercontent.com/50684454/115234531-18c7bc80-a154-11eb-935f-a232579e5dcf.png width="300em" alt="minus-comma">
<p style="text-align: center;">항목 제거 - trailing-commas</p>

추가로, 코드를 수정하는 입장에서도 trailing-commas가 없을때는 한 줄을 추가할 때, 이전 줄의 마지막에 콤마를 붙이고, 한 줄을 추가하는 것보다는 단순히 원하는 줄만 추가하는것이 더 편하다. 제거할 때는 원하는 줄만 제거하면 되고, 위에 줄까지 올라가서 콤마를 제거할 필요가 없다.  

#### eslint  

대표적인 자바스크립트 린팅 툴인 eslint에는 [comma-dangling](https://eslint.org/docs/rules/comma-dangle)이라는 속성으로 해당 기능을 활성화 할 수가 있고, 다음 네 가지 옵션 중 하나를 사용할 수 있다.  

* `"never"`: comma-dangling을 사용하지 않음
* `"always"`: 항상 comma-dangling을 사용함 (한 줄의 코드에 배열 항목이 나열되어있어도. `e.g. const num = [1, 2, 3,]`)
* `"always-multiline"`: 오브젝트의 `}`나 배열의 `]`가 배열의 항목과 다른 줄에 있는 코드의 경우 무조건
* `"only-multiline"`: 오브젝트의 `}`나 배열의 `]`가 배열의 항목과 다른 줄에 있는 코드의 경우 허용

### 단점 ?  

사실 커뮤니티에서 trailing-commas를 반대사람들의 입장은 대부분은 코드가 보기 안좋다(?)라는 입장이다. (사실 명확히 어떠해서 사용하지 않는다라는 의견은 없는 것 같다) 제일 논리적이었던 의견 중 하나는 trailing-commas를 사용하면 어떤 항목이 배열의 마지막 항목이라는 것을 코드상에서 또는 코드 변화에서 알 수가 없다는 것이다. 아니면 어떤 언어에서는 이것이 컴파일 오류를 일킨다 라는 것이다.

### 결론

나도 처음에는 trailing-commas가 보기 불편하고, 배열이나 오브젝트 프로퍼티의 마지막을 나타내지 못한다는 생각에 거부감이 있었다. 그런데 eslint에서 해당 옵션을 활성화 시킨 뒤로는 딱히 trailing-commas를 사용하지 않을 이유를 찾지는 못하고 있다. 협업시에 코드 컨벤션을 정하는 시기에 팀원들 간에 의견만 통일된다면 한번 사용해보고 판단해보는 것도 나쁘지는 않을 것 같다.

## References

<https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8>