import React from 'react'
import $ from 'jquery'
import Gallery from './gallery.jsx'
import Config from './config.jsx'
import Capture from './capture.jsx'
import {fetchConfig, updateConfig, listImages} from '../redux/actions/camera'
import {connect} from 'react-redux'
import Motion from './motion.jsx'

class camera extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      latest: {},
      images: [],
      showConfig: false,
      config: { }
    }
    this.toggleConfig = this.toggleConfig.bind(this)
    this.motion = this.motion.bind(this)
  }

  motion () {
    if (this.state.config.motion === undefined) {
      return
    }
    return (
      <Motion
        width={this.state.config.motion.width}
        height={this.state.config.motion.height}
        url={this.state.config.motion.url}
      />
    )
  }

  toggleConfig () {
    this.setState({showConfig: !this.state.showConfig})
  }

  componentDidMount () {
    this.props.fetchConfig()
    this.props.listImages()
  }

  render () {
    var images = []
    $.each(this.props.images, function (i, d) {
      images.push({
        src: '/images/' + d.name,
        thumbnail: '/images/thumbnail-' + d.name
      })
    })
    var config = <div />
    if (this.state.showConfig) {
      config = <Config config={this.props.config} update={this.props.updateConfig} />
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

const mapStateToProps = (state) => {
  return {
    config: state.camera.config,
    images: state.camera.images
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchConfig: () => dispatch(fetchConfig()),
    updateConfig: (c) => dispatch(updateConfig(c)),
    listImages: () => dispatch(listImages())
  }
}

const Camera = connect(mapStateToProps, mapDispatchToProps)(camera)
export default Camera
