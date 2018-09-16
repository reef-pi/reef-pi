import React from 'react'
import { confirm } from 'utils/confirm'
import $ from 'jquery'
import { fetchOutlets, updateOutlet, deleteOutlet, createOutlet } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import Outlet from './outlet'

class outlets extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
  }

  remove(id) {
    return function() {
      confirm('Are you sure ?').then(
        function() {
          this.props.delete(id)
        }.bind(this)
      )
    }.bind(this)
  }

  componentDidMount() {
    this.props.fetch()
  }

  add() {
    this.setState({
      add: !this.state.add
    })
    $('#outletName').val('')
    $('#outletPin').val('')
  }

  save() {
    var payload = {
      name: $('#outletName').val(),
      pin: parseInt($('#outletPin').val()),
      reverse: $('#outletReverse')[0].checked
    }
    this.props.create(payload)
    this.add()
  }

  list() {
    var list = []
    this.props.outlets.forEach((o, i) => {
      list.push(
        <Outlet
          name={o.name}
          outlet_id={o.id}
          pin={o.pin}
          key={i}
          reverse={o.reverse}
          equipment={o.equipment}
          remove={this.remove(o.id)}
          update={p => {
            this.props.update(o.id, p)
            this.props.fetch()
          }}
        />
      )
    })
    return list
  }

  render() {
    var dStyle = {
      display: this.state.add ? 'block' : 'none'
    }
    return (
      <div className="container">
        <label className="h6">Outlets</label>
        <div className="row">
          <div className="container">{this.list()}</div>
        </div>
        <div className="row">
          <input
            id="add_outlet"
            type="button"
            value={this.state.add ? '-' : '+'}
            onClick={this.add}
            className="btn btn-outline-success"
          />
          <div className="container" style={dStyle}>
            <div className="row">
              <div className="col-sm-3">
                <div className="input-group">
                  <span className="input-group-addon"> Name </span>
                  <input type="text" id="outletName" className="form-control" />
                </div>
              </div>
              <div className="col-sm-3">
                <div className="input-group">
                  <span className="input-group-addon"> Pin </span>
                  <input type="text" id="outletPin" className="form-control" />
                </div>
              </div>
              <div className="col-sm-3">
                <div className="input-group">
                  <span className="input-group-addon"> Reverse </span>
                  <input type="checkbox" id="outletReverse" />
                </div>
              </div>
              <div className="col-sm-1">
                <input
                  type="button"
                  id="createOutlet"
                  value="add"
                  onClick={this.save}
                  className="btn btn-outline-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { outlets: state.outlets }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchOutlets()),
    create: outlet => dispatch(createOutlet(outlet)),
    delete: id => dispatch(deleteOutlet(id)),
    update: (id, o) => dispatch(updateOutlet(id, o))
  }
}

const Outlets = connect(
  mapStateToProps,
  mapDispatchToProps
)(outlets)
export default Outlets
