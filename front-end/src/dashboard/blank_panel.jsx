import React from 'react'
import { ResponsiveContainer } from 'recharts'

class BlankPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      active: undefined
    }
  }

  componentDidMount () {
    this.setState({ active: true })
  }

  componentWillUnmount () {
    this.setState({ active: false })
  }

  render () {
    return (
      <div className='container'>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <p>&nbsp;</p>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default BlankPanel
