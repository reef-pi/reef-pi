import React from "react";
import SignIn from "sign_in";
import { confirm } from "utils/confirm";
import { reload, reboot, powerOff } from "redux/actions/admin";
import { connect } from "react-redux";

class admin extends React.Component {
  constructor(props) {
    super(props);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
    this.reload = this.reload.bind(this);
    this.signout = this.signout.bind(this);
  }

  signout() {
    SignIn.removeCreds();
    window.location.reload(true);
  }

  reload() {
    confirm("Are you sure ?").then(this.props.reload);
  }

  powerOff() {
    confirm("Are you sure ?").then(this.props.powerOff);
  }

  reboot() {
    confirm("Are you sure ?").then(this.props.reboot);
  }

  render() {
    const btnClass = "btn btn-outline-danger btn-block";
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-lg-3">
            <button onClick={this.signout} type="button" className={btnClass}>
              Sign Out
            </button>
          </div>
          <div className="col-md-12 col-lg-3">
            <button onClick={this.reload} type="button" className={btnClass}>
              Reload
            </button>
          </div>
          <div className="col-md-12 col-lg-3">
            <button onClick={this.reboot} type="button" className={btnClass}>
              Reboot
            </button>
          </div>
          <div className="col-md-12 col-lg-3">
            <button onClick={this.powerOff} type="button" className={btnClass}>
              PowerOff
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reload: () => dispatch(reload()),
    reboot: () => dispatch(reboot()),
    powerOff: () => dispatch(powerOff())
  };
};

const Admin = connect(
  null,
  mapDispatchToProps
)(admin);
export default Admin;
