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
