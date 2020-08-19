package macro

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/Knetic/govaluate"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type GenericStep struct {
	ID string `json:"id"`
	On bool   `json:"on"`
}

type WaitStep struct {
	Duration time.Duration `json:"duration"`
}

type WaitForTriggerStep struct {
	Metric   string `json:"metric"`
	Operator string `json:"operator"`
	Operand  string `json:"operand"`
}

type Step struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

func (s *Step) Run(c controller.Controller, reverse bool) error {
	switch s.Type {
	case storage.EquipmentBucket, storage.ATOBucket, storage.TemperatureBucket,
		storage.DoserBucket, storage.PhBucket, storage.TimerBucket, storage.MacroBucket, "subsystem":
		var g GenericStep
		if err := json.Unmarshal(s.Config, &g); err != nil {
			return err
		}
		state := g.On
		if reverse {
			state = !state
		}
		if s.Type == "subsystem" {
			sub, err := c.Subsystem(g.ID)
			if err != nil {
				return err
			}
			if state {
				sub.Start()
				return nil
			}
			sub.Stop()
			return nil
		}
		sub, err := c.Subsystem(s.Type)
		if err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: ", s.Type, "id:", g.ID, " state:", state)
		return sub.On(g.ID, state)
	case "wait":
		var w WaitStep
		if err := json.Unmarshal(s.Config, &w); err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: sleep for", int(w.Duration), "seconds")
		time.Sleep(w.Duration * time.Second)
		return nil
	case "waitfortrigger":
		var w WaitForTriggerStep
		if err := json.Unmarshal(s.Config, &w); err != nil {
			return err
		}

		//Set up a way for the step to wait unil the goroutine completes
		var wg sync.WaitGroup

		//Set up a subscription for the metric
		ctx, cancelFn := context.WithCancel(context.Background())
		messages, err := c.PubSub().Subscribe(ctx, w.Metric)
		if err != nil {
			panic(err)
		}

		//spin a goroutine to monitor the emitted metric
		go func() {
			for msg := range messages {
				msg.Ack()

				formula := "metric " + w.Operator + " " + w.Operand
				expression, err := govaluate.NewEvaluableExpression(formula)
				if err != nil {
					log.Printf("Error evaluating expression %s", err)
					return
				}
				parameters := make(map[string]interface{}, 1)
				parameters["metric"] = msg.Payload
				result, err := expression.Evaluate(parameters)

				if result == true {
					cancelFn() //Unsubscribes
					wg.Done()  //Tell the step to complete
					return
				}
			}
		}()
		wg.Wait()

		return nil
	default:
		return fmt.Errorf("Unknown step type:%s", s.Type)
	}
}
