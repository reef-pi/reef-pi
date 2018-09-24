export const notifAdded = (notif) => {
  return ({
    type: 'NOTIF_ADDED',
    payload: notif
  })
}
