import React from 'react'
import {fetchErrors, deleteError, deleteErrors} from 'redux/actions/errors'
import {connect} from 'react-redux'

class errors extends React.Component {
  componentDidMount () {
	  this.props.fetch()
  }
  render () {
    var items = []
    this.props.errors.forEach((el) => {
      items.push(
        <div className='row' key={el.id}>
          <div className='col-lg-2'>
            {el.time}
          </div>
          <div className='col-lg-8'>
            {el.message}
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
            <input
              className='btn btn-outline-secondary'
              defaultValue='clear'
              onClick={this.props.clear}
					  />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    errors: state.errors
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    delete: (id) => dispatch(deleteError(id)),
    clear: () => dispatch(deleteErrors()),
    fetch: () => dispatch(fetchErrors())
  }
}

const Errors = connect(mapStateToProps, mapDispatchToProps)(errors)
export default Errors
