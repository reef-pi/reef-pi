package doser

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const Bucket = "doser"

type Doser struct {
	DevMode    bool
	store      utils.Store
	telemetry  *utils.Telemetry
	equipments *equipments.Controller
}

func New(devMode bool, store utils.Store, t *utils.Telemetry, eqs *equipments.Controller) (*Doser, error) {
	return &Doser{
		DevMode:    devMode,
		store:      store,
		telemetry:  t,
		equipments: eqs,
	}, nil
}

func (d *Doser) LoadAPI(r *mux.Router) {
}

func (d *Doser) Start() {}
func (d *Doser) Stop()  {}
func (d *Doser) Setup() error {
	return nil
}
