import React from 'react'
import { ResponsiveContainer } from 'recharts'
import i18next from 'i18next'

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
      <div className='container' style={{ border: '1px solid gray', marginBottom: '3px' }}>
        <span className='h6' style={{ color: 'gray' }}>{i18next.t('dashboard:blank_panel')}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <p>&nbsp;</p>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default BlankPanel
