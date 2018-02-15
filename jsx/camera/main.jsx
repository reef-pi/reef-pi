import React from 'react'
import $ from 'jquery'
import Gallery from './gallery.jsx'
import Config from './config.jsx'
import Capture from './capture.jsx'
import {ajaxGet} from '../utils/ajax.js'
import Motion from './motion.jsx'

export default class Camera extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      latest: {},
      images: [],
      showConfig: false
    }
    this.fetch = this.fetch.bind(this)
    this.toggleConfig = this.toggleConfig.bind(this)
  }

  toggleConfig() {
    this.setState({showConfig: !this.state.showConfig})
  }

  fetch () {
    ajaxGet({
      url: '/api/camera/list',
      success: function (data) {
        var images = []
        $.each(data, function (i, d) {
          images.push({
            src: '/images/' + d.name,
            thumbnail: '/images/thumbnail-' + d.name
          })
        })
        this.setState({images: images})
      }.bind(this)
    })
  }

  componentDidMount () {
    this.fetch()
  }

  render () {
    var config = <div />
    if(this.state.showConfig) {
      config = <Config />
    }
    return (
      <div className='container'>
        <div className='row'>
          <input type='button' id='showConfig' onClick={this.toggleConfig} value='config' className='btn btn-secondary' />
          {config}
        </div>
        <div className='row'>
          <Gallery images={this.state.images} />
        </div>
        <div className='row'>
          <Capture />
        </div>
        <div className='row'>
          <Motion width={721} height={406} url='http://10.0.0.62:8081'/>
        </div>
      </div>
    )
  }
}
