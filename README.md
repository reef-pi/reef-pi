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
 - Reef building is an onerous task, with steep learning curve yet one of the most
 rewarding hobby, with lot of unknowns. Collaboration is easier on open source.
 - Customize and extend at will.
 - Codifying learnings. Develop sharable SPS/LPS specific pico, nano and standard
 160G tank builds. That eases initial and recurring cost and effort estimation.
 - Make it frugal. Easy to build from components with active communities.
 - Add hardware incrementally
 - IoT and smart reef (ability to control all reef tank devices from internet connected devices such as mobile and PC)

There are already a handful of Pi based aquarium controllers. Lot of my ideas
are inspired/borrowed by them or the learning from those discussion threads.


## Software stack

- Ubuntu 16.04 on Raspberry Pi 2.
- Core software is written in go
- Hardware abstractions are on top of gobot or embd
- systemd for ancillary tasks


## Hardware
 - Raspberry Pi. But should be portable on most SBC running linux.
 - Most other hardwares are from Adafruit. They have tutorials for most of them.
 I have learned electronics while building this


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

- [Bill of Materials](https://github.com/ranjib/reefer/blob/master/BOM.md)
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
