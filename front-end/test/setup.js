import React from 'react'

if (parseInt(React.version, 10) < 19) {
  const Enzyme = require('enzyme').default || require('enzyme')
  const Adapter = require('enzyme-adapter-react-16').default || require('enzyme-adapter-react-16')

  Enzyme.configure({ adapter: new Adapter() })
} else {
  const Enzyme = require('enzyme').default || require('enzyme')
  const Adapter = require('@belzile/enzyme-adapter-react-19').default || require('@belzile/enzyme-adapter-react-19')

  Enzyme.configure({ adapter: new Adapter() })
}

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

global.ResizeObserver = ResizeObserver
