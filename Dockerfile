# Use debian as it matches a Raspbian environment
FROM debian:latest

LABEL maintainer="code@reef-pi.com"

RUN apt-get update -y && \
    apt-get install curl build-essential git mercurial -y

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn
RUN curl https://dl.google.com/go/go1.17.linux-amd64.tar.gz > /tmp/go1.17.linux-amd64.tar.gz && \
    tar xvzf /tmp/go1.17.linux-amd64.tar.gz -C /usr/local


ENV GOPATH=/gopath
ENV PATH="/usr/local/go/bin:${GOPATH}/bin:${PATH}"

RUN mkdir -p /gopath/src/github.com/reef-pi/reef-pi
WORKDIR /gopath/src/github.com/reef-pi/reef-pi

# Bootstrap dependencies 
COPY Makefile package.json yarn-lock.json /gopath/src/github.com/reef-pi/reef-pi/

COPY controller/ /gopath/src/github.com/reef-pi/reef-pi/
RUN make install

# Copy the rest of the code base for building
COPY . /gopath/src/github.com/reef-pi/reef-pi/

RUN make bin
RUN make ui
USER 9000
