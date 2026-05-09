import React from 'react'
import { RawCamera } from './main'
import { RawCapture } from './capture'
import Config from './config'
import Gallery from './gallery'
import Motion from './motion'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

const cameraState = {
  camera: { config: { tick_interval: 60, enable: false }, images: [{ name: 'foo.jpg' }, { name: 'bar.jpg' }] }
}

const countByType = (node, predicate) => {
  if (!node || typeof node !== 'object') {
    return 0
  }
  let count = predicate(node) ? 1 : 0
  React.Children.toArray(node.props?.children).forEach(child => {
    count += countByType(child, predicate)
  })
  return count
}

const findByType = (node, type) => {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  if (node.type === type) {
    return node
  }
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findByType(child, type)
    if (found) {
      return found
    }
  }
}

const findAllByType = (node, type) => {
  if (!node || typeof node !== 'object') {
    return []
  }
  const matches = node.type === type ? [node] : []
  React.Children.toArray(node.props?.children).forEach(child => {
    matches.push(...findAllByType(child, type))
  })
  return matches
}

describe('Camera module', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('<Main /> passes image route URLs to <Gallery />', () => {
    const fetchConfig = jest.fn()
    const listImages = jest.fn()
    const updateConfig = jest.fn()
    const camera = new RawCamera({
      config: cameraState.camera.config,
      images: cameraState.camera.images,
      fetchConfig,
      listImages,
      updateConfig
    })

    camera.componentDidMount()
    expect(fetchConfig).toHaveBeenCalled()
    expect(listImages).toHaveBeenCalled()

    const rendered = camera.render()
    expect(rendered.type).toBe('div')
    const galleryImages = findByType(rendered, Gallery).props.images
    expect(galleryImages).toEqual([
      { src: '/images/foo.jpg', thumbnail: '/images/thumbnail-foo.jpg' },
      { src: '/images/bar.jpg', thumbnail: '/images/thumbnail-bar.jpg' }
    ])
  })

  it('<Main /> mounts with empty state', () => {
    const camera = new RawCamera({
      config: {},
      images: [],
      fetchConfig: jest.fn(),
      listImages: jest.fn(),
      updateConfig: jest.fn()
    })

    expect(() => camera.render()).not.toThrow()
  })

  it('<Capture />', () => {
    const getLatestImage = jest.fn()
    const capture = new RawCapture({ latest: '', getLatestImage, takeImage: jest.fn() })

    capture.componentDidMount()
    expect(getLatestImage).toHaveBeenCalled()
    expect(capture.render().type).toBe('div')
  })

  it('<Capture /> renders the latest image route URL', () => {
    const capture = new RawCapture({
      latest: { image: 'latest.jpg' },
      getLatestImage: jest.fn(),
      takeImage: jest.fn()
    })

    const image = findByType(capture.render(), 'img')

    expect(image.props.src).toBe('/images/latest.jpg')
  })

  it('<Config />', () => {
    jest.spyOn(Alert, 'showError')
    const update = jest.fn()
    const config = new Config({ config: { tick_interval: 1 }, update })
    config.setState = jest.fn(next => {
      config.state = { ...config.state, ...next }
    })

    config.updateBool('enable')({ target: { checked: true } })
    config.updateText('bar')({ target: { value: 'baz' } })
    config.handleSave()
    expect(update).toHaveBeenCalled()

    config.state.config.tick_interval = 'foo'
    config.handleSave()
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<Config /> updates local config without mutating previous state', () => {
    const config = new Config({ config: { tick_interval: 1, enable: false }, update: jest.fn() })
    config.setState = jest.fn(next => {
      config.state = { ...config.state, ...next }
    })
    const previousConfig = config.state.config

    config.updateBool('enable')({ target: { checked: true } })

    expect(previousConfig).toEqual({ tick_interval: 1, enable: false })
    expect(config.state.config).toEqual({ tick_interval: 1, enable: true })
    expect(config.state.config).not.toBe(previousConfig)
  })

  it('<Config /> saves parsed config without mutating state config', () => {
    const update = jest.fn()
    const config = new Config({ config: { tick_interval: '5', enable: true }, update })
    config.setState = jest.fn(next => {
      config.state = { ...config.state, ...next }
    })
    const previousConfig = config.state.config

    config.handleSave()

    expect(previousConfig).toEqual({ tick_interval: '5', enable: true })
    expect(update).toHaveBeenCalledWith({ tick_interval: 5, enable: true })
  })

  it('<Gallery /> renders nothing for empty images', () => {
    const gallery = new Gallery({ images: [] })
    const rendered = gallery.render()

    expect(rendered.type).toBe('div')
    expect(rendered.props.children).toBeUndefined()
    expect(() => new Gallery({}).render()).not.toThrow()
  })

  it('<Gallery /> opens the clicked image', () => {
    const images = [
      { thumbnail: '/images/thumbnail-foo.jpg', src: '/images/foo.jpg' },
      { thumbnail: '/images/thumbnail-bar.jpg', src: '/images/bar.jpg' }
    ]
    const gallery = new Gallery({ images })
    gallery.setState = jest.fn(next => {
      gallery.state = { ...gallery.state, ...next }
    })
    const ev = { preventDefault: jest.fn() }

    const thumbnails = findAllByType(gallery.render(), 'a')
    thumbnails[1].props.onClick(ev)

    expect(ev.preventDefault).toHaveBeenCalled()
    expect(gallery.state).toEqual({ current: 1, isOpen: true })
    expect(findAllByType(gallery.render(), 'img')[0].props.src).toBe('/images/bar.jpg')
  })

  it('<Gallery /> disables previous and next at image boundaries', () => {
    const images = [
      { thumbnail: '/images/thumbnail-foo.jpg', src: '/images/foo.jpg' },
      { thumbnail: '/images/thumbnail-bar.jpg', src: '/images/bar.jpg' }
    ]
    const gallery = new Gallery({ images })
    gallery.setState = jest.fn(next => {
      gallery.state = { ...gallery.state, ...next }
    })

    gallery.open(0, { preventDefault: jest.fn() })
    let buttons = findAllByType(gallery.render(), 'button')

    expect(buttons[1].props.disabled).toBe(true)
    expect(buttons[2].props.disabled).toBe(false)

    gallery.handleGotoNext()
    buttons = findAllByType(gallery.render(), 'button')

    expect(buttons[1].props.disabled).toBe(false)
    expect(buttons[2].props.disabled).toBe(true)
  })

  it('<Gallery /> advances image clicks until the final image', () => {
    const images = [
      { thumbnail: '/images/thumbnail-foo.jpg', src: '/images/foo.jpg' },
      { thumbnail: '/images/thumbnail-bar.jpg', src: '/images/bar.jpg' }
    ]
    const gallery = new Gallery({ images })
    gallery.setState = jest.fn(next => {
      gallery.state = { ...gallery.state, ...next }
    })

    gallery.open(0, { preventDefault: jest.fn() })
    findAllByType(gallery.render(), 'img')[0].props.onClick()
    expect(gallery.state.current).toBe(1)

    findAllByType(gallery.render(), 'img')[0].props.onClick()
    expect(gallery.state.current).toBe(1)
  })

  it('<Gallery /> closes and jumps to a selected image', () => {
    const images = [{ thumbnail: '', src: '' }]
    const gallery = new Gallery({ images })
    gallery.setState = jest.fn(next => {
      gallery.state = { ...gallery.state, ...next }
    })

    gallery.open(0, { preventDefault: jest.fn() })
    gallery.handleClose()
    expect(gallery.state).toEqual({ current: 0, isOpen: false })

    gallery.handleGotoImage(0)
    expect(gallery.state.current).toBe(0)
  })

  it('<Motion />', () => {
    const motion = new Motion({ url: '/foo', width: 300, height: 600 })
    const rendered = motion.render()
    expect(rendered.type).toBe('div')
    expect(countByType(rendered, node => node.type === 'img')).toBe(1)
  })
})
