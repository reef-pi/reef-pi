import React from 'react'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      action: (props.on ? 'off' : 'on'),
      value: this.props.value
    }
    this.update = this.update.bind(this)
  }

  update (e) {
    var payload = {
      on: this.state.action === 'on',
      name: this.props.name,
      outlet: this.props.outlet.id
    }
    this.props.hook(this.props.id, payload)
    this.setState({
      action: this.state.action === 'on' ? 'off' : 'on'
    })
  }

  render () {
    var noPadding = {
      padding: '0 !important',
      margin: '0 !important',
      marginLeft: '0px',
      marginRight: '0px',
      paddingLeft: '0px',
      paddingRight: '0px'
    }
    var onBtnClass = 'btn btn-secondary btn-block'
    if (this.state.action === 'off') {
      onBtnClass = 'btn btn-success btn-block'
    }
    return (
      <div className='row'>
        <div className='col-lg-3 col-xs-4'>
          <input id={this.props.name + '-on'} type='button' value={this.props.name} onClick={this.update} className={onBtnClass} />
        </div>
        <div className='col-lg-2 col-xs-3'>
          <label className='small'> {this.props.outlet.name} </label>
        </div>
      </div>
    )
  }
}
