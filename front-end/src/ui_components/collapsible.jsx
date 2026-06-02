import React, { cloneElement } from 'react'
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
    const handleSubmit = (values) => {
      this.props.onSubmit(this.props.name)
      children.props.onSubmit(values)
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
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center', flexShrink: 0 }}>
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
      <ListItem trailing={trailing}>
        <div
          className='collapsible-title'
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-xs)', cursor: 'pointer' }}
          onClick={() => onToggle(name)}
        >
          {expanded ? FaAngleUp() : FaAngleDown()}
          {this.props.title}
        </div>
        {expanded
          ? cloneElement(children, {
            readOnly,
            onSubmit: handleSubmit
          })
          : null}
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
  children: PropTypes.element.isRequired
}

export default Collapsible
