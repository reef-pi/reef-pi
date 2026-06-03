import React from 'react'
import { fetchErrors, deleteError, deleteErrors } from 'redux/actions/errors'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

class errors extends React.Component {
  constructor (props) {
    super(props)
    this.handleClear = this.handleClear.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  handleClear () {
    this.props.clear()
  }

  render () {
    const items = []
    this.props.errors.forEach(el => {
      const isAlert = el.id && el.id.startsWith('alert:')
      items.push(
        <div key={'error-' + el.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-sm)', padding: 'var(--reefpi-space-xs) 0', borderBottom: '1px solid var(--reefpi-color-border)' }}>
          <div style={{ minWidth: '8rem', color: 'var(--reefpi-color-text-muted)', fontSize: '0.875rem' }}>{el.time}</div>
          <div style={{ flex: 1 }}>
            {isAlert && <span style={{ background: 'var(--reefpi-color-warn-bg)', color: 'var(--reefpi-color-warn)', borderRadius: 'var(--reefpi-radius-sm)', fontSize: '0.75rem', fontWeight: 600, padding: '0.1em 0.4em', marginRight: 'var(--reefpi-space-xxs)' }}>{i18n.t('configuration:errors:alert')}</span>}
            {el.message}
            {el.count > 1 && <span style={{ background: 'var(--reefpi-color-pending-bg)', color: 'var(--reefpi-color-text)', borderRadius: 'var(--reefpi-radius-sm)', fontSize: '0.75rem', fontWeight: 600, padding: '0.1em 0.4em', marginLeft: 'var(--reefpi-space-xxs)' }}>{el.count}x</span>}
          </div>
          <div>
            <Button
              variant='secondary'
              style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
              onClick={() => this.props.delete(el.id)}
            >
              X
            </Button>
          </div>
        </div>
      )
    })
    return (
      <div>
        {items}
        <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
          <Button variant='secondary' onClick={this.handleClear}>
            {i18n.t('clear')}
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    errors: state.errors
  }
}

const mapDispatchToProps = dispatch => {
  return {
    delete: id => dispatch(deleteError(id)),
    clear: () => dispatch(deleteErrors()),
    fetch: () => dispatch(fetchErrors())
  }
}

const Errors = connect(
  mapStateToProps,
  mapDispatchToProps
)(errors)
export { errors as RawErrors }
export default Errors
