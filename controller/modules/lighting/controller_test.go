package lighting

import (
    "github.com/reef-pi/reef-pi/controller"
    "github.com/reef-pi/reef-pi/controller/storage"
    "testing"
    "time"
)

func TestLightingController(t *testing.T) {
    con, err := controller.TestController()
    if err != nil {
        t.Fatal("Failed to create test controller. Error:", err)
    }

    defer func(store storage.Store) {
        err := store.Close()
        if err != nil {
            t.Fatal("Failed to close store. Error:", err)
        }
    }(con.Store())

    if err = con.DM().Outlets().Setup(); err != nil {
        t.Fatal("Failed to setup outlets. Error:", err)
    }

    config := Config{
        Interval: time.Second,
    }

    c, err := New(config, con)
    if err != nil {
        t.Fatal("Failed to create lighting controller. Error:", err)
    }

    if err = c.Setup(); err != nil {
        t.Fatal("Failed to setup lighting controller. Error:", err)
    }

    c.Start()

    c.Stop()
}
