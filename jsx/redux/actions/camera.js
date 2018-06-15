import {reduxPut, reduxDelete, reduxGet, reduxPost} from '../../utils/ajax'

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

export const fetchConfig= () => {
  return (reduxGet({
    url: '/api/camera/config',
    success: configLoaded
  }))
}

export const updateConfig = (a) => {
  return (reduxPost({
    url: '/api/camera/config',
    data: a,
    success: fetchConfig
  }))
}

export const takeImage = () => {
  return (reduxPost({
    url: '/api/camera/shoot',
    data: {},
    success: listImages
  }))
}

export const getLatestImage = () => {
  return (reduxGet({
    url: '/api/camera/latest',
    success: latestImageLoaded
  }))
}

export const listImages = () => {
  return (reduxGet({
    url: '/api/camera/images',
    success: imagesLoaded
  }))
}
