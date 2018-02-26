import React from 'react'
import Notify from './notify.jsx'

export default class ProbeConfig extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }

    this.updateConfig  = this.updateConfig.bind(this)
  }

  updateConfig(v) {
    this.setState({
      config: v
    })
    this.props.hook
  }

  render() {
    return(
      <div className='container'>
        <div className='row'>
          <div className='col-sm-4'>
            <Notify data={this.props.data.notify} hook={this.updateConfig} readOnly={this.props.readOnly}/>
          </div>
        </div>
      </div>
    )
  }
}
