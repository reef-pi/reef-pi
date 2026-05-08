package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"sort"
	"strings"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type dbCmd struct {
	input, output, sPath string
	repo                 dbRepository
	args                 []string
}

var _wrongArguments = errors.New("incorrect number of arguments at least action and module needs to be specified")

const dbHelpText = `
    Usage: reef-pi db [sub-command] [OPTIONS]

    A command line tool to introspect and manipulate objects in reef-pi database. reef-pi
    controller must be stopped before using this tool. It is intended for diagnostic
    and troubleshooting purpose.

    valid sub-commands: buckets |  list | show | create | update | delete

    Example:
     List all buckets in the database:
       reef-pi db buckets

     List items from a bucket
         reef-pi db list atos

     Show an individual entry with given id from a bucket
         reef-pi db show atos 1

     Create an item in a bucket from a json input file
         reef-pi db create atos -input sample_ato.json

     Update an item in a bucket from a json input file
         reef-pi db update atos 1 -input sample_ato.json

     Delete an item in a bucket
         reef-pi db delete atos 1
    `

func (d *dbCmd) FlagSet() *flag.FlagSet {
	fs := flag.NewFlagSet("db", flag.ExitOnError)
	fs.StringVar(&d.input, "input", "", "Input json file")
	fs.StringVar(&d.output, "output", "", "Output json file")
	fs.StringVar(&d.sPath, "store", "/var/lib/reef-pi/reef-pi.db", "Database storage file")
	fs.Usage = func() {
		fmt.Println(strings.TrimSpace(dbHelpText))
		fmt.Println("\nOptions:")
		fs.PrintDefaults()
	}
	return fs
}
func NewDBCmd(args []string) (*dbCmd, error) {
	cmd := &dbCmd{}
	fs := cmd.FlagSet()
	if err := fs.Parse(args); err != nil {
		return nil, err
	}
	cmd.args = fs.Args()
	return cmd, nil
}

func (d *dbCmd) Close() error {
	if d.repo == nil {
		return nil
	}
	return d.repo.Close()
}

func (cmd *dbCmd) Execute() error {
	for _, s := range cmd.args {
		if s == "-h" || s == "-help" || s == "--help" {
			fmt.Println(strings.TrimSpace(dbHelpText))
			return nil
		}
	}
	if _, err := os.Stat(cmd.sPath); os.IsNotExist(err) {
		return fmt.Errorf("Database file does not exist. %w", err)
	}
	store, err := storage.NewStore(cmd.sPath)
	if err != nil {
		return fmt.Errorf("failed to open database; check if reef-pi is already running: %w", err)
	}
	cmd.repo = newDBRepository(store)

	if len(cmd.args) < 1 {
		return errors.New("please specify a sub command [show|list|create|update|delete|buckets]")
	}
	action := cmd.args[0]
	switch action {
	case "show":
		if len(cmd.args) < 2 {
			return _wrongArguments
		}
		return cmd.Show()
	case "list":
		if len(cmd.args) < 2 {
			return _wrongArguments
		}
		return cmd.List()
	case "create":
		if len(cmd.args) < 2 {
			return _wrongArguments
		}
		return cmd.Create()
	case "update":
		if len(cmd.args) < 2 {
			return _wrongArguments
		}
		return cmd.Update()
	case "delete":
		if len(cmd.args) < 2 {
			return _wrongArguments
		}
		return cmd.Delete()
	case "buckets":
		return cmd.Buckets()
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

func (cmd *dbCmd) bucket() string {
	return cmd.args[1]
}

func (cmd *dbCmd) Show() error {
	if len(cmd.args) < 3 {
		return fmt.Errorf("must provide id of the item to show")
	}
	id := cmd.args[2]
	d, err := cmd.repo.RawGet(cmd.bucket(), id)
	if err != nil {
		return fmt.Errorf("failed to get item %s due database error:%w", id, err)
	}
	return cmd.Output(d)
}
func (cmd *dbCmd) Buckets() error {
	buckets, err := cmd.repo.Buckets()
	if err != nil {
		return fmt.Errorf("failed to get list buckets  due database error:%w", err)
	}
	sort.Strings(buckets)
	return cmd.Output([]byte(strings.Join(buckets, "\n")))
}

func (cmd *dbCmd) List() error {
	res, err := cmd.repo.List(cmd.bucket())
	if err != nil {
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
	return cmd.repo.Create(cmd.bucket(), data)
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
	return cmd.repo.Update(cmd.bucket(), id, data)
}
func (cmd *dbCmd) Delete() error {
	if len(cmd.args) < 3 {
		return fmt.Errorf("must provide id of the item to delete")
	}
	id := cmd.args[2]
	if err := cmd.repo.Delete(cmd.bucket(), id); err != nil {
		return fmt.Errorf("failed to delete item %s: %w", id, err)
	}
	return nil
}
