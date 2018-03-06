package ato

import (
	"github.com/reef-pi/reef-pi/controller/equipments"
	"sync"
)

const Bucket = "ato"

type Controller struct {
	usage      *ring.Ring
	telemetry  *utils.Telemetry
	stopCh     chan struct{}
	mu         sync.Mutex
	store      utils.Store
	equipments *equipments.Controller
	devMode    bool
	quitters   map[string]chan struct{}
	readings   map[string]Readings
	mu         *sync.Mutex
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	return &Controller{
		config:     DefaultConfig,
		devMode:    devMode,
		mu:         sync.Mutex{},
		stopCh:     make(chan struct{}),
		store:      store,
		telemetry:  telemetry,
		equipments: eqs,
		quitters:   make(map[string]chan struct{}),
		readings:   make(map[string]Readings),
		mu:         &sync.Mutex{},
	}, nil
}

func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return c.store.CreateBucket(ReadingsBucket)
}

func (c *Controller) Start() {
	c.mu.Lock()
	defer c.mu.Unlock()
	seonsors, err := c.List()
	if err != nil {
		log.Println("ERROR: ato subsystem: Failed to list sensors. Error:", err)
		return
	}
	for _, s := range sensors {
		if !s.Enable {
			continue
		}
		c.loadReadings(s.ID)
		quit := make(chan struct{})
		c.quitters[s.ID] = quit
		go c.Run(s, quit)
	}
}

func (c *Controller) Stop() {
	for id, quit := range c.quitters {
		close(quit)
		c.saveReadings(id)
		delete(c.quitters, id)
	}
}
