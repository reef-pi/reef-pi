import React, { cloneElement } from 'react'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Switch from 'react-toggle-switch'
import i18next from 'i18next'

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
    const { expanded, onToggle, onToggleState, enabled, name, children, readOnly, disableEdit } = this.props

    const editButton = (
      <button
        type='button'
        onClick={this.handleEdit}
        disabled={disableEdit}
        id={'edit-' + name}
        className='btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
      >
        {i18next.t('collapsible:edit')}
      </button>
    )
    const handleSubmit = (values) => {
      this.props.onSubmit(this.props.name)
      children.props.onSubmit(values)
    }
    let toggleStateButton = ''
    if (onToggleState) {
      toggleStateButton = (
        <Switch onClick={onToggleState} on={enabled}>
          <small className='ml-1 align-top'>{enabled ? i18next.t('on') : i18next.t('off')}</small>
        </Switch>)
    }

    return (
      <li className='list-group-item'>
        <div
          className={classNames('row mb-1 text-center text-md-left', {
            pointer: readOnly
          })}
        >
          <div className='col-12 col-sm-6 col-md-4 col-lg-3 order-sm-2 order-md-last'>
            <button
              type='button'
              onClick={this.handleDelete}
              id={'delete-' + name}
              className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            >
              {i18next.t('collapsible:delete')}
            </button>
            {readOnly ? toggleStateButton : null}
            {readOnly ? editButton : null}
            {this.props.buttons}
          </div>
          <div
            className={classNames('collapsible-title col-12 col-sm-6 col-md-8 col-lg-9 order-sm-first form-inline', {
              pointer: readOnly
            })} onClick={() => onToggle(name)}
          >
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
  enabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  disableEdit: PropTypes.bool,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onSubmit: PropTypes.func,
  onToggleState: PropTypes.func,
  children: PropTypes.element.isRequired
}

export default Collapsible
