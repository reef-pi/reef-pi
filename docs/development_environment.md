# :computer: Development environment

reef-pi is written in [go](https://golang.org/) and [react](https://reactjs.org/). This guide will walk through the steps involved in setting up go, nodejs, and finally reef-pi development environment. This guide assume OSX or Linux as the development platform.

Windows is supported for client side development only. Many reef-pi features depend on specific architecture and hardware features that are not available on Windows. Mock implementations of certain hardware drivers are provided for Windows in order to facilitate UI development. Any backend features should be developed using OSX or Linux.

## Setup go

reef-pi is built and tested with latest go. At the time of writing the guide, the latest version of go is 1.10. reef-pi should work with any version of go above 1.8.

Use any one of these three ways to install go:

1. I recommend using the official [go installation guide](https://golang.org/doc/install) to install go in your development machine.

2. In most cases, for linux based development environment use distribution specific package managers (dnf or apt or yum) to download
latest go. Ubuntu linux specific go installation instruction can be found [here](https://github.com/golang/go/wiki/Ubuntu)

3. For OSX users, if you have homebrew installed, it is as simple as

```
brew install go
brew install tar
```

Irrespective of how you install go, make sure you set GOPATH environment variable. I recommend setting GOPATH environment variable inside your home
directory, in a dedicated sub directory: `/Users/<name>/gospace`. Declare GOPATH in your .bashrc or .bash_profile so that it persist
between sessions.

```sh
export GOPATH=/Users/<name>/gospace
export PATH=$PATH:$GOPATH/bin #to make goimports available
```

## Setup nodejs

All the User Interface components in reef-pi is written using [react](https://facebook.github.io/react/), which requires nodejs
for development. Follow the official nodejs [installation guide](https://docs.npmjs.com/getting-started/installing-node) to install nodejs in your development machine.
reef-pi requires nodejs version 7.0 or above.

For OSX users, if you have homebrew installed, this is as simple as

```
brew install node
```

For Windows user, if you have [Chocolatey](https://chocolatey.org/) installed, nodejs can be installed with

```
choco install nodejs
```

This will install both nodejs and npm, the package manager for nodejs based librariea. reef-pi uses npm to manage nodejs libraries.


## Building and running reef-pi on developer machine

Once go and nodejs is setup, you are ready to start with reef-pi code base itself.

Note: the only entrypoint for any command in the project is the [Makefile](Makefile).

- Copy reef-pi code from github to your $GOPATH
```
git clone https://github.com/reef-pi/reef-pi.git $GOPATH/src/github.com/reef-pi/reef-pi
```

reef-pi project does not use any go package manager yet. A make target is used to get bare minimal dependencies from github.

All following commands & instructions assume you are working from the reef-pi repository itself, i.e.

```
cd $GOPATH/src/github.com/reef-pi/reef-pi
```

- Download go and react dependencies

```
make install
```

This will install reactjs, webpack and ancillary package used by reef-pi user interface (front end) code.

- Build reef-pi binary and ui assets
```
make
```

- Finally, start reef-pi in dev_mode (so that all device drivers calls are ignored).
```
make start-dev
```

Head over to your browser [http://localhost:8080/](http://localhost:8080) to see the reef-pi in action.

## Running Automated Tests

reef-pi has the following automation tools to promote code quality:

- Go tests
```
make test
```

- Javascript code linting
```
make standard
```

- Javascript unit tests
```
make jest
```

- Automated smoke test
```
make start-dev
node ./test/smoke.js
```

### Using API with curl

- Signin and save the cookie

```
curl -X POST -d '{"user":"reef-pi", "password":"reef-pi"}' -c cookie.txt  http://reef-pi.local/auth/signin

```

- Use cookie for all subsequent calls

```
curl -b cookie.txt http://reef-pi.local/api/equipment

```



### Running reef-pi on a raspberry pi

It is likely you would want to test out a new feature on a physical raspberry pi once you have writtend the code for a new feature. The default make target will create development machine specific binary. For Raspberry Pi, reef-pi needs to be compiled for ARM 6 (raspberry pi zero) or ARM7 architecture. reef-pi's [Makefile](https://github.com/reef-pi/reef-pi/blob/master/Makefile)
has predefined target for this. To create raspberry pi 3 or 2 specific binary, run

```
make pi
```

To create pi zero specific binary, run

```
make pi-zero
```

Next generate a debian package for the pi zero. This will package the javascript front end, along side systemd unit files and a stock configuration file.

```
make deb
```

This debian package can be copied over to a Raspberry Pi computer and run there.

```
scp reef-pi-x.x.x.deb pi@<IP>:.
```

To install the new package on pi zero, run
```
sudo dpkg -i reef-pi-x.x.x.deb
```

This will install reef-pi binary, create the necessary directory structure, install and start reef-pi systemd service. You can check status of reef-pi service with
```
sudo systemctl status reef-pi.service
```

Note, if theres an already installed reef-pi, you have to remove it first. To do so, use the following command:

```
sudo apt-get remove -y --purge reef-pi
```
