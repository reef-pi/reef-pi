# reef-pi

A Raspberry Pi based reef tank controller


## Introduction

reef-pi is a [Raspberry Pi](https://www.raspberrypi.org/) based opensource
[reef tank](https://en.wikipedia.org/wiki/Reef_aquarium) controller written in [go](https://golang.org/). 


## Features

 - AC 110V electrical outlet control (e.g. return pump turn on  or off). 
 - PWM based DC outlet control (e.g. controlling Kessil lights or DC pumps)
 - Periodic jobs (e.g. daily dosing pump on and off)
 - Reading sensor data (e.g. temperature sensor)


## Guides
  - reef-pi controller [BoM](./doc/BOM.md) for [pico](./doc/bozeman.md) [reef](./doc/healdsburg.md) tanks
  - Using reef-pi
  - Building reef-pi housing and insgtalling electronics
  - Installing and configuring reef-pi on raspbian
  - Online resources
		- First reef-pi build [thread ](http://www.reef2reef.com/threads/reef-pi-an-open-source-raspberry-pi-based-reef-tank-controller.289256/), 


## Acknowledgements

reef-pi would not be possible without these awesome things:

  - [Raspberry Pi Foundation](https://www.raspberrypi.org/)
  - [Adafruit.com](https://www.adafruit.com/) for all peripheral boards, tutorials.
  - [embd](http://embd.kidoman.io/), go based IoT library.
  - [Nano-reef](http://www.nano-reef.com/), nano reef tanks knowledge source.


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
