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

## Features

Reefer supports following reef tank automations via webui

 - Switching on and off equipments on demand
 - Setting LED light intensity or DC pump speed
 - Setting up dusk to dawn like lighting
 - Auto Top Off
 - Periodic equipment on and off (daily, weekly etc)


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

  - [embd](http://embd.kidoman.io/), golang library, reefer uses to control hardware
  - [Nano-reef](http://www.nano-reef.com/), the best place on the internet to talk about nano reef tanks.
  - [Raspberry Pi Foundation](https://www.raspberrypi.org/). I hope all reference hardware becomes like this.
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
