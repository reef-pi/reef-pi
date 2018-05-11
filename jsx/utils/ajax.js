import $ from 'jquery'
import SignIn from '../sign_in.jsx'
import {showAlert, hideAlert} from './alert.js'

export function ajaxBeforeSend (xhr) {
  var creds = SignIn.getCreds()
  var authHeader = 'Basic ' + window.btoa(creds.user + ':' + creds.password)
  xhr.setRequestHeader('Authorization', authHeader)
}
export function ajaxErrorHandler (xhr, status, err) {
   showAlert(xhr.responseText)
  // If authentication error, reset creds and reload page
  if (xhr.status === 401) {
    SignIn.removeCreds()
  }
}

export function ajaxDelete (params) {
  $.ajax({
    url: params.url,
    type: 'DELETE',
    success: params.success.bind(this),
    error: ajaxErrorHandler,
    beforeSend: ajaxBeforeSend
  })
}

export function ajaxPut (params) {
  $.ajax({
    url: params.url,
    type: 'PUT',
    data: params.data,
    success: params.success.bind(this),
    error: ajaxErrorHandler,
    beforeSend: ajaxBeforeSend
  })
}

export function ajaxPost (params) {
  $.ajax({
    url: params.url,
    type: 'POST',
    data: params.data,
    success: params.success.bind(this),
    error: ajaxErrorHandler,
    beforeSend: ajaxBeforeSend
  })
}

export function ajaxGet (params) {
  $.ajax({
    url: params.url,
    type: 'GET',
    dataType: 'json',
    success: params.success.bind(this),
    error: ajaxErrorHandler,
    beforeSend: ajaxBeforeSend
  })
}
