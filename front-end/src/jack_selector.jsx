import React from 'react'
import { fetchJacks } from './redux/actions/jacks'
import { connect } from 'react-redux'
import i18next from 'i18next'

class jackSelector extends React.Component {
  constructor (props) {
    super(props)
    let jack
    props.jacks.forEach((j, i) => {
      if (props.id === j.id) {
        jack = j
      }
    })
    this.state = {
      jack: jack,
      pin: jack === undefined ? undefined : jack.pins[0]
    }

    this.jacks = this.jacks.bind(this)
    this.setJack = this.setJack.bind(this)
    this.pins = this.pins.bind(this)
    this.setPin = this.setPin.bind(this)
  }

  componentDidMount () {
    this.props.fetchJacks()
  }

  jacks () {
    let title = ''
    let id = ''
    if (this.state.jack !== undefined) {
      title = this.state.jack.name
      id = this.state.jack.id
    }
    const items = []
    this.props.jacks.forEach((v, k) => {
      let cName = 'dropdown-item'
      if (v.id === id) {
        cName += ' active'
      }
      items.push(
        <a className={cName} href='#' onClick={this.setJack(k)} key={k}>
          <span id={this.props.id + '-' + v.name}>{v.name}</span>
        </a>
      )
    })
    return (
      <div className='dropdown'>
        <button
          className='btn btn-secondary dropdown-toggle'
          type='button'
          id={this.props.id + 'jack'}
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          {title}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {items}
        </div>
      </div>
    )
  }

  setJack (k) {
    return () => {
      const j = this.props.jacks[k]
      if (j === undefined) {
        return
      }
      this.setState({
        jack: j,
        pin: j.pins[0]
      })
      this.props.update(j.id, j.pins[0])
    }
  }

  setPin (k) {
    return () => {
      this.setState({
        pin: k
      })
      this.props.update(this.state.jack.id, k)
    }
  }

  pins () {
    if (this.state.jack === undefined) {
      return
    }
    const items = []
    this.state.jack.pins.forEach((v, k) => {
      items.push(
        <a className='dropdown-item' href='#' key={k} onClick={this.setPin(v)}>
          {v}
        </a>
      )
    })
    return (
      <div className='dropdown'>
        <button
          className='btn btn-secondary dropdown-toggle'
          type='button'
          id={this.props.id + '-pin'}
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          {this.state.pin.toString()}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {items}
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-lg-1'>{i18next.t('jack')}</div>
          <div className='col-lg-1'>{this.jacks()}</div>
          <div className='col-lg-1'>{i18next.t('pin')}</div>
          <div className='col-lg-1'>{this.pins()}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { jacks: state.jacks }
}

const mapDispatchToProps = dispatch => {
  return { fetchJacks: () => dispatch(fetchJacks()) }
}

const JackSelector = connect(
  mapStateToProps,
  mapDispatchToProps
)(jackSelector)
export default JackSelector
