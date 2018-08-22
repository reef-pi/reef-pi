import $ from 'jquery'

export function showAlert (msg) {
  $('#reef-pi-alert').html(
    `<div class='alert alert-danger alert-dismissible fade show'>
      <div class='font-weight-normal'>` + msg + `</div>
      <button type='button' class='close' data-dismiss='alert'>
        <span>&times;</span>
      </button>
    </div>`
  )
}

export function clearAlert() {
  $('#reef-pi-alert').html('')
}
