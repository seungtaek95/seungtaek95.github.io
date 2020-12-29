---
title: "nginx를 이용한 reverse proxy 구현"
date: 2020-12-29 21:34:00 -0400
fontsize: 10pt
categories: web
---

<br>

## Proxy

Proxy. 대리, 대리인이라는 뜻을 가진 영어단어이다. 컴퓨터 네트워크에서 proxy라는 단어는 클라이언트의 네트워크 요청이 적절한 서버에 도착하도록 중간에서 요청을 처리해주는 웹 프록시를 말한다. 프록시에는 `포워드 프록시(Forward Proxy)`와 `리버스 프록시(Reverse Proxy)`가 있다.

<br>

### Forward Proxy

![forward proxy](https://user-images.githubusercontent.com/50684454/103279863-3391ec00-4a12-11eb-9704-9f219daf06d3.png)

포워드 프록시에서는 프록시 서버가 클라이언트의 바로 앞단에 위치한다. 이 프록시 서버는 클라이언트의 요청을 인터넷을 통해 보내기 전에 요청을 가로채서 정해진 작업을 수행한다.
<br>
포워드 프록시를 통해 클라이언트의 요청을 제한하거나 특정 콘텐츠로의 접근을 차단할 수 있다. 또한 프록시 서버의 ip만이 공개되기 때문에 클라이언트의 정보를 인터넷상에서 보호할 수가 있다.

<br>

### Reverse Proxy

![reverse proxy](https://user-images.githubusercontent.com/50684454/103279885-41477180-4a12-11eb-9046-f11454fec5db.png)

리버스 프록시에서는 프록시 서버가 하나 또는 여러 개의 서버 앞단에 위치한다. 그렇기 때문에 리버스 프록시에서 프록시 서버는 클라이언트의 요청을 네트워크의 마지막 단에서 가로채서 요청을 여러 서버에 분산시켜주는 역할을 한다.
<br>
리버스 프록시를 이용한 장점으로는 로드 밸런싱이 가능하다는 것과 데이터의 캐싱이 가능하다는 것이다. 또한 클라이언트는 공개되는 정보만으로는 실제 서버의 설계가 어떻게 되어있는지를 알 수가 없기 때문에 보안상 아주 큰 장점이 있다.  

## References

<https://www.cloudflare.com/ko-kr/learning/cdn/glossary/reverse-proxy/>