import React from 'react'
import { fetchJacks } from './redux/actions/jacks'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { Menu } from '../design-system/ui_kits/reef-pi-app/primitives/Interaction'

export class RawJackSelector extends React.Component {
  constructor (props) {
    super(props)
    let jack
    props.jacks.forEach((j, i) => {
      if (props.id === j.id) {
        jack = j
      }
    })
    this.state = {
      jack,
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
    if (this.state.jack !== undefined) {
      title = this.state.jack.name
    }
    const items = this.props.jacks.map((v, k) => ({
      label: v.name,
      onSelect: this.setJack(k)
    }))
    return (
      <Menu buttonLabel={title} items={items} />
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
    const items = this.state.jack.pins.map((v, k) => ({
      label: String(v),
      onSelect: this.setPin(v)
    }))
    return (
      <Menu buttonLabel={this.state.pin.toString()} items={items} />
    )
  }

  render () {
    return (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-md)', alignItems: 'center' }}>
        <span>{i18next.t('jack')}</span>
        {this.jacks()}
        <span>{i18next.t('pin')}</span>
        {this.pins()}
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
)(RawJackSelector)
export default JackSelector
