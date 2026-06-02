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
        <div className='row align-items-center' key={'error-' + el.id}>
          <div className='col-lg-2'>{el.time}</div>
          <div className='col-lg-8'>
            {isAlert && <span className='badge badge-warning mr-1'>{i18n.t('configuration:errors:alert')}</span>}
            {el.message}
            {el.count > 1 && <span className='badge badge-secondary ml-1'>{el.count}x</span>}
          </div>
          <div className='col-lg-1'>
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
      <div className='container'>
        {items}
        <div className='row'>
          <div className='col-lg-2'>
            <Button variant='secondary' onClick={this.handleClear}>
              {i18n.t('clear')}
            </Button>
          </div>
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
