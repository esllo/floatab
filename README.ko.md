# Floatab

[English](README.md) | [한국어](README.ko.md)

Floatab은 tauri를 사용하여 여러 웹 사이트를 띄우는 프로젝트입니다.

## 설명

tauri와 next를 사용하여 웹 사이트를 띄우는 프로그램으로 아래 기능을 지원합니다.

- 항상 위에 고정
- 윈도우 프레임 제거
- 마우스 이벤트 무시

## 요구 사항

floatab은 아래 환경이 필요합니다.

- node.js
- [tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites/)
- yarn (선택)

> `yarn`을 사용하지 않는 경우, `tauri.conf.json` 에서 `build` 영역의 `yarn`을 변경해야합니다.

## 시작하기

```shell
$ git clone https://github.com/esllo/floatab.git
$ cd floatab

# install dependencies
$ yarn install

# dev 
$ yarn tauri dev

# build
$ yarn tauri build
```


## 라이선스

MIT [LICENSE.md](LICENSE.md) 
