# Reefer

A Raspberry Pi based reeftank automation system

![Ryan's BioCube 29G](https://raw.githubusercontent.com/ranjib/reefer/master/doc/images/bc29_fts.JPG)

## Introduction

Reefer is an opensource [reef tank](https://en.wikipedia.org/wiki/Reef_aquarium)
controller written in [go](https://golang.org/)
that uses Raspberry Pi as main controlling board and various
hardware peripherals (sensors, motors etc) to automate and monitor
day to day reef keeping tasks.

More on reefer's [history](https://github.com/ranjib/reefer/blob/master/doc/history.md)


## Software

Reefer controller uses additional software other than the core go based controller daemon. This include:

  - Ubuntu 16.04 as the base operating system.
  - Go language and build tools for all development purposes.
  - Hardware abstractions are provided by gobot or embd, go based IoT libraries.
  - systemd for ancillary tasks (periodic tasks, on-boot tasks etc)


## Hardware

 - The main controller board is Raspberry Pi. But should be portable on most SBC running Linux.
 - Most other hardware are from Adafruit. They have tutorials for most of them. I have learned electronics while building this


## Setup

  - Decide and purchase all the aquarium hardware.
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


## Acknowledgements

  - [Nano-reef](http://www.nano-reef.com/), the best place on the internet to talk about nano reef tanks.
  - [Raspberry Pi Foundation](https://www.raspberrypi.org/). I hope all reference hardware becomes like this.
  - [Gobot](https://gobot.io/) & [Embd](https://github.com/kidoman/embd), for making all those hardware abstractions in go.
  - [Adafruit.com](https://www.adafruit.com/) for all the IoT tutorials


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
