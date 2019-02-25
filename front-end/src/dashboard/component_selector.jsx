import React from 'react'
import $ from 'jquery'
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
    var items = []
    var title = this.state.title
    $.each(this.props.components, function (k, v) {
      if (v === undefined || v === null) {
        return
      }
      var active = v.id === this.state.current_id
      var cName = 'dropdown-item'
      if (active) {
        title = v.name
        cName += ' active'
      }
      items.push(
        <a className={cName} href='#' onClick={this.setID(v.id, v.name)} key={k}>
          <span id={this.props.selector_id + '-' + v.id}>{v.name}</span>
        </a>
      )
    }.bind(this))
    return (
      <div className='dropdown'>
        <button
          id={'ato-select-' + this.props.selector_idj}
          className='btn btn-secondary dropdown-toggle'
          type='button'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          {title}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {items}
        </div>
      </div>
    )
  }
}
