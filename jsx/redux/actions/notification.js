export const addNotification = (notif) => {
  return ({
    type: 'NOTIF_ADDED',
    payload: notif
  })
}
export const delNotification = (notif) => {
  return ({
    type: 'NOTIF_DELETED',
    payload: notif
  })
}

export const readNotification = (notif) => {
  return ({
    type: 'NOTIF_READ',
    payload: notif
  })
}
