import React from 'react'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

// props: hook, selector_id, components, current_id
export default class ComponentSelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: 'none',
      current_id: props.current_id
    }
    this.setID = this.setID.bind(this)
  }

  setID (k, name) {
    return ev => {
      this.setState({
        title: name,
        current_id: k
      })
      this.props.hook(k)
    }
  }

  render () {
    const items = []
    let title = this.state.title
    Object.keys(this.props.components).forEach(k => {
      const v = this.props.components[k]
      if (v === undefined || v === null) {
        return
      }
      const active = v.id === this.state.current_id
      if (active) {
        title = v.name
      }
      items.push({
        label: v.name,
        onSelect: this.setID(v.id, v.name)
      })
    })
    return (
      <Menu
        buttonLabel={title}
        items={items}
      />
    )
  }
}
