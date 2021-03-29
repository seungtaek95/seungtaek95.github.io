---
title: "MongoDB의 Aggregation"
date: 2020-12-05 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

## Aggregation

MongoDB는 Aggregation 연산을 통해서 데이터에 여러가지 연산을 수행한 결과를 받을 수 있게 해준다. 이 aggregation 연산을 통해  도큐먼트를 내가 원하는 형태로 변형해서 받거나 서로 다른 컬렉션에 있는 도큐먼트를 받아올 수도 있다. 이 연산들을 묶어서 단계적으로 실행하는 것을 [Agregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)이라고 한고 각각의 연산을 stage라고 한다. 대표적인 aggregation pipeline stage들을 알아본다.

<br>

### \$addField, \$set

> { $addField: { \<newField>: \<expression>, ... } }

도큐먼트에 새로운 필드에 값을 추가한다. 같은 기능을 하는 \$set의 alias이기 때문에 두 연산은 같은 결과를 만든다. 이미 존재하는 필드에 대해서는 새로운 값으로 overwrite를 하게 된다.  

~~~javascript
db.person.insertOne({
  _id: 1,
  name: "Kim",
  age: 26
})

db.person.aggregate([
  { $addField: { city: "Seoul" } }
])
db.person.aggregate([
  { $set: { name: "Lee" } }
])
~~~

~~~json
{
  "_id": 1,
  "name": "Lee",
  "age": 26,
  "city": "Seoul"
}
~~~

<br>

### \$group

> {<br>
> &emsp;$group:<br>
> &emsp;&emsp;{<br>
> &emsp;&emsp;&emsp;_id: \<expression>, // null이나 상수값 가능<br>
> &emsp;&emsp;&emsp;\<field1>: { \<accumulator1> : \<expression1> },<br>
> &emsp;&emsp;&emsp;...<br>
> &emsp;&emsp;}<br>
> }

_id를 주어진 expression을 통해 그룹화된 도큐먼트로 하고, 주어진 accumulator의 연산 결과를 필드로 갖는 도큐먼트를 결과값으로 받는다.

~~~javascript
db.person.insertMany([
  { _id: 1, name: "Kim", age: 26 },
  { _id: 2, name: "Kim", age: 24 },
  { _id: 3, name: "Lee", age: 30 }
])

db.person.aggregate([
  { $group: { _id: "$name" } }
])
~~~

~~~json
{ "_id": "Kim" }
{ "_id": "Lee" }
~~~

위에서 _id를 name으로 그룹화하였는데 "\$name"이 [expression](https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expressions)으로, \$<field>는 현재 도큐먼트의 필드값을 의미한다. 위 데이터들에 대해서 "[\$sum]"(https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#grp._S_sum) accumulator 연산자를 사용하여 다음과 같은 결과를 만들 수도 있다.

~~~javascript
db.person.aggregate([
  { $group: { 
    _id: null,
    totalAge: { $sum: "$age" }
  } }
])
~~~

~~~json
{ "_id": null, "totalAge": 80 }
~~~

<br>

### \$project

> { $project: { <specification(s)> } }

도큐먼트에서 명시한 필드만 결과값으로 받을 수 있게 해준다. 필드의 값으로 0을 주면 해당 필드는 제외, 1을 주면 해당 필드를 결과값에 포함하겠다는 의미이다.

~~~javascript
db.person.insertOne({
  _id: 1,
  name: "Kim",
  age: 26,
  city: {
    "si": "Seoul",
    "gu": "Mapo"
  }
})

db.person.aggregate([
  { $project: { _id: 1, name: 1, age: 0 } }
])
~~~

~~~json
{ "_id": 1, "name": "Kim" }
~~~

내장 객체에 대해서는 "."연산자를 통해 값을 명시할 수 있다.

~~~javascript
db.person.aggregate([
  { $project: { "age": 0, "city.gu": 0 } }
])
~~~

~~~json
{ "_id" : 1, "name" : "Kim", "city" : { "si" : "Seoul" } }
~~~

<br>

### \$count

> { $count: \<string> }

해당하는 도큐먼트들의 수를 누적해서 더한 값을 지정한 문자열을 필드로 갖는 결과값으로 받게 해준다. 위에서 설명한 \$group과 \$project 스테이지를 합친 결과와 같다고 할 수 있다.

~~~javascript
db.person.insertMany([
  { "_id" : 1, "name" : "Kim" },
  { "_id" : 2, "name" : "Lee" },
  { "_id" : 3, "name" : "Park" },
  { "_id" : 4, "name" : "Kang" }
])

db.person.aggregate([
  { $count: "personCount" }
])
~~~
~~~javascript
{ "personCount" : 6 }
~~~

<br>

### \$lookup

> {<br>
> &emsp;$lookup:<br>
> &emsp;&emsp;{<br>
> &emsp;&emsp;&emsp;from: \<조인할 컬렉션>,<br>
> &emsp;&emsp;&emsp;localField: \<현재 컬렉션의 input 도큐먼트 필드>,<br>
> &emsp;&emsp;&emsp;foreignField: \<from에 명시한 컬렉션의 도큐먼트 필드>,<br>
> &emsp;&emsp;&emsp;as: \<결과 배열을 지정할 필드><br>
> &emsp;&emsp;}<br>
> }

같은 데이터베이스 내의 다른 컬렉션과 "Left Outer Join"을 수행한다. 흔히 Join 연산을 할 수 없다는 몽고디비에서 Join연산을 수행할 수 있는 aggregation 스테이지이다. localField로 지정한 필드와 foreignField로 지정한 필드 중 일치하는 외부 도큐먼트를 as에 지정한 이름의 필드에 배열로 담아서 결과값을 반환한다.

~~~javascript
db.person.insertMany([
  { _id: 1, name: "Kim", age: 26, city: "Seoul" },
  { _id: 2, name: "Lee", age: 28, city: "Busan" },
])

db.city.insertOne({
  _id: 1,
  name: "Seoul",
  population: "1000"
})

db.person.aggregate([
  { $lookup:
    {
      from: "city",
      localField: "city",
      foreignField: "name",
      as: "cityInfo"
    }
  }
])
~~~
~~~javascript
{
  "_id" : 1,
  "name" : "Kim",
  "age" : 26,
  "city" : "Seoul",
  "cityInfo" : [
    {
      "_id" : 1,
      "name" : "Seoul",
      "population" : "1000"
    }
  ]
}
{
  "_id" : 2,
  "name" : "Lee",
  "age" : 28,
  "city" : "Busan",
  "cityInfo" : [ ]
}
~~~

3.6 버전부터 다음과 같은 형식의 lookup 스테이지도 지원한다.

> {<br>
> &emsp;$lookup:<br>
> &emsp;&emsp;{<br>
> &emsp;&emsp;&emsp;from: \<collection to join>,<br>
> &emsp;&emsp;&emsp;let: { \<var_1>: \<expression>, …, \<var_n>: <expression> },<br>
> &emsp;&emsp;&emsp;pipeline: [ \<pipeline to execute on the collection to join> ],<br>
> &emsp;&emsp;&emsp;as: \<output array field><br>
> &emsp;&emsp;}<br>
> }


## References

<https://docs.mongodb.com/manual/aggregation/>


