import SignIn from '../sign_in.jsx'

export const infoLoaded  = (info) => {
  return({
    type: 'INFO_LOADED',
    payload: info
  })
}

export const fetchInfo = () => {
  return( (dispatch) => {
    let headers = new Headers()
    let creds = SignIn.getCreds()
    let authHeader = 'Basic ' + window.btoa(creds.user + ':' + creds.password)
    headers.append('Authorization', authHeader)
    fetch('/api/info',{method: 'GET', headers: headers})
    .then((response) => {
      if (!response.ok) {
        console.log(response.statusText)
      }
      return response;
    })
    .then((response) => response.json())
    .then((data) => {
      dispatch(infoLoaded(data));
    })
  })
}
