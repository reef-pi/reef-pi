# reef-pi

An open source reef tank controller based on Raspberry Pi

[![GitHub release](https://img.shields.io/github/release/reef-pi/reef-pi.svg)](https://github.com/reef-pi/reef-pi/releases)
[![Build Status](https://travis-ci.org/reef-pi/reef-pi.png?branch=master)](https://travis-ci.org/reef-pi/reef-pi)
[![Coverage Status](https://codecov.io/gh/reef-pi/reef-pi/branch/master/graph/badge.svg)](https://codecov.io/gh/reef-pi/reef-pi)
[![Go Report Card](https://goreportcard.com/badge/reef-pi/reef-pi)](https://goreportcard.com/report/reef-pi/reef-pi)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/reef-pi/reef-pi/blob/master/LICENSE.txt)
[![GoDoc](https://godoc.org/github.com/reef-pi/reef-pi?status.svg)](https://godoc.org/github.com/reef-pi/reef-pi)

## Introduction

[reef-pi](http://reef-pi.com) is an opensource [reef tank](https://en.wikipedia.org/wiki/Reef_aquarium) controller based on  [Raspberry Pi](https://www.raspberrypi.org/). This is the software repository for reef-pi. If you are trying to build a physical controller to automate your reef tank, use reef-pi [website](http://reef-pi.com). If you are new to reef keeping and want to know about the hobby use one of the online forums such as [reef2reef](https://www.reef2reef.com/) or [nano-reef](https://www.nano-reef.com/)(for smaller reef tanks).


reef-pi is an [award winning](https://reef-pi.github.io/blogs/makerfaire-2017/), modular, do it yourself (DIY) project that aims to provide a hackable, affordable reef tank automation platform using easy to learn electronics. Apart from Raspberry Pi, reef-pi uses a handful of additional electronics boards from [adafruit](https://www.adafruit.com/), a open hardware, community-focused electronics company. reef-pi is under active development. Follow reef2reef [thread](http://www.reef2reef.com/threads/reef-pi-an-open-source-raspberry-pi-based-reef-tank-controller.289256/) if you want to stay up to date with reef-pi development. Use the build guides on reef-pi [website](http://reef-pi.com) if you just want to build a reef tank controller based on reef-pi. We use slack for developer communication. Click [here](https://join.slack.com/t/reef-pi/shared_invite/enQtNDI4NzM4MjEzNDk1LWQzMzMxN2I5MDhmNGFlNjdjZGEyYTAwYTBkN2Y5NjIzODkxMmNlYjFlYTk2ZDM0MjRmOGUwNzBhY2FmZTVhMjg) to join reef-pi slack channel. reef-pi development environment setup documentation can be found [here](https://reef-pi.github.io/additional-documentation/development/).


## Features

- Web browser based user interface
- On-demand & timer based control of equipment
- Sunrise to sunset LED lighting automation
- Temperature monitoring and control
- pH monitoring
- Dosing pump (peristaltic pumps) control
- Auto Top off
- Email alerts, charts, and dashboard capabilities. [Adafruit.io](https://io.adafruit.com/) based telemetry for monitoring.
- On-demand or automatic tank photo capture with google drive upload using pi camera


## Acknowledgments

reef-pi would not be possible without these awesome things:

  - [Raspberry Pi Foundation](https://www.raspberrypi.org/)
  - [Adafruit.com](https://www.adafruit.com/) for all peripheral boards, tutorials.
  - [go](https://golang.org/), the programming language that powers reef-pi non-ui parts.
  - [react](https://reactjs.org/), a javascript framework used by reef-pi user interface.
  - [github](https://github.com/), the social coding platform that provide reef-pi code, website and release package hosting.
  - [embd](http://embd.kidoman.io/), go based IoT library used by reef-pi.
  - [reef2reef](https://www.reef2reef.com/), worlds largets reef tank user forum where reef-pi's original discussion thread is hosted.
  - [travis ci](https://travis-ci.org/) for continuous integration service


## License

Copyright:: Copyright (c) 2018 Ranjib Dey.
License:: Apache License, Version 2.0

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
