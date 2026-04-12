import { getAction, postAction } from './api'

export const configLoaded = (s) => {
  return ({
    type: 'CAMERA_CONFIG_LOADED',
    payload: s
  })
}

export const latestImageLoaded = (s) => {
  return ({
    type: 'LATEST_IMAGE_LOADED',
    payload: s
  })
}

export const imagesLoaded = (s) => {
  return ({
    type: 'IMAGES_LOADED',
    payload: s
  })
}

export const fetchConfig = () => {
  return getAction(['camera', 'config'], configLoaded)
}

export const updateConfig = (a) => {
  return postAction(['camera', 'config'], a, fetchConfig)
}

export const takeImage = () => {
  return postAction(['camera', 'shoot'], {}, listImages)
}

export const getLatestImage = () => {
  return getAction(['camera', 'latest'], latestImageLoaded)
}

export const listImages = () => {
  return getAction(['camera', 'images'], imagesLoaded)
}
