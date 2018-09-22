import React from 'react'
import ATO from './ato'
import New from './new'
import { fetchATOs } from 'redux/actions/ato'
import { connect } from 'react-redux'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
  }

  componentDidMount () {
    this.props.fetchATOs()
  }

  list () {
    var list = []
    this.props.atos.forEach((v, k) => {
      list.push(
        <div key={'ato-' + k} className='row list-group-item'>
          <ATO data={v} upateHook={this.props.fetchATOs} />
        </div>
      )
    })
    return list
  }

  render () {
    return (
      <React.Fragment>
        <ul className='list-group list-group-flush' key='ato_list'>
          {this.list()}
        </ul>
        <New key='ato_new' />
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    atos: state.atos
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchATOs: () => dispatch(fetchATOs())
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
