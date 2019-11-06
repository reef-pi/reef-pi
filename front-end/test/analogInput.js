module.exports = {
  Create: function (n) {
    n.click('input#add_analog_input')
      .wait(500)
      .type('input#analog_inputName', 'AI1')
      .wait(500)
      .type('input#analog_inputPins', '0')
      .wait(1000)
      .select('.analog_input_type [name*="driver"]', '2')
      .wait(500)
      .click('input#createAnalogInput')
      .wait(1500)

    return function () {
      return ('Inlets created')
    }
  }
}
