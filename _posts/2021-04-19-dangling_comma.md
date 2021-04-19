---
title: "[JS] Trailing-commas를 사용하는 이유"
date: 2021-04-19 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

## Trailing-commas

`Trailing-commas` 또는 `Final-commas`는 배열, 오브젝트 프로퍼티 등의 항목의 나열에서 마지막 항목에 콤마를 붙여도 컴파일 시 오류가 없는 자바스크립트의 특성을 이용한 구문 작성방법이다. (우리나라 말로는 후행 콤마? 정도로 부르는 것 같다) MDN에 [자세한 설명](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Trailing_commas)이 나와있다. 대표적인 자바스크립트 린팅 툴인 eslint에는 [comma-dangling](https://eslint.org/docs/rules/comma-dangle)이라는 속성으로 해당 기능을 활성화 할 수 있는 옵션이 존재한다. 구글링을 해보면 이 구문 작성방법에 대한 호불호가 상당한 것을 찾아볼 수가 있는데, 한 포스트([원문](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8))를 보고 trailing-commas에 대해 느낀점을 정리해보려고 한다.

### 깔끔한 git-diffs

git과 같은 버전관리 시스템을 사용할 때, vs code의 extension이나 github 웹페이지 상에서 코드를 이전 커밋과 비교하는 경우가 있다. 

![plus-diff1](https://user-images.githubusercontent.com/50684454/115234147-ad7dea80-a153-11eb-893d-b3318d844ac6.png)*항목 추가*

![minus-diff1](https://user-images.githubusercontent.com/50684454/115234285-d0a89a00-a153-11eb-9d3f-c9bf157a3985.png)*항목 제거*

![plus-diff2](https://user-images.githubusercontent.com/50684454/115234503-0fd6eb00-a154-11eb-9562-c4be88e24586.png)*항목 추가 - trailing-commas*

![minus-diff2](https://user-images.githubusercontent.com/50684454/115234531-18c7bc80-a154-11eb-935f-a232579e5dcf.png)*항목 제거 - trailing-commas*

## References

<https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8>