# Use debian as it matches a Raspbian environment
FROM debian:stretch

LABEL maintainer="code@reef-pi.com"

RUN apt-get update -y && \
    apt-get install curl build-essential git mercurial -y

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm
RUN curl https://dl.google.com/go/go1.12.4.linux-amd64.tar.gz > /tmp/go1.12.4.linux-amd64.tar.gz && \
    tar xvzf /tmp/go1.12.4.linux-amd64.tar.gz -C /usr/local


ENV GOPATH=/gopath
ENV PATH="/usr/local/go/bin:${GOPATH}/bin:${PATH}"

RUN mkdir -p /gopath/src/github.com/reef-pi/reef-pi
WORKDIR /gopath/src/github.com/reef-pi/reef-pi

# Bootstrap dependencies 
COPY Makefile package.json package-lock.json /gopath/src/github.com/reef-pi/reef-pi/
RUN npm install

COPY Gopkg.lock Gopkg.toml controller/ /gopath/src/github.com/reef-pi/reef-pi/
RUN make go-get

# Copy the rest of the code base for building
COPY . /gopath/src/github.com/reef-pi/reef-pi/

RUN make bin
USER 9000
