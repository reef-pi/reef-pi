package telemetry

import (
	"time"
)

type TeleTime time.Time

const format = "Jan-02-15:04"

func (t TeleTime) Before(t2 TeleTime) bool {
	return time.Time(t).Before(time.Time(t2))
}

func (t TeleTime) Hour() int {
	return time.Time(t).Hour()
}

func (t TeleTime) Day() int {
	return time.Time(t).Day()
}

func (t TeleTime) MarshalJSON() ([]byte, error) {
	b := make([]byte, 0, len(format)+2)
	b = append(b, '"')
	b = time.Time(t).AppendFormat(b, format)
	b = append(b, '"')
	return b, nil
}

func (t *TeleTime) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		return nil
	}
	t1, err := time.Parse(`"`+format+`"`, string(data))
	if err != nil {
		return err
	}
	*t = TeleTime(t1)
	return nil
}
