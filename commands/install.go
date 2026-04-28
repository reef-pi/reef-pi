package main

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"
)

const urlTemplate = "https://github.com/reef-pi/reef-pi/releases/download/%s/reef-pi-%s-pi%s.deb"

type outputCommand interface {
	CombinedOutput() ([]byte, error)
}

var (
	commandFn     = func(bin string, args ...string) outputCommand { return utils.Command(bin, args...) }
	downloadDebFn = downloadDeb
	httpGetFn     = http.Get
	sleepFn       = time.Sleep
)

func downloadDeb(pi, version string) (string, error) {
	url := fmt.Sprintf(urlTemplate, version, version, pi)
	log.Println("Downloading reef-pi from:", url)
	resp, err := httpGetFn(url)
	if err != nil {
		return "", err
	}
	file := path.Base(resp.Request.URL.Path)
	file = filepath.Join(os.TempDir(), file)
	out, err := os.Create(file)
	if err != nil {
		return "", err
	}

	// Write the body to file
	if _, err = io.Copy(out, resp.Body); err != nil {
		return "", err
	}
	out.Close()
	resp.Body.Close()
	log.Println("reef-pi debian package downloaded at:", file)
	return file, nil
}

func install(version string) error { // version to upgrade to
	log.Println("Executing reef-pi upgrade command")
	sleepFn(time.Second)
	if _, err := commandFn("/bin/systemctl", "stop", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to stop reef-pi:", err)
	}
	sleepFn(time.Second)

	out, err := commandFn("/bin/uname", "-m").CombinedOutput()
	if err != nil {
		log.Println("Failed to detect pi version:", err)
		return err
	}
	pi := "3"
	if strings.Contains(string(out), "armv6") {
		pi = "0"
	}

	file, err := downloadDebFn(pi, version)
	if err != nil {
		log.Println("Failed to download reef-pi")
		return err
	}

	if out, err := commandFn("/usr/bin/dpkg", "-i", file).CombinedOutput(); err != nil {
		log.Println("Failed to install new reef-pi:", err, "\n", string(out))
		return err

	}

	if _, err := commandFn("/bin/systemctl", "start", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to start reef-pi:", err)
		return err
	}
	log.Println("reef-pi upgrade is done")
	return nil
}
