import React from 'react'
import PropTypes from 'prop-types'
import { FaPlus, FaXmark } from 'react-icons/fa6'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

// The "add a new item" control at the foot of every module list. One look
// everywhere: a filled brand button with a plus and a label while closed, and
// an outline Cancel with an x once the new-item form is open.
export default function AddToggle ({ open, onClick, id, testId, label }) {
  const text = open ? i18n.t('cancel') : (label || i18n.t('add'))
  return (
    <Button
      id={id}
      data-testid={testId}
      type='button'
      variant={open ? 'secondary' : 'primary'}
      aria-expanded={open}
      onClick={onClick}
      className='reefpi-add-toggle'
      icon={open ? <FaXmark /> : <FaPlus />}
      style={{ textTransform: 'capitalize' }}
    >
      {text}
    </Button>
  )
}

AddToggle.propTypes = {
  open: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  testId: PropTypes.string,
  label: PropTypes.node
}
