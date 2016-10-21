import React from 'react';
import Devices from './devices.jsx';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

export default class DeviceManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
					addDevice: false
        };
        this.addDevice = this.addDevice.bind(this)
    }
    addDevice(){
			this.setState({addDevice: !this.state.addDevice})
    }

    render() {
      var borderStyle = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#dddddd'
      };
      var dStyle = {
				display: this.state.addDevice ? 'block' : 'none'
		  };
      return (
          <div className="container">
            <div className="col-sm-12">
               <Devices />
            </div>
            <div className="col-sm-12">
              <input type="button" value={this.state.addDevice ? "-" : "+"} onClick={this.addDevice}/>
							<div className="container" style={dStyle}>
						    <div className="col-sm-12" style={borderStyle}>
									<table>
										<tbody>
											<tr>
												<td>Type</td>
												<td>
													<DropdownButton  title="Type" id="xx">
														<MenuItem eventKey="1">Relay</MenuItem>
														<MenuItem eventKey="2">Doser</MenuItem>
													</DropdownButton>
												</td>
											</tr>
											<tr><td>Name</td><td><input type="text"/></td></tr>
											<tr><td>Pin</td><td><input type="text"/></td></tr>
											<tr>
												<td></td>
												<td>
													<input type="button" value="add" onClick={this.onClick}/>
												</td>
											</tr>
										</tbody>
									</table>
                </div>
							</div>
            </div>
          </div>
          );
    }
}
