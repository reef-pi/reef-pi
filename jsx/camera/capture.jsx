import React from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import {takeImage, getLatestImage} from '../redux/actions/camera'
import {connect} from 'react-redux'

class capture extends React.Component {
  componentDidMount() {
    this.props.getLatestImage()
  }

  render () {
    var img = <div className='container' />
    if (this.props.latest !== undefined) {
      img = <img src={'/images/' + this.props.latest.image} style={imgStyle} />
    }
    var imgStyle = {
      width: '100%',
      height: '100%',
      borderRadius: '25px'
    }
    return (
      <div className='container'>
        <div className='row'>
          <input type='button' id='captureImage' onClick={this.props.takeImage} value='Take Photo' className='btn btn-outline-primary' />
        </div>
        <div className='row'>
          {img}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    latest: state.camera.latest
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    takeImage: () => dispatch(takeImage()),
    getLatestImage: () => dispatch(getLatestImage())
  }
}

const Capture = connect(mapStateToProps, mapDispatchToProps)(capture)
export default Capture
