LABEL maintainer="code@reef-pi.com"

# Use debian as it matches a Raspbian environment
FROM debian:stretch

RUN apt-get update -y && \
    apt-get install curl build-essential git mercurial -y

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
    apt-get install -y nodejs && \
    ln -sf /usr/bin/nodejs /usr/bin/node && \
    npm install -g npm
RUN curl https://dl.google.com/go/go1.10.linux-amd64.tar.gz > /tmp/go1.10.linux-amd64.tar.gz && \
    tar xvzf /tmp/go1.10.linux-amd64.tar.gz -C /usr/local 

ENV PATH="/usr/local/go/bin:${PATH}"
ENV GOPATH=/gopath

RUN mkdir -p /gopath/src/github.com/reef-pi/reef-pi
WORKDIR /gopath/src/github.com/reef-pi/reef-pi

# Bootstrap dependencies 
COPY Makefile package.json package-lock.json /gopath/src/github.com/reef-pi/reef-pi/
RUN make go-get
RUN npm install

# Copy the rest of the code base for building
COPY . /gopath/src/github.com/reef-pi/reef-pi/

RUN make ui
RUN make bin

