import React, { Children, cloneElement } from 'react'

export default class CollapsibleList extends React.Component {
  constructor (props) {
    super(props)
    const state = {
      expanded: {},
      readOnly: {}
    }

    Children.toArray(props.children).forEach(child => {
      if (child && child.props) {
        state.expanded[child.props.name] = !!child.props.defaultOpen
        state.readOnly[child.props.name] = true
      }
    })

    this.state = state

    this.onToggle = this.onToggle.bind(this)
    this.onEdit = this.onEdit.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onToggle (name) {
    // Don't collapse if editing
    if (this.state.readOnly[name] === true) {
      const expanded = { ...this.state.expanded }
      this.setState({ expanded: { ...expanded, [name]: !expanded[name] } })
    }
  }

  onEdit (name) {
    const readOnly = { ...this.state.readOnly }
    const expanded = { ...this.state.expanded }
    this.setState({
      expanded: { ...expanded, [name]: true },
      readOnly: { ...readOnly, [name]: false }
    })
  }

  onSubmit (name) {
    const readOnly = { ...this.state.readOnly }
    const expanded = { ...this.state.expanded }
    this.setState({
      expanded: { ...expanded, [name]: false },
      readOnly: { ...readOnly, [name]: true }
    })
  }

  componentWillReceiveProps (nextProps) {
    const expanded = { ...this.state.expanded }
    const readOnly = { ...this.state.readOnly }

    nextProps.children.forEach(child => {
      if (this.state.expanded[child.props.name] == null) {
        expanded[child.props.name] = !!child.props.defaultOpen
        readOnly[child.props.name] = true
      }
    })
    this.setState({ expanded: expanded, readOnly: readOnly })
  }

  render () {
    const children = Children.toArray(this.props.children)

    return (
      <>
        {children.map(child => {
          return cloneElement(child, {
            expanded: this.state.expanded[child.props.name],
            readOnly: this.state.readOnly[child.props.name],
            onToggle: this.onToggle,
            onEdit: this.onEdit,
            onSubmit: this.onSubmit
          })
        })}
      </>
    )
  }
}
