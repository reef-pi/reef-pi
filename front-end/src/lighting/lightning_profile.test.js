import LightningProfile from './lightning_profile'

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  const children = node.props?.children
  if (children !== undefined) {
    ;[].concat(children).forEach(child => findAll(child, predicate, acc))
  }
  return acc
}

const findField = (tree, name) => findAll(
  tree,
  node => node.props?.name === name && Object.prototype.hasOwnProperty.call(node.props || {}, 'onChange')
)[0]

describe('LightningProfile', () => {
  const config = {
    start: '08:00:00',
    end: '20:00:00',
    frequency: 2,
    flash_slot: 1,
    intensity: 100
  }

  it('renders without throwing with full config', () => {
    const handler = jest.fn()
    expect(() => LightningProfile({
      config,
      errors: {},
      touched: {},
      readOnly: false,
      onChangeHandler: handler
    })).not.toThrow()
  })

  it('renders without throwing with no config (uses fallback defaults)', () => {
    const handler = jest.fn()
    expect(() => LightningProfile({
      config: undefined,
      errors: {},
      touched: {},
      readOnly: false,
      onChangeHandler: handler
    })).not.toThrow()
  })

  it('calls onChangeHandler with merged config on field change', () => {
    const handler = jest.fn()
    const startField = findField(LightningProfile({
      config,
      errors: {},
      touched: {},
      readOnly: false,
      onChangeHandler: handler
    }), 'config.start')
    startField.props.onChange({
      target: { name: 'start', value: '09:00:00' }
    })
    expect(handler).toHaveBeenCalledWith({ ...config, start: '09:00:00' })
    expect(config.start).toBe('08:00:00')
    expect(handler.mock.calls[0][0]).not.toBe(config)
  })

  it('renders in readOnly mode without throwing', () => {
    const tree = LightningProfile({
      config,
      errors: {},
      touched: {},
      readOnly: true,
      onChangeHandler: () => {}
    })
    const fields = [
      findField(tree, 'config.start'),
      findField(tree, 'config.end'),
      findField(tree, 'config.frequency'),
      findField(tree, 'config.flash_slot'),
      findField(tree, 'config.intensity')
    ]
    fields.forEach(field => {
      expect(field.props.readOnly).toBe(true)
    })
  })

  it('renders with validation errors applied', () => {
    const startField = findField(LightningProfile({
      config,
      errors: { 'config.start': 'required' },
      touched: { 'config.start': true },
      readOnly: false,
      onChangeHandler: () => {}
    }), 'config.start')
    expect(startField).toBeTruthy()
  })
})
