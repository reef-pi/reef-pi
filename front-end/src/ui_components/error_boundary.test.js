import ErrorBoundary from './error_boundary'
import { mountClassComponent } from '../../test/class_component'

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const instance = mountClassComponent(ErrorBoundary, { children: 'Child' })
    expect(instance.render()).toBe('Child')
  })

  it('renders error details after componentDidCatch', () => {
    const instance = mountClassComponent(ErrorBoundary, { children: 'Child' })
    instance.componentDidCatch(new Error('error'), { componentStack: 'stackTrace' })
    const rendered = instance.render()

    expect(rendered.props.children[0].type).toBe('h2')
    expect(rendered.props.children[1].type).toBe('details')
  })

  it('resets state when the tab prop changes', () => {
    const instance = mountClassComponent(ErrorBoundary, { tab: 'tab1', children: 'Child' })
    instance.componentDidCatch(new Error('error'), { componentStack: 'stackTrace' })

    const nextState = ErrorBoundary.getDerivedStateFromProps({ tab: 'tab2' }, instance.state)
    instance.state = nextState

    expect(instance.state.error).toBeNull()
    expect(instance.state.errorInfo).toBeNull()
    expect(instance.render()).toBe('Child')
  })
})
