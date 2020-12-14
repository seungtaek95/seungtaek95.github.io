---
title: "도커 레지스트리(Docker registry)로 개인 이미지 저장소 만들기"
date: 2020-11-29 21:34:00 -0400
fontsize: 10pt
categories: dev
---

<br>

## Docker Hub

[Docker repogitory](https://docs.docker.com/docker-hub/repos/)란 도커 이미지를 저장하는 저장소이다. 깃으로 관리되는 파일들을 저장하는 Git Repository와 비슷한 개념으로 이해할 수 있다. 도커는 [Docker Hub](https://hub.docker.com/)라는 원격 저장소를 제공해서 이미지를 public하게 공유하거나, private 저장소를 통해 팀, 개인이 사용할 원격 저장소를 만들 수 있다.

<br>

우리가 흔히 사용하는 'docker pull \<image name\>' 명령어를 사용하면 도커 엔진은 도커 허브에서 해당하는 public 이미지를 찾아서 로컬에 다운로드한다. 도커 허브의 공개 저장소에 이미지를 올리거나 다운받는 것은 무료이지만, 이미지를 외부에 공개하지 않는 private 저장소는 유료로 제공하고 있다.

## Docker Registry

도커는 이미지 저장소를 구축할 수 있는 [registry](https://hub.docker.com/_/registry)라는 도커 이미지를 제공한다. 이 이미지를 이용해서 private한 이미지 저장소를 구축할 수 있다. 먼저 registry 이미지를 다운받는다.

~~~sh
$ docker pull registry
~~~

registry는 5000번 포트를 사용하기 때문에 5000번 포트를 외부로 공개해서 컨테이너를 실행한다.

~~~sh
$ docker run -d --name my-registry -p 5000:5000 registry
~~~

## push image

registry에 올려볼 간단한 이미지를 만들기 위해 Dockerfile 하나를 작성한 후 빌드한다.

~~~dockerfile
FROM alpine:latest

CMD ["echo", "hello, world!"]
~~~
~~~sh
$ docker build -t hello .
~~~

이제 이 hello라는 이미지를 registry에 push 해야하는데 그 전에 이미지에 tag 명령을 통해저장소 주소를 달아주어야 한다. 로컬에 registry저장소가 실행되고 있으므로 localhost:5000으로 설정해준다.

~~~sh
$ docker tag hello localhost:5000/hello
~~~

또는 처음 이미지를 빌드할 때부터 이름을 이렇게 지어줄 수도 있다.

~~~sh
$ docker build -t localhost:5000/hello .
~~~

이제 두 개의 이미지가 로컬 저장소에 생긴 것을 확인할 수 있다.

~~~
REPOSITORY             TAG                 IMAGE ID            CREATED             SIZE
hello                  latest              3693d7c47874        5 minutes ago       5.57MB
localhost:5000/hello   latest              3693d7c47874        5 minutes ago       5.57MB
~~~

registry에 이미지를 push 해주고 pushed라는 응답을 확인한다.

~~~sh
$ docker push localhost:5000/hello

The push refers to repository [localhost:5000/hello]
ace0eda3e3be: Pushed
~~~

registry에 있는 이미지를 확인할 때는 다음 url에 GET요청을 보내면 된다. 간단하게 curl을 통해 확인해 볼 수 있다.

~~~sh
$ curl -X GET http://localhost:5000/v2/_catalog

{"repositories":["hello"]
~~~

저장소에 hello라는 이미지가 저장되어있는 것을 확인할 수 있다.

## pull image

현재 로컬에 있는 hello와 localhost:5000/hello 이미지를 삭제한다.

~~~sh
$ docker rmi hello
$ docker rmi localhost:5000/hello

$ docker images

REPOSITORY             TAG                 IMAGE ID            CREATED             SIZE
~~~

아무 이미지도 없는 상태에서 로컬에서 실행중인 registry에 hello 이미지의 다운로드를 요청하면 이미지를 받아오는 것을 확인할 수 있다.

~~~sh
$ docker pull localhost:5000/hello

$ docker images

REPOSITORY             TAG                 IMAGE ID            CREATED             SIZE
localhost:5000/hello   latest              3693d7c47874        About an hour ago   5.57MB
~~~

## different host

같은 네트워크를 공유하는 다른 서버에서 registry의 이미지를 받아온다는 상황을 가정하기 위해 docker-machine으로 가상 호스트를 생성해서 그곳에서 이미지를 pull해보려고 한다. docker-machine으로 node1이라는 호스트 하나를 생성하고 접속한다.

~~~sh
$ docker-machine create node1

$ docker-machine ssh node1
~~~

방금 생성된 이 가상 호스트에서 registry(192.168.\*.\*:5000, 본인 localhost 주소)에 이미지를 다운받는 요청을 보내면 다음과 같은 오류를 받을 것이다.

~~~sh
$ docker pull 192.168.0.11:5000/hello
~~~
> Error response from daemon: Get https://192.168.0.11:5000/v2/: http: server gave HTTP response to HTTPS client

Docker registry는 https를 이용해서만 서로 다른 호스트간의 이미지 전송을 허용하기 때문에 현재 registry가 https 응답을 보내주어야 한다. SSL 인증서를 사거나 생성해서 이 문제를 해결할 수 있다. 임시방편으로 해결하려면 registry를 실행중인 호스트에서 해당 registry를 insecure-registries에 추가할 수도 있다.[(참고)](https://docs.docker.com/registry/insecure/)

## References

<https://docs.docker.com/registry/deploying/>

<https://novemberde.github.io/2017/04/09/Docker_Registry_0.html>