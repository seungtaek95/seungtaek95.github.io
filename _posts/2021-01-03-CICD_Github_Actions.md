---
title: "CI/CD를 해보자 - Github Actions"
date: 2021-01-03 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

개발을 하면서 필요한 CI(Continuous Integration), 지속적 통합을 위한 여러 툴들이 있다. Jenkins, Travis CI 이 두 가지가 대표적인 CI 툴로 사용되고 있다. 그리고 가장 따끈따끈한 서비스로 Github에서도 Github Actions라는 CI/CD 서비스를 2019년에 출시했다. 회사내에서도 그렇고 개인적으로도 Github을 쓰고있기 때문에 다른 툴들은 보류하고, Github Actions를 이용해서 어떻게 삶의 질을 높일 수 있는지 알아보도록 하자.

## 테스트 프로젝트 생성

테스트할 프로젝트는 node.js 환경에서 돌아가는 javascript 어플리케이션으로 npm으로 관리되고, 다음 파일들로만 이루어진 간단한 어플리케이션이다.

main.js
~~~javascript
const sum = require('./sum')

console.log(`3 + 5 = ${sum(3, 5)}`);
~~~

sum.js
~~~javascript
module.exports = function(a, b) {
  return Number(a) + Number(b);
}
~~~

sum.test.js
~~~javascript
const sum = require('./sum')

test('3 + 5 = 8', () => {
  expect(sum(3, 5)).toBe(8)
})
~~~

package.json
~~~json
...
  "scripts": {
    "start": "node main.js",
    "test": "jest"
  },
...
  "devDependencies": {
    "jest": "^26.6.3"
  }
...
~~~
<br>

## Workflow 생성

CI에서 workflow란, 내가 어떤 상황에 어떤 테스트를 진행할 것이고, 그것이 완료되었을 때 어떤 행동을 할 것인지를 정의하는 것이다. 예를 들면, 
__main 브랜치에 push가 있을 경우, test코드를 돌리고, 테스트 통과 시에 도커 이미지를 빌드해서 원격 저장소에 전송한다__ 같은 workflow가 있을것이다.

해당 프로젝트를 깃헙 레파지토리에 업로드하고 Actions탭을 눌러보면 다음과 같이 깃헙에서 알아서 프로젝트의 구성을 인식하고 맞춤 workflow를 추천해준다. (그저 빛..)  
현재 프로젝트에 가장 적합한 Node.js를 선택하기위해 Node.js의 `Set up this workflow` 를 클릭해준다.  

![actions](https://user-images.githubusercontent.com/50684454/103472893-268c4880-4dd6-11eb-9f1d-7795ff719fc1.png)

worlflow를 적용하기 위한 yml파일을 작성해야하는데, 다음과 같이 해당 경로에 yml 파일도 직접 완성해준다. (그저 빛2..)  
오른쪽의 marketplace탭에서 원하는 action을 선택하면 yml코드를 주는데 이걸 workflow 작성에 바로 사용할 수도 있다. 일단 아무것도 건드리지 않고 github에서 기본으로 만들어주는 yml 파일을 생성하고 수정하는 방식으로 진행하겠다. `Start commit` 버튼을 눌러서 yml 파일을 바로 커밋해준다.  

![workflows](https://user-images.githubusercontent.com/50684454/103472906-3efc6300-4dd6-11eb-99b9-5d59783b76c1.png)
<br>

## Workflow 설정
다음과 같이 yml파일을 필요한 부분만 남기고 간소화 시켜주자.  

~~~yml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v1
      with:
        node-version: 14
    - run: npm ci
    - run: npm test
~~~

`name`  
workflow의 이름  

`on`  
event를 설정하는 부분. git 이벤트를 명시하고 해당 이벤트를 적용할 브랜치를 명시해 준다. __on.schedule__ 을 통해 특정 시간에 실행될 action을 명시할 수도 있다.  

`jobs`  
workflow는 하나 이상의 job으로 구성된다. 여기서는 build라는 job이 하나 있다. 모든 job들은 parallel하게 실행되고, __jobs.<job_id>.needs__
를 통해 sequential하게 실행되도록 설정할 수 있다.  

`jobs.<job_id>.rus-on`: job을 실행할 머신환경을 명시한다. 운영체제의 특정 버전을 명시해 준다.  

`steps`  
순차적으로 실행할 task들의 집합이다.  

`steps.name`: Github에 보여질 이름이다.  

`steps.uses`: job의 일부분으로 실행할 action을 명시해 준다. 기존에 만들어진 action이나 다른 사람이 만들어놓은 action을 사용할 수 있다. [actions/checkout](https://github.com/actions/checkout) 은 소스코드를 $GITHUB_WORKDIR 로 가져와서 workflow가 소스코드에 접근할 수 있게 해준다. node실행 환경을 위해서 [actions/setup-node](https://github.com/actions/setup-node) 도 반드시 사용해야 한다.  

`steps.with`: step에서 사용될 key/value로 이루어진 환경변수이다.  

`steps.run`: 실행할 커맨드를 명시해준다.  

<br>

job의 이름은 test로 바꿔주었고, main 브랜치에 PR이나 push가 있을때 workflow가 작동되게 설정해주었다. 테스트는 node 14버전에서 돌아가게 해주었다.  

yml파일 수정을 'new yml'이라는 이름으로 커밋하고 main브랜치에 푸시하고 Github repository의 Action탭을 눌러보면 자동으로 workflow가 실행되고 있는 것을 확인할 수 있다.  

![test1](https://user-images.githubusercontent.com/50684454/103474247-5262fa80-4de5-11eb-810a-73367d1acefb.png)

`new yml`을 눌러보면 workflow의 현재 진행 상태를 job별로 확인할 수 있다. 현재 test라는 job이 진행중이다. `Cancel workflow`버튼을 통해 workflow를 취소할 수도 있다.  

![test2](https://user-images.githubusercontent.com/50684454/103474248-54c55480-4de5-11eb-8875-de852f482da1.png)

job이 성공적으로 통과되었다.  

![test3](https://user-images.githubusercontent.com/50684454/103474249-55f68180-4de5-11eb-8036-692b7918a557.png)

해당 job을 클릭해서 step별로 자세한 정보를 확인할 수 있다. step을 펼쳐보면 해당 step에서 발생한 output을 확인할 수 있다.  

![test4](https://user-images.githubusercontent.com/50684454/103474250-5727ae80-4de5-11eb-8a0b-b509cd20d308.png)  

![image](https://user-images.githubusercontent.com/50684454/103474365-6eb36700-4de6-11eb-8d25-b0091f48728f.png)

<br>

## References

<https://docs.github.com/en/free-pro-team@latest/actions>
<https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions>