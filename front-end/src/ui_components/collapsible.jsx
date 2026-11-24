import React, { Children, cloneElement, isValidElement } from 'react'
import { FaAngleDown, FaAngleUp, FaEdit, FaTrashAlt } from 'react-icons/fa'
import PropTypes from 'prop-types'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

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
      <Button
        variant='secondary'
        style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
        onClick={this.handleEdit}
        disabled={disableEdit}
        id={'edit-' + name}
      >
        {FaEdit()}
      </Button>
    )
    // Callers pass either just the form, or a read-only view followed by the form. Only the last
    // element (the form) receives readOnly/onSubmit; anything before it is rendered as given.
    const elements = Children.toArray(children).filter(isValidElement)
    const form = elements[elements.length - 1]
    const handleSubmit = (values) => {
      this.props.onSubmit(this.props.name)
      form.props.onSubmit(values)
    }
    let toggleStateButton = ''
    if (onToggleState) {
      toggleStateButton = (
        <ToggleSwitch
          state={enabled ? 'on' : 'off'}
          onRequestChange={() => onToggleState()}
        />
      )
    }

    const trailing = (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
        <Button
          variant='secondary'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          onClick={this.handleDelete}
          id={'delete-' + name}
        >
          {FaTrashAlt()}
        </Button>
        {readOnly ? toggleStateButton : null}
        {readOnly ? editButton : null}
        {this.props.buttons}
      </div>
    )

    return (
      <ListItem
        trailing={trailing}
        footer={expanded
          ? elements.map(element => (
            element === form
              ? cloneElement(element, { readOnly, onSubmit: handleSubmit })
              : element
          ))
          : null}
      >
        <div
          className='collapsible-title'
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-xs)', cursor: 'pointer', minWidth: 0 }}
          onClick={() => onToggle(name)}
        >
          {expanded ? FaAngleUp() : FaAngleDown()}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{this.props.title}</span>
        </div>
      </ListItem>
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
  children: PropTypes.node.isRequired
}

export default Collapsible
