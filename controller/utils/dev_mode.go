package utils

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
