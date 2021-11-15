import React from 'react'
import { connect } from 'react-redux'
import IntervalChart from './charts/interval'
import FixedChart from './charts/fixed'
import DiurnalChart from './charts/diurnal'
import GenericLightChart from './charts/generic'

class chart extends React.Component {
  render () {
    if (this.props.config === undefined) {
      return <span />
    }
    const keys = Object.keys(this.props.config.channels)
    if (keys.length > 1) {
      return (<span> multi channel light charts are not supported</span>)
    }
    const ch = this.props.config.channels[keys[0]]
    switch (ch.profile.type) {
      case 'interval':
        return <IntervalChart channel={ch} width={this.props.width} height={this.props.height} />
      case 'fixed':
        return <FixedChart channel={ch} width={this.props.width} height={this.props.height} />
      case 'diurnal':
        return <DiurnalChart channel={ch} width={this.props.width} height={this.props.height} />
      default:
        return <GenericLightChart light={this.props.config} width={this.props.width} height={this.props.height} />
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.lights.find(l => {
      return l.id === ownProps.light_id
    })
  }
}

const Chart = connect(
  mapStateToProps,
  null
)(chart)
export default Chart
