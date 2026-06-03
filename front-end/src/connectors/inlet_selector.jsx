import React from 'react'
import { fetchInlets } from '../redux/actions/inlets'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

class inletSelector extends React.Component {
  constructor (props) {
    super(props)
    let inlet
    props.inlets.forEach((v, k) => {
      if (v.id === props.active) {
        inlet = v
      }
    })
    this.state = {
      inlet
    }
    this.inlets = this.inlets.bind(this)
    this.set = this.set.bind(this)
  }

  componentDidMount () {
    this.props.fetchInlets()
  }

  static getDerivedStateFromProps (props, state) {
    if (props.inlets === undefined || props.inlets === null) {
      return null
    }
    if (Object.keys(props.inlets).length === 0) {
      return null
    }
    let inlet
    props.inlets.forEach((v, k) => {
      if (v.id === props.active) {
        inlet = v
      }
    })
    if (inlet === undefined) {
      return state
    }
    return {
      ...state,
      inlet
    }
  }

  inlets () {
    const readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    let title = i18next.t('select')
    if (this.state.inlet !== undefined) {
      title = this.state.inlet.name
    }
    const items = this.props.inlets.map((v, k) => ({
      label: v.name,
      onSelect: this.set(k)
    }))
    return (
      <Menu
        buttonLabel={title}
        items={items}
        disabled={readOnly}
      />
    )
  }

  set (k) {
    return () => {
      const i = this.props.inlets[k]
      if (i === undefined) {
        return
      }
      this.setState({
        inlet: i
      })
      this.props.update(i.id)
    }
  }

  render () {
    return (
      <div className='reefpi-view'>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', alignItems: 'center' }}>
          <div>{i18next.t('inlet')}</div>
          <div>{this.inlets()}</div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = state => {
  return { inlets: state.inlets }
}

const mapDispatchToProps = dispatch => {
  return { fetchInlets: () => dispatch(fetchInlets()) }
}

const InletSelector = connect(
  mapStateToProps,
  mapDispatchToProps
)(inletSelector)
export { inletSelector as RawInletSelector }
export default InletSelector
