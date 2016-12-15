import React from 'react';
import $ from 'jquery';

export default class BoardsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          boards: []
        };
        this.boardList = this.boardList.bind(this);
        this.deleteBoard = this.deleteBoard.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount() {
      this.fetchData();
    }
    fetchData(){
        $.ajax({
            url: '/api/boards',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
              this.setState({boards: data});
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
              <div>{v.name}</div>
              <div><input type="button" value="delete" id={v.id} onClick={this.deleteBoard} /></div>
            </li>
            );
      }.bind(this));
      return list;
    }

    render() {
      return(
        <ul>
          { this.boardList() }
        </ul>
      );
    }
}
