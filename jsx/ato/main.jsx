import React from 'react'
import Ato from './ato'
import New from './new'
import {fetchATOs} from 'redux/actions/ato'
import {connect} from 'react-redux'
import {fetchEquipment} from 'redux/actions/equipment'
import {fetchInlets} from 'redux/actions/inlets'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
  }

  componentDidMount () {
    this.props.fetchATOs()
    this.props.fetchEquipment()
    this.props.fetchInlets()
  }

  render () {
    return (
      <div>
        <ul className='list-group list-group-flush'>
          {
            this.props.atos.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).map(item => {
              return (
                <div key={item.id} className='list-group-item'>
                  <Ato data={item}
                    inlets={this.props.inlets}
                    equipment={this.props.equipment} />
                </div>
              )
            })
          }
          <New inlets={this.props.inlets}
            equipment={this.props.equipment} />
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    atos: state.atos,
    equipment: state.equipment,
    inlets: state.inlets
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchATOs: () => dispatch(fetchATOs()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    fetchInlets: () => dispatch(fetchInlets())
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
