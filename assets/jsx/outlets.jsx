import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

export default class Outlets extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
      return (
          <div>
            <Table responsive>
              <thead>
                <tr>
                  <th>Outlet</th>
                  <th>Wire connection</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>AC 100V 1</td><td><input type="text"/></td></tr>
                <tr><td>AC 100V 2</td><td><input type="text"/></td></tr>
                <tr><td>AC 100V 3</td><td><input type="text"/></td></tr>
                <tr><td>AC 100V 4</td><td><input type="text"/></td></tr>
                <tr><td>AC 100V 5</td><td><input type="text"/></td></tr>
                <tr><td>AC 100V 6</td><td><input type="text"/></td></tr>
              </tbody>
            </Table>
            <input type="button" value="save" />
          </div>
          );
    }
}
