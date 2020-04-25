package ato

// A BodyParams model for ATO.
//
// This is used for operations that want an ATO as body of the request
// swagger:parameters atoCreate atoUpdate
type BodyParams struct {
	// The ATO to submit.
	//
	// in: body
	// required: true
	ATO *ATO `json:"ato"`
}
