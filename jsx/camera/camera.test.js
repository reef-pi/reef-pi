import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import Main from './main'
import Capture from './capture'
import Config from './config'
import Gallery from './gallery'
import Motion from './motion'
import configureMockStore from 'redux-mock-store'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Camera module', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore({camera: {}})}/>)
  })

  it('<Capture />', () => {
    shallow(<Capture store={mockStore({camera: {}})}/>)
  })

  it('<Config />', () => {
    shallow(<Config config={{}}/>)
  })

  it('<Gallery />', () => {
    shallow(<Gallery />)
  })

  it('<Motion />', () => {
    shallow(<Motion url='' width={300} height={600} />)
  })
})
