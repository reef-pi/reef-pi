import React from 'react'
import { fetchErrors, deleteError, deleteErrors } from 'redux/actions/errors'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class errors extends React.Component {
  componentDidMount () {
    this.props.fetch()
  }
  render () {
    var items = []
    this.props.errors.forEach(el => {
      items.push(
        <div className='row' key={'error-' + el.id}>
          <div className='col-lg-2'>{el.time}</div>
          <div className='col-lg-8'>{el.message}</div>
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
            <button className='btn btn-outline-secondary' onClick={this.props.clear}>
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
)(errors)
export default Errors
