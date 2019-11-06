import React from 'react'
import PropTypes from 'prop-types'
import Lightbox from 'react-images'

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
    const { images } = this.props
    if (!images) return

    const gallery = []
    this.props.images.forEach((k, i) => {
      gallery.push(
        <a href={k.src} key={'gallery-' + i} onClick={e => this.open(i, e)}>
          <img src={k.thumbnail} />
        </a>
      )
    })

    return (
      <div className='container'>
        <Lightbox
          images={this.props.images}
          onClose={this.handleClose}
          currentImage={this.state.current}
          isOpen={this.state.isOpen}
          onClickImage={this.handleOnClick}
          onClickNext={this.handleGotoNext}
          onClickPrev={this.handleGotoPrevious}
          onClickThumbnail={this.handleGotoImage}
          showThumbnails
        />
        {gallery}
      </div>
    )
  }
}

Gallery.propTypes = {
  images: PropTypes.array
}
