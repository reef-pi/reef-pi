package utils

import (
	"testing"
)

func TestDevMode(t *testing.T) {

	i2c := &DevI2CBus{}
	var b byte
	if _, err := i2c.ReadByte(b); err != nil {
		t.Fatal(err)
	}
	if _, err := i2c.ReadBytes(b, 1); err != nil {
		t.Fatal(err)
	}
	if err := i2c.WriteByte(b, b); err != nil {
		t.Fatal(err)
	}
	if err := i2c.WriteBytes(b, []byte{b}); err != nil {
		t.Fatal(err)
	}
	if err := i2c.ReadFromReg(b, b, []byte{b}); err != nil {
		t.Fatal(err)
	}
	if _, err := i2c.ReadByteFromReg(b, b); err != nil {
		t.Fatal(err)
	}

	if _, err := i2c.ReadWordFromReg(b, b); err != nil {
		t.Fatal(err)
	}
	if err := i2c.Close(); err != nil {
		t.Fatal(err)
	}

}
