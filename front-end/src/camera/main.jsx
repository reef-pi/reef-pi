import React from 'react'
import Gallery from './gallery'
import Config from './config'
import Capture from './capture'
import { fetchConfig, updateConfig, listImages } from 'redux/actions/camera'
import { connect } from 'react-redux'
import Motion from './motion'
import i18next from 'i18next'

class camera extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      latest: {},
      images: [],
      showConfig: false,
      config: {}
    }
    this.handleToggleConfig = this.handleToggleConfig.bind(this)
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

  handleToggleConfig () {
    this.setState({ showConfig: !this.state.showConfig })
  }

  componentDidMount () {
    this.props.fetchConfig()
    this.props.listImages()
  }

  render () {
    const images = []
    this.props.images.forEach((d, i) => {
      images.push({
        src: '/images/' + d.name,
        thumbnail: '/images/thumbnail-' + d.name
      })
    })
    let config = <div />
    if (this.state.showConfig) {
      config = <Config config={this.props.config} update={this.props.updateConfig} />
    }
    return (
      <div className='container'>
        <div className='row'>
          <input
            type='button'
            id='showConfig'
            onClick={this.handleToggleConfig}
            value={i18next.t('configure')}
            className='btn btn-secondary'
          />
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

const mapStateToProps = state => {
  return {
    config: state.camera.config,
    images: state.camera.images
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchConfig: () => dispatch(fetchConfig()),
    updateConfig: c => dispatch(updateConfig(c)),
    listImages: () => dispatch(listImages())
  }
}

const Camera = connect(
  mapStateToProps,
  mapDispatchToProps
)(camera)
export default Camera
