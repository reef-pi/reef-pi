import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

export default class Gallery extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false,
      current: 0
    }

    this.open = this.open.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleGotoPrevious = this.handleGotoPrevious.bind(this)
    this.handleGotoNext = this.handleGotoNext.bind(this)
    this.handleGotoImage = this.handleGotoImage.bind(this)
    this.handleOnClick = this.handleOnClick.bind(this)
  }

  open (index, event) {
    event.preventDefault()
    this.setState({
      current: index,
      isOpen: true
    })
  }

  handleClose () {
    this.setState({
      current: 0,
      isOpen: false
    })
  }

  handleGotoPrevious () {
    this.setState({
      current: this.state.current - 1
    })
  }

  handleGotoNext () {
    this.setState({
      current: this.state.current + 1
    })
  }

  handleGotoImage (index) {
    this.setState({
      current: index
    })
  }

  handleOnClick () {
    if (this.state.current === this.props.images.length - 1) return
    this.handleGotoNext()
  }

  render () {
    if (!this.props.images || this.props.images.length === 0) {
      return <div />
    }

    const currentImage = this.props.images[this.state.current]
    const gallery = []
    this.props.images.forEach((k, i) => {
      gallery.push(
        <a href={k.src} key={'gallery-' + i} onClick={e => this.open(i, e)}>
          <img src={k.thumbnail} />
        </a>
      )
    })

    return (
      <div className='reefpi-view'>
        {this.state.isOpen && currentImage && (
          <div className='camera-gallery-lightbox'>
            <Button data-testid='camera-gallery-close' variant='secondary' onClick={this.handleClose}>Close</Button>
            <Button data-testid='camera-gallery-previous' variant='secondary' onClick={this.handleGotoPrevious} disabled={this.state.current === 0}>Previous</Button>
            <Button data-testid='camera-gallery-next' variant='secondary' onClick={this.handleGotoNext} disabled={this.state.current >= this.props.images.length - 1}>Next</Button>
            <img
              src={currentImage.src}
              onClick={this.handleOnClick}
            />
          </div>
        )}
        {gallery}
      </div>
    )
  }
}

Gallery.propTypes = {
  images: PropTypes.array
}
