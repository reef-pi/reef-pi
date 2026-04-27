import React from 'react'
import { fetchErrors, deleteError, deleteErrors } from 'redux/actions/errors'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

export class RawErrors extends React.Component {
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
            <input
              className='btn btn-sm btn-outline-secondary'
              defaultValue='X'
              onClick={() => this.props.delete(el.id)}
            />
          </div>
        </div>
      )
    })
    return (
      <div className='container'>
        {items}
        <div className='row'>
          <div className='col-lg-2'>
            <button className='btn btn-outline-secondary' onClick={this.handleClear}>
              {i18n.t('clear')}
            </button>
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
)(RawErrors)
export default Errors
