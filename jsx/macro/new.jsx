import React from 'react'
import { showAlert } from 'utils/alert'
import { createMacro } from 'redux/actions/macro'
import { connect } from 'react-redux'
import Steps from './steps'

class newMacro extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      add: false,
      steps: []
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
    this.update = this.update.bind(this)
    this.updateSteps = this.updateSteps.bind(this)
  }

  updateSteps(steps) {
    this.setState({ steps: steps })
  }

  update(k) {
    return function(ev) {
      var h = {}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this)
  }

  toggle() {
    this.setState({
      add: !this.state.add
    })
    this.setState({
      name: ''
    })
  }

  ui() {
    if (!this.state.add) {
      return
    }
    return [
      <div className="row">
        <div className="col">Name</div>
        <div className="col">
          <input type="text" id="new_macro_name" onChange={this.update('name')} value={this.state.name} />
        </div>
      </div>,
      <div className="row">
        <div className="col">
          <Steps steps={this.state.steps} hook={this.updateSteps} />
        </div>
      </div>,
      <div className="row">
        <div className="col">
          <div className="float-right">
            <input type="button" id="create_macro" value="add" onClick={this.add} className="btn btn-outline-primary" />
          </div>
        </div>
      </div>
    ]
  }

  add() {
    if (this.state.name === '') {
      showAlert('Name can not be empty')
      return
    }
    var payload = {
      name: this.state.name,
      steps: this.state.steps
    }
    this.props.create(payload)
    this.toggle()
  }

  render() {
    return [
      <input
        id="add_new_macro"
        type="button"
        value={this.state.add ? '-' : '+'}
        onClick={this.toggle}
        className="btn btn-outline-success"
      />,
      this.ui()
    ]
  }
}

const mapDispatchToProps = dispatch => {
  return {
    create: a => dispatch(createMacro(a))
  }
}

const New = connect(
  null,
  mapDispatchToProps
)(newMacro)
export default New
