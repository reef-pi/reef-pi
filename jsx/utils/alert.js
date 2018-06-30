import $ from 'jquery'

export function showAlert (msg) {
  $('#reef-pi-alert').text()
  $('#reef-pi-alert-msg').text(msg)
  $('#reef-pi-alert').show()
}

export function hideAlert () {
  $('#reef-pi-alert-msg').text()
  $('#reef-pi-alert').hide()
}
