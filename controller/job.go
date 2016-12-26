package controller

import (
	"gobot.io/x/gobot"
	"log"
)

type Job struct {
	ID        string `json:"id"`
	Minute    string `json:"minute"`
	Day       string `json:"day"`
	Hour      string `json:"hour"`
	Second    string `json:"second"`
	Equipment string `json:"equipment"`
	Action    string `json:"action"`
	Value     int    `json:"value"`
	Name      string `json:"name"`
}

type JobRunner struct {
	name   string
	outlet *Outlet
	conn   gobot.Connection
	action OuteltAction
}

func (j *Job) Outlet(store *Store) (*Outlet, error) {
	var e Equipment
	var o Outlet

	if err := store.Get("equipments", j.Equipment, &e); err != nil {
		return nil, err
	}

	if err := store.Get("outlets", e.Outlet, &o); err != nil {
		return nil, err
	}
	return &o, nil
}

func (j *Job) Runner(store *Store, conn gobot.Connection) (*JobRunner, error) {
	o, err := j.Outlet(store)
	if err != nil {
		return nil, err
	}
	a := OuteltAction{
		Action: j.Action,
		Value:  j.Value,
	}
	return &JobRunner{
		name:   j.Name,
		outlet: o,
		conn:   conn,
		action: a,
	}, nil
}

func (r *JobRunner) Run() {
	log.Println("Job:", r.name, " Pin:", r.outlet.Pin, "Action:", r.action.Action)
	if err := r.outlet.Perform(r.conn, r.action); err != nil {
		log.Println("ERROR:", err)
	}
}
