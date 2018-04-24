import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'

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

  setID(k, ev){
    this.setState({
      title: $(ev.target).text(),
      current_id: k
      }
    )
    this.props.hook(k)
  }

  render() {
    var items = []
    var title = this.state.title
    $.each(this.props.components, function(k,v){
      var active = v.id === this.state.current_id
      if(v===undefined || v === null) {
        return
      }
      if(active){
        title = v.name
      }
      items.push(
        <MenuItem key={k} active={active} eventKey={v.id} >
          <span id={this.props.selector_id+'-'+v.id}>{ v.name }</span>
        </MenuItem>
      )
    }.bind(this))
    return(
      <DropdownButton
        title={title}
        id={'ato-select-'+this.props.selector_idj}
        onSelect={this.setID} >
        { items }
      </DropdownButton>
    )
  }
}

