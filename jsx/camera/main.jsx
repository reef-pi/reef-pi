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
      showConfig: false,
      config: { }
    }
    this.fetch = this.fetch.bind(this)
    this.toggleConfig = this.toggleConfig.bind(this)
    this.motion = this.motion.bind(this)
  }

  motion() {
    if(this.state.config.motion === undefined) {
      return
    }
    return(
      <Motion
        width={this.state.config.motion.width}
        height={this.state.config.motion.height}
        url={this.state.config.motion.url}
      />
    )
  }

  toggleConfig() {
    this.setState({showConfig: !this.state.showConfig})
  }

  fetch () {
    ajaxGet({
      url: '/api/camera/config',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          config: data
        })
      }.bind(this)
    })

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
      config = <Config config={this.state.config}/>
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
        {this.motion()}
      </div>
    )
  }
}
