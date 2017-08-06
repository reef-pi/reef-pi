# reef-pi

A Raspberry Pi based open source reef tank controller

![dashboard](https://github.com/reef-pi/reef-pi/raw/master/doc/images/ui.png "reef-pi dashboard")


## Introduction

[reef-pi](http://reef-pi.com) is an opensource [reef tank](https://en.wikipedia.org/wiki/Reef_aquarium) controller based on  [Raspberry Pi](https://www.raspberrypi.org/).


**Features**

 - Web based user interface. Use tablet, phone or anything connected to home internet to interact with reef-pi.
 - On demand control of AC (110 volt or 220 volt) electrical outlets (e.g. return pump turn on or off, nightly refugium light on/off etc). ![equipment](https://github.com/reef-pi/reef-pi/raw/master/doc/images/relay.png "relay")
 - Timer based control of AC (110 volt or 220 volt) electrical outlets (e.g. return pump turn on or off, nightly refugium light on/off etc). ![job](https://github.com/reef-pi/reef-pi/raw/master/doc/images/ui.png "timer")
 - Sun-rise to sunset LED lighting control (0-10 volt DPWM, e.g. kessil light controller) ![lighting](https://github.com/reef-pi/reef-pi/raw/master/doc/images/lighting.png "lighting")
 - Temperature sensor and controller (based on DS18B20 temperature probe)
 - Auto Top off based on photo electric or float switch based water level sensor
 - Dosing pump controls
 - Adafruit.io based telemetry for monitoring, charting and dashboard. ![chart](https://github.com/reef-pi/reef-pi/raw/master/doc/images/chart.png "reef-pi dashboard")


reef-pi is an Maker Faire Editor's choice [award winning](https://reef-pi.github.io/blogs/makerfaire-2017/), modular, do it yourself (DIY) project that aims to provide a hackable, affordable reef tank automation platform using easy to learn electronics. Apart from Raspberry Pi, reef-pi uses handful of additional electronics boards from [adafruit](https://www.adafruit.com/), a open hardware, community focused electronics company. reef-pi is under active development. Follow reef2reef [thread](http://www.reef2reef.com/threads/reef-pi-an-open-source-raspberry-pi-based-reef-tank-controller.289256/) if you want to stay up to date with reef-pi development. Use reef-pi [website](http://reef-pi.com) if you just want to build a reef tank controller based on reef-pi.



## Acknowledgements

reef-pi would not be possible without these awesome things:

  - [Raspberry Pi Foundation](https://www.raspberrypi.org/)
  - [Adafruit.com](https://www.adafruit.com/) for all peripheral boards, tutorials.
  - [embd](http://embd.kidoman.io/), go based IoT library.
  - [reef2reef](https://www.reef2reef.com/), an online reef tank user forum.


## License

Copyright:: Copyright (c) 2017 Ranjib Dey.
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
