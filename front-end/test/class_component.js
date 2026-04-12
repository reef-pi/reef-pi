export function mountClassComponent (Component, props = {}) {
  const instance = new Component(props)
  instance.setState = update => {
    const patch = typeof update === 'function' ? update(instance.state, instance.props) : update
    instance.state = { ...instance.state, ...patch }
  }
  return instance
}

export async function flushPromises () {
  await Promise.resolve()
  await Promise.resolve()
}
