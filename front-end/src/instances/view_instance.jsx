import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

const ViewInstance = ({ instance, onStateChange, onDelete, onEdit }) => {
/*
  const toggleState = (e) => {
    const payload = {
      name: instance.name,
      address: instance.address,
      user: instance.user,
      password: instance.password
    }
    onStateChange(instance.id, payload)
  }
  */

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-sm)' }}>
      <div style={{ flex: 1 }}>
        <b>{instance.name}</b>
      </div>
      <div>
        <b>{instance.address}</b>
      </div>
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', marginLeft: 'auto' }}>
        <Button
          variant='secondary'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          type='button'
          onClick={onEdit}
        >
          {i18next.t('edit')}
        </Button>
        <Button
          variant='danger'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          type='button'
          onClick={onDelete}
        >
          {i18next.t('delete')}
        </Button>
      </div>
    </div>
  )
}

ViewInstance.propTypes = {
  instance: PropTypes.object,
  onStateChange: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default ViewInstance
