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

func downloadDeb(pi, version string) (string, error) {
	url := fmt.Sprintf(urlTemplate, version, version, pi)
	log.Println("Downloading reef-pi from:", url)
	resp, err := http.Get(url)
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
	time.Sleep(time.Second)
	if _, err := utils.Command("/bin/systemctl", "stop", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to stop reef-pi:", err)
	}
	time.Sleep(time.Second)

	out, err := utils.Command("/bin/uname", "-m").CombinedOutput()
	if err != nil {
		log.Println("Failed to detect pi version:", err)
		return err
	}
	pi := "3"
	if strings.Contains(string(out), "armv6") {
		pi = "0"
	}

	file, err := downloadDeb(pi, version)
	if err != nil {
		log.Println("Failed to download reef-pi")
		return err
	}

	if out, err := utils.Command("/usr/bin/dpkg", "-i", file).CombinedOutput(); err != nil {
		log.Println("Failed to install new reef-pi:", err, "\n", string(out))
		return err

	}

	if _, err := utils.Command("/bin/systemctl", "start", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to start reef-pi:", err)
		return err
	}
	log.Println("reef-pi upgrade is done")
	return nil
}
