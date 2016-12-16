import React from 'react';
import $ from 'jquery';

export default class Boards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          addBoard: false,
          boards: []
        };
        this.addBoard = this.addBoard.bind(this);
        this.boardList = this.boardList.bind(this);
        this.deleteBoard = this.deleteBoard.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.toggleAddBoardDiv = this.toggleAddBoardDiv.bind(this);
    }

    componentWillMount() {
      this.fetchData();
    }

    toggleAddBoardDiv() {
      this.setState({
        addBoard: !this.state.addBoard
      });
      $('#boardName').val('');
      $('#boardPins').val('');
    }

    fetchData(){
        $.ajax({
            url: '/api/boards',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
              this.setState({boards: data});
              this.toggleAddBoardDiv();
            }.bind(this),
            error: function(xhr, status, err) {
              console.log(err.toString());
            }.bind(this)
        });
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
              this.fetchData();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err.toString());
            }.bind(this)
        });

    }

    deleteBoard(ev) {
        var boardID = ev.target.id
        $.ajax({
            url: '/api/boards/' + boardID,
            type: 'DELETE',
            success: function(data) {
              this.fetchData();
            }.bind(this),
            error: function(xhr, status, err) {
              console.log(err.toString());
            }.bind(this)
        });
    }


    boardList(){
      var list = []
      $.each(this.state.boards, function(k, v){
        list.push(
          <li key={k}>
            {v.name}
            <input type="button" value="delete" id={v.id} onClick={this.deleteBoard}/>
          </li>
        );
      }.bind(this));
      return list;
    }


    render() {
      var dStyle = {
          display: this.state.addBoard ? 'block' : 'none'
      };
      return(
        <div>
          <ul>
              { this.boardList() }
          </ul>
          <input type="button" value={this.state.addBoard ? "-" : "+" } onClick = {this.toggleAddBoardDiv}/>
          <div style={dStyle}>
              Name: <input type="text" id="boardName"/>
              Pins: <input type="text" id="boardPins"/>
              <input type="button" value="add board" onClick={this.addBoard}/>
          </div>
        </div>
      );
    }
}
