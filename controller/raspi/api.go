package raspi

import (
	"github.com/ranjib/reefer/controller"
)

func (r *Raspi) Boards() controller.CrudAPI {
	return r.boardAPI
}

func (r *Raspi) Outlets() controller.CrudAPI {
	return r.outletAPI
}

func (r *Raspi) Modules() controller.CrudAPI {
	return &controller.NullCrudAPI{}
}

func (r *Raspi) Jobs() controller.CrudAPI {
	return r.jobAPI
}

func (r *Raspi) Equipments() controller.CrudAPI {
	return r.equipmentAPI
}
