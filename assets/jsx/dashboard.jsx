import React from 'react';
import $ from 'jquery';

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          ip: '',
          time: ''
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
                ip: data.ip,
                time: data.time
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
            <ul>
              <li> Time: {this.state.time}</li>
              <li> IP: {this.state.ip} </li>
            </ul>
          </div>
          );
    }
}
