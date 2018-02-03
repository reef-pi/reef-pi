import React from 'react'
import PropTypes from 'prop-types'
import Lightbox from 'react-images'
import $ from 'jquery'

export default class Gallery extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false,
      current: 0
    }

    this.open = this.open.bind(this)
    this.onClose = this.onClose.bind(this)
    this.gotoPrevious = this.gotoPrevious.bind(this)
    this.gotoNext = this.gotoNext.bind(this)
    this.gotoImage = this.gotoImage.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  open (index, event) {
    event.preventDefault()
    this.setState({
      current: index,
      isOpen: true
    })
  }

  onClose () {
    this.setState({
      current: 0,
      isOpen: false
    })
  }

  gotoPrevious () {
    this.setState({
      current: this.state.current - 1
    })
  }

  gotoNext () {
    this.setState({
      current: this.state.current + 1
    })
  }

  gotoImage (index) {
    this.setState({
      current: index
    })
  }

  onClick () {
    if (this.state.current === this.state.images.length - 1) return
    this.gotoNext()
  }

  render() {
    const { images } = this.props;
		if (!images) return;

    var gallery = []
    $.each(this.props.images, function (i, k) {
      gallery.push(
        <a href={k.src} key={i} onClick={(e) => this.open(i, e)}>
          <img src={k.thumbnail} />
        </a>
      )
    }.bind(this))

		return (
			<div className='container'>
        <Lightbox images={this.props.images} onClose={this.onClose}
          currentImage={this.state.current}
          isOpen={this.state.isOpen}
          onClickImage={this.onClick}
          onClickNext={this.gotoNext}
          onClickPrev={this.gotoPrevious}
          onClickThumbnail={this.gotoImage}
          showThumbnails
        />
				{gallery}
			</div>
		);
  }
}

Gallery.propTypes = {
	images: PropTypes.array
};
