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

func db(args []string) {
	cmd := flag.NewFlagSet("db", flag.ExitOnError)
	input := cmd.String("input", "", "Input json file")
	output := cmd.String("output", "", "Output json file")
	sPath := cmd.String("store", "/var/lib/reef-pi/reef-pi.db", "Database storage file")
	if err := cmd.Parse(args); err != nil {
		fmt.Println("Failed to parse command line flags. Error:", err)
		os.Exit(1)
	}
	if len(cmd.Args()) < 2 {
		fmt.Println("Incorrect number of arguments at least action and module needs to be specified")
		os.Exit(1)
	}
	store, err := storage.NewStore(*sPath)
	if err != nil {
		fmt.Println("Failed to open database. Check if reef-pi is already running. Error:", err)
		os.Exit(1)
	}
	defer store.Close()
	action := cmd.Args()[0]
	bucket := cmd.Args()[1]

	switch action {
	case "show":
		if len(cmd.Args()) < 3 {
			fmt.Println("ERROR: Must provide id of the item to show")
			os.Exit(1)
		}
		id := cmd.Args()[2]
		d, err := store.RawGet(bucket, id)
		if err != nil {
			fmt.Println("ERROR: Failed to get item", id, "from database. Error:", err)
			os.Exit(1)
		}
		switch *output {
		case "":
			fmt.Println(string(d))
		default:
			if err := ioutil.WriteFile(*output, d, 0644); err != nil {
				fmt.Println("Failed to write output file. Error:", err)
				os.Exit(1)
			}
		}
	case "list":
		res := make(map[string]json.RawMessage)
		fn := func(id string, bs []byte) error {
			res[id] = bs
			return nil
		}
		if err := store.List(bucket, fn); err != nil {
			fmt.Println("ERROR: Failed to list items from storage. Errod:", err)
			os.Exit(1)
		}
		switch *output {
		case "":
			enc := json.NewEncoder(os.Stdout)
			enc.SetIndent(" ", " ")
			if err := enc.Encode(res); err != nil {
				fmt.Println("ERROR: Failed to encode in json. Error:", err)
				os.Exit(-1)
			}
		default:
			fo, err := os.Create(*output)
			if err != nil {
				fmt.Println("ERROR: Failed to create output file. Error:", err)
				os.Exit(-1)
			}
			defer fo.Close()
			enc := json.NewEncoder(fo)
			enc.SetIndent(" ", " ")
			if err := enc.Encode(res); err != nil {
				fmt.Println("ERROR: Failed to encode in json. Error:", err)
				os.Exit(-1)
			}
		}
	case "create":
		switch *input {
		case "":
			data, err := ioutil.ReadFile(*input)
			if err != nil {
				fmt.Println("Failed to read input file. Error:", err)
				os.Exit(1)
			}
			fn := func(_ string) interface{} {
				return data
			}
			if err := store.Create(bucket, fn); err != nil {
				fmt.Println("ERROR: Failed to create item. Error:", err)
				os.Exit(-1)
			}
		default:
			buf := new(bytes.Buffer)
			if _, err := io.Copy(buf, os.Stdin); err != nil {
				fmt.Println("Failed to read standard input. Error:", err)
				os.Exit(1)
			}
			fn := func(_ string) interface{} {
				return buf.Bytes()
			}
			if err := store.Create(bucket, fn); err != nil {
				fmt.Println("ERROR: Failed to create item. Error:", err)
				os.Exit(-1)
			}
		}
	case "update":
		if len(cmd.Args()) < 3 {
			fmt.Println("ERROR: Must provide id of the item to update")
			os.Exit(1)
		}
		id := cmd.Args()[2]
		switch *input {
		case "":
			data, err := ioutil.ReadFile(*input)
			if err != nil {
				fmt.Println("Failed to read input file. Error:", err)
				os.Exit(1)
			}
			if err := store.RawUpdate(bucket, id, data); err != nil {
				fmt.Println("ERROR: Failed to update item. Error:", err)
				os.Exit(-1)
			}
		default:
			buf := new(bytes.Buffer)
			if _, err := io.Copy(buf, os.Stdin); err != nil {
				fmt.Println("Failed to read standard input. Error:", err)
				os.Exit(1)
			}
			if err := store.RawUpdate(bucket, id, buf.Bytes()); err != nil {
				fmt.Println("Failed to save new data. Error:", err)
				os.Exit(1)
			}
		}
	case "delete":
		if len(cmd.Args()) < 3 {
			fmt.Println("ERROR: Must provide id of the item to show")
			os.Exit(1)
		}
		id := cmd.Args()[2]
		if err := store.Delete(bucket, id); err != nil {
			fmt.Println("Error: Failed to delete. Error:", err)
			os.Exit(-1)
		}
	default:
		fmt.Printf("Unknown action:'%s'\n", action)
		os.Exit(1)
	}
}
