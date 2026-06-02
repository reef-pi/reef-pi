import React from 'react'
import { takeImage, getLatestImage } from '../redux/actions/camera'
import { connect } from 'react-redux'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

export const cameraImageRoute = '/images/'

export const cameraImageURL = image => cameraImageRoute + image

export class RawCapture extends React.Component {
  componentDidMount () {
    this.props.getLatestImage()
  }

  handleTakeImage () {
    this.props.takeImage()
  }

  render () {
    const imgStyle = {
      width: '100%',
      height: '100%',
      borderRadius: '25px'
    }
    let img = <div className='container' />
    if (this.props.latest !== undefined) {
      img = <img src={cameraImageURL(this.props.latest.image)} style={imgStyle} />
    }
    return (
      <div className='container'>
        <div className='row'>
          <Button
            id='captureImage'
            onClick={() => this.handleTakeImage()}
            variant='primary'
          >
            {i18next.t('camera:take_photo')}
          </Button>
        </div>
        <div className='row'>{img}</div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    latest: state.camera.latest
  }
}

const mapDispatchToProps = dispatch => {
  return {
    takeImage: () => dispatch(takeImage()),
    getLatestImage: () => dispatch(getLatestImage())
  }
}

const Capture = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawCapture)
export default Capture
