package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/storage"
	"io"
	"io/ioutil"
	"os"
)

type dbCmd struct {
	input, output, sPath string
	store                storage.Store
	bucket               string
	args                 []string
}

func (d *dbCmd) FlagSet() *flag.FlagSet {
	cmd := flag.NewFlagSet("db", flag.ExitOnError)
	cmd.StringVar(&d.input, "input", "", "Input json file")
	cmd.StringVar(&d.output, "output", "", "Output json file")
	cmd.StringVar(&d.sPath, "store", "/var/lib/reef-pi/reef-pi.db", "Database storage file")
	return cmd
}
func NewDBCmd(args []string) (*dbCmd, error) {
	cmd := &dbCmd{}
	fs := cmd.FlagSet()
	if err := fs.Parse(args); err != nil {
		return nil, err
	}
	cmd.args = fs.Args()
	if len(cmd.args) < 2 {
		return nil, fmt.Errorf("incorrect number of arguments at least action and module needs to be specified")
	}
	store, err := storage.NewStore(cmd.sPath)
	if err != nil {
		return nil, fmt.Errorf("Failed to open database. Check if reef-pi is already running. %w", err)
	}
	cmd.store = store
	cmd.bucket = cmd.args[1]
	return cmd, nil
}

func (d *dbCmd) Close() error {
	return d.store.Close()
}

func (cmd *dbCmd) Execute() error {
	action := cmd.args[0]
	switch action {
	case "show":
		return cmd.Show()
	case "list":
		return cmd.List()
	case "create":
		return cmd.Create()
	case "update":
		return cmd.Update()
	case "delete":
		return cmd.Delete()
	default:
		return fmt.Errorf("unknown action:'%s'", action)
	}
}

func (cmd *dbCmd) Output(payload []byte) error {
	switch cmd.output {
	case "":
		_, err := fmt.Println(string(payload))
		return err
	default:
		return ioutil.WriteFile(cmd.output, payload, 0644)
	}
}

func (cmd *dbCmd) Show() error {
	if len(cmd.args) < 3 {
		return fmt.Errorf("must provide id of the item to show")
	}
	id := cmd.args[2]
	d, err := cmd.store.RawGet(cmd.bucket, id)
	if err != nil {
		return fmt.Errorf("failed to get item %s due database eror:%w", id, err)
	}
	return cmd.Output(d)
}

func (cmd *dbCmd) List() error {
	res := make(map[string]json.RawMessage)
	fn := func(id string, bs []byte) error {
		res[id] = bs
		return nil
	}
	if err := cmd.store.List(cmd.bucket, fn); err != nil {
		return fmt.Errorf("failed to list items from storage. %w", err)
	}
	data, err := json.MarshalIndent(res, "", "  ")
	if err != nil {
		return err
	}
	return cmd.Output(data)
}

func (cmd *dbCmd) Input() ([]byte, error) {
	switch cmd.input {
	case "":
		buf := new(bytes.Buffer)
		if _, err := io.Copy(buf, os.Stdin); err != nil {
			return nil, fmt.Errorf("failed to read standard input. %w", err)
		}
		return buf.Bytes(), nil
	default:
		return ioutil.ReadFile(cmd.input)
	}
}
func (cmd *dbCmd) Create() error {
	data, err := cmd.Input()
	if err != nil {
		return err
	}
	fn := func(_ string) interface{} {
		return data
	}
	return cmd.store.Create(cmd.bucket, fn)
}

func (cmd *dbCmd) Update() error {
	if len(cmd.args) < 3 {
		return fmt.Errorf("must provide id of the item to update")
	}
	id := cmd.args[2]
	data, err := cmd.Input()
	if err != nil {
		return err
	}
	return cmd.store.RawUpdate(cmd.bucket, id, data)
}
func (cmd *dbCmd) Delete() error {
	if len(cmd.args) < 3 {
		return fmt.Errorf("must provide id of the item to show")
	}
	id := cmd.args[2]
	return cmd.store.Delete(cmd.bucket, id)
}
