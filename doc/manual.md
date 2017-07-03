## reef-pi : Manual

reef-pi, the raspberry pi based Open Source reef tank controller can be used to monitor and automate day to day reef keeping chore. This document provides a comprehensive guide for building and using reef-pi based controllers. This guide is divided into three parts:

- reef-pi Electronics : Provides an overview of electronics components that can be used with reef-pi software. If you are planning to build a reef-pi based controllers, you should start here. If you already have one, and want to know how to use reef-pi, skip to the next part.
- reef-pi Software: Provides an overview of installation, configuration and usage of the reef-pi software itself. This part also covers troubleshooting reef-pi software and upgrading it to newer versions.
- reef-pi Housing: Provides an overview of different housing options to enclose the reef-pi electronics and anically electrical outlets, connectors etc.
 
### Part A: Electronics

reef-pi, the software is built and tested on Raspberry Pi 3. This is the minimum electronics required to run the software, albeit in this form it’s not of much use. Other than the primary Raspberry Pi computer, reef-pi uses a small set of electronics to perform few fundamental operations, common in controlling different equipments & sensors, these are called core electronics. Lastly, there can be a much larger set of ancillary electronics that is used to interface with the broad range reef aquarium equipments, like LED lights, dosing pumps, wave makers etc. Keeping the electronics layered like this, allows reef-pi software to keep simple and well tested only against the small set of core electronics components, while the anically electronics allows interfacing with a wide range of reef tank equipments, without changing the software, offering greater flexibility. Core electronics used in reef-pi are also widely used in open source software & hardware projects, thus offering multiple vendors and lots of tutorials and documentation.
 
#### Core electronics: 

- Solid state relays
- PCA9685
- MCP3008

### Ancillary electronics

- ULN2803A
- L293D
- MCP23017

### Part B: Software

#### Installation

#### Configuration

#### Using reef-pi

- Running equipments on timer
- Setting up light cycle
- Setting up two part dosing
- Configuring telemetry
- Part C: Housing
