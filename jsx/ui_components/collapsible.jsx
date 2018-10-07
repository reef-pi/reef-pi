import React, { cloneElement } from 'react'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import PropTypes from 'prop-types'

class Collapsible extends React.Component {
  constructor (props) {
    super(props)

    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleEdit (e) {
    e.stopPropagation()
    this.props.onEdit(this.props.name)
  }

  handleDelete (e) {
    e.stopPropagation()
    this.props.onDelete(this.props.item)
  }

  render () {
    let {expanded, onToggle, name, children, readOnly} = this.props
    const editButton = (
      <button type='button'
        onClick={this.handleEdit}
        id={'edit-timer-' + name}
        className='btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'>
        Edit
      </button>
    )
    const handleSubmit = (values) => {
      this.props.onSubmit(this.props.name)
      children.props.onSubmit(values)
    }

    return (
      <li className='list-group-item'>
        <div className='row mb-1 cursor-pointer text-center text-md-left'
          onClick={() => onToggle(name)}>
          <div className='col-12 col-sm-6 col-md-4 col-lg-3 order-sm-2 order-md-last'>
            <button type='button'
              onClick={this.handleDelete}
              id={'delete-timer-' + name}
              className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'>
              Delete
            </button>
            {readOnly ? editButton : null}
            {this.props.buttons}
          </div>
          <div className='pointer col-12 col-sm-6 col-md-8 col-lg-9 order-sm-first form-inline'>
            {expanded ? FaAngleUp() : FaAngleDown()}
            {this.props.title}
          </div>
        </div>
        {expanded
          ? cloneElement(children, {
            readOnly: readOnly,
            onSubmit: handleSubmit
          })
          : null}
      </li>
    )
  }
}

Collapsible.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.node,
  expanded: PropTypes.bool,
  readOnly: PropTypes.bool,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.element.isRequired
}

export default Collapsible
