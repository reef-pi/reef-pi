# Reefer - A Raspberry Pi based reeftank automation system
![Ryan's BioCube 29G](https://raw.githubusercontent.com/ranjib/reefer/master/doc/images/bc29_fts.JPG)

## Introduction

Reefer is an opensource reef tank controller writen in go
that uses Raspberry Pi as main controlling board and various
hardware peripherals (sensors, motors etc) to automate and monitor
day to day reef keeping tasks.

Why another opensource Pi based controller?
 - I wanted to learn elctronics, go and also build a affordable reef tank.
 Reefer came out of that. More on this in [history](https://github.com/ranjib/reefer/blob/master/doc/history.md)
 - Costs less to get started. Raspberry Pi can be used for lot other purposes.
 - Reef building is an onerous task, with steep learning curve. Yet reef building is one of the most
 rewarding hobby. With lot of unknown and lot to learn, an opensource framework might
 help collaboratively learn those things by easy sharing of settings, profiles etc.
 - Customize and extend at will. Given here are lot more variables
 (size of tank, type of corals, type of fish, biotopes), reef keeping style may vary a lot.
 - Codifying learnings. Develop sharable reef tank setups
 160G tank builds. That eases initial and recurring cost and effort estimation.
 - Make it frugal. Easy to build from components with active communities.
 - Add hardware incrementally
 - IoT and smart reef (ability to control all reef tank devices from internet connected devices such as mobile and PC)

There are already a handful of Pi based aquarium controllers. Lot of my ideas
are inspired/borrowed by them or the learning from those discussion threads.


## Software stack

Reefer controller uses additional softwares other than the core go based controller daemon. These include:

- Ubuntu 16.04 as base operating system.
- Go language and build tools for all develoment purposes.
- Hardware abstractions are provided by gobot or embd, go based IoT libraries.
- systemd for ancillary tasks (periodic tasks, on-boot tasks etc)


## Hardware

 - The main controller board is Raspberry Pi. But should be portable on most SBC running linux.
 - Most other hardwares are from Adafruit. They have tutorials for most of them. I have learned electronics while building this


### Setup

- Power supply
- Hardware assembly
- Installing and configuring the controller software
- Testing, calibration
- Example setup


## Usage

Modules
  - Camera (Taking still images, streaming video)
  - Relay (Timer based on/off)
  - Dosing/TopOff
  - Heater, temperature control


## References

- [Bill of Materials for a Pico Tank](https://github.com/ranjib/reefer/blob/master/doc/BOM.md)
- [My Biocube 29 build thread](http://www.nano-reef.com/topic/372899-ryans-bc-29g/)
- [Issue tracker](https://github.com/ranjib/reefer/issues) for software development
- [Fritzing sketch](https://github.com/ranjib/reefer/blob/master/doc/reefer.fzz)
- [History](https://github.com/ranjib/reefer/blob/master/doc/history.md)


### Acknowledgements

- Nano-reef, the best place in internet to talk about nano reef tanks.
- Gobot & Embd, for making all those hardware abstractions in go.
- Raspberry Pi Foundation. I hope all reference hardware becomes like this.
- Adafruit.com for all the IoT tutorials


## License

Reefer itself the go language based controller is Apache 2.0 licensed. Rest
of the components licensing dictated by their manufacturer or Open Source
software / hardware projects.

Copyright:: Copyright (c) 2016 Ranjib Dey.
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
