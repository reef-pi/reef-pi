import { reduxDelete, reduxGet, reduxPost, reduxPut } from 'utils/ajax'

export const apiPath = (...parts) => {
  const path = parts
    .reduce((all, part) => {
      if (Array.isArray(part)) {
        return all.concat(part)
      }
      all.push(part)
      return all
    }, [])
    .filter(part => part !== undefined && part !== null && part !== '')
    .map(part => String(part).replace(/^\/+|\/+$/g, ''))
    .join('/')

  return '/api/' + path
}

export const getAction = (parts, success, options = {}) => {
  return reduxGet({
    ...options,
    url: apiPath(parts),
    success
  })
}

export const putAction = (parts, data, success, options = {}) => {
  return reduxPut({
    ...options,
    url: apiPath(parts),
    data,
    success
  })
}

export const postAction = (parts, data, success, options = {}) => {
  return reduxPost({
    ...options,
    url: apiPath(parts),
    data,
    success
  })
}

export const deleteAction = (parts, success, options = {}) => {
  return reduxDelete({
    ...options,
    url: apiPath(parts),
    success
  })
}
