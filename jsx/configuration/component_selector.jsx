import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'

// props: hook, selector_id, components, active

export default class ComponentSelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: 'none'
    }
    this.setID = this.setID.bind(this)
  }

  setID(k, ev){
    this.setState({
     title: $(ev.target).text()
     }
   )
   this.props.hook(k)
  }

  render() {
    var items = []
    $.each(this.props.components, function(k,v){
     items.push(
        <MenuItem key={k} active={false} eventKey={v.id}>{v.name}</MenuItem>
      )
    }.bind(this))
    return(
      <DropdownButton
        title={this.state.title}
        id={'ato-select-'+this.props.selector_idj}
        onSelect={this.setID} >
        {items}
      </DropdownButton>
    )
  }
}

