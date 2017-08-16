package utils

import (
	"github.com/kidoman/embd"
)

type DevI2CBus struct{}

func (d *DevI2CBus) ReadByte(addr byte) (value byte, err error) {
	return
}
func (d *DevI2CBus) ReadBytes(addr byte, num int) (value []byte, err error) {
	return
}
func (d *DevI2CBus) WriteByte(addr, value byte) error {
	return nil
}
func (d *DevI2CBus) WriteBytes(addr byte, value []byte) error {
	return nil
}
func (d *DevI2CBus) ReadFromReg(addr, reg byte, value []byte) error {
	return nil
}
func (d *DevI2CBus) ReadByteFromReg(addr, reg byte) (value byte, err error) {
	return
}
func (d *DevI2CBus) ReadWordFromReg(addr, reg byte) (value uint16, err error) {
	return
}
func (d *DevI2CBus) WriteToReg(addr, reg byte, value []byte) error {
	return nil
}
func (d *DevI2CBus) WriteByteToReg(addr, reg, value byte) error {
	return nil
}
func (d *DevI2CBus) WriteWordToReg(addr, reg byte, value uint16) error {
	return nil
}
func (d *DevI2CBus) Close() error {
	return nil
}
func (d *DevSPIBus) Write(bs []byte) (int, error) {
	return len(bs), nil
}

type DevSPIBus struct{}

func NewDevSPIBus() embd.SPIBus {
	return &DevSPIBus{}
}

func (d *DevSPIBus) TransferAndReceiveData(dataBuffer []uint8) error {
	return nil
}
func (d *DevSPIBus) ReceiveData(len int) ([]uint8, error) {
	var ret []uint8
	return ret, nil
}
func (d *DevSPIBus) TransferAndReceiveByte(data byte) (byte, error) {
	var b byte
	return b, nil
}
func (d *DevSPIBus) ReceiveByte() (byte, error) {
	var b byte
	return b, nil
}
func (d *DevSPIBus) Close() error {
	return nil
}
