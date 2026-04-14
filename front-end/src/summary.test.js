import React from 'react'
import { shallow } from 'enzyme'
import Summary from './summary'
import 'isomorphic-fetch'


describe('Summary', () => {
  it('<Summary />', () => {
    const m = shallow(
      <Summary
        info={{}}
        devMode={false}
        fetch={() => true}
        errors={[]}
        timer={window.setInterval(() => true, 1800 * 1000)}
      />
    ).instance()
    m.componentWillUnmount()
  })
})
