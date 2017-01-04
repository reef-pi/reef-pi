import React from 'react';
import $ from 'jquery';

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          info: {}
        }
        this.onChange = this.onChange.bind(this)
    }

    componentDidMount() {
       this.onChange();
       setInterval(this.onChange, 180*1000);
    }

    onChange(){
        $.ajax({
            url: '/api/info',
            type: 'GET',
            success: function(data) {
              this.setState({
                info: data
              });
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }.bind(this)
        });
    }

    render() {
      var borderStyle = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#dddddd'
      };
      return (
          <div className="container">
            <h5>Controller Summary</h5>
            <ul className="list-group">
              <li className="list-group-item">
                <div className="row">
                  <div className="col-sm-2">Time</div>
                  <div className="col-sm-6">{this.state.info.time}</div>
                </div>
              </li>
              <li className="list-group-item">
                <div className="row">
                  <div className="col-sm-2">IP</div>
                  <div className="col-sm-6">{this.state.info.ip}</div>
                </div>
              </li>
              <li className="list-group-item">
                <div className="row">
                  <div className="col-sm-2">Up Since</div>
                  <div className="col-sm-6">{this.state.info.start_time}</div>
                </div>
              </li>
              <li className="list-group-item">
                <div className="row">
                  <div className="col-sm-2">Temperature</div>
                  <div className="col-sm-6">{this.state.info.temperature}</div>
                </div>
              </li>
            </ul>
          </div>
          );
    }
}
