import React from 'react';
import $ from 'jquery';

export default class AddBoard extends React.Component {
    constructor(props) {
        super(props);
        this.addBoard = this.addBoard.bind(this);
    }

    addBoard() {
        $.ajax({
            url: '/api/boards',
            type: 'PUT',
            data: JSON.stringify({
              name: $('#boardName').val(),
              pins: Number($('#boardPins').val())
            }),
            success: function(data) {
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }.bind(this)
        });

    }

    render() {
      return(
        <div>
          Name: <input type="text" id="boardName"/>
          Pins: <input type="text" id="boardPins"/>
          <input type="button" value="submit" onClick={this.addBoard}/>
        </div>
      );
    }
}
