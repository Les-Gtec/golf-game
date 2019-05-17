import React, { Component } from 'react';
import _ from 'lodash';

const API = 'https://statdata.pgatour.com/r/033/leaderboard-v2mini.json';
//const DEFAULT_QUERY = 'redux';

class Overview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [
        {"id":1, "initials":"LM", "picks":["28237","24138","21528"]},
        {"id":2, "initials":"NK", "picks":["28237","27064","46970"]},
        {"id":3, "initials":"CB", "picks":["22405","30911","40098"]},
        {"id":4, "initials":"JOB", "picks":["35450","24502","26329"]},
        {"id":5, "initials":"RB", "picks":["08793","34046","33204"]},
        {"id":6, "initials":"HB", "picks":["36689","01810","25804"]},
        {"id":7, "initials":"PM", "picks":["28237","33204","25198"]}],
      golfers: {},
      lastUpdate: null,
    };
  }

  componentDidMount() {
    //Wil get live data here
    let returnData = {};
    fetch(API)
       .then(response => response.json())
       .then(data => {
         console.log(data);
         //returnData.rawData = data.leaderboard.players;
         returnData.objData = _.mapKeys(data.leaderboard.players, 'player_id');
         //console.log(returnData);
         const now = new Date();
         this.setState(
           { golfers: returnData.objData,
             lastUpdate: now.toLocaleString("en-GB")
          });
       });
  }

  renderGolfer = (golferId) => {
    if(!(golferId in this.state.golfers)){
      return (
        <li className="list-group-item" key={golferId}>
          Waiting for data for golfer: {golferId}
        </li>
      )
    }
    const specificGolfer = this.state.golfers[golferId];
    const { player_bio } = specificGolfer;

    return (
      <li className="list-group-item" key={golferId}>
        {specificGolfer.current_position} {player_bio.first_name} {player_bio.last_name} - Score: <span style={{color: specificGolfer.total < 0 ? "red" : "blue"}}>{specificGolfer.total}</span>
      </li>
    )
  }

  renderGolferList = (golferArray) => {

    return (
      <ul className="list-group list-group-flush">
        {golferArray.map(golferId => this.renderGolfer(golferId))}
      </ul>
    )
  }

  calculatePlayerTotal = (golferArray) => {
    let returnScore = 0;
    golferArray.forEach( (golferId) => {
      if(!(golferId in this.state.golfers)){
        returnScore = returnScore;
      } else {
        returnScore = returnScore + parseInt(this.state.golfers[golferId].total)
      }
    })
    return returnScore;
  }

  render() {
    const { players,lastUpdate } = this.state;

    return (
      <div className="container">
        <div>Last Updated: {lastUpdate}</div>
        {players.map(player =>
          <div key={player.id}  className="card mt-2 mb-2">
            <div className="card-header">
              <strong>{player.initials} - Total Score: <span style={{color: this.calculatePlayerTotal(player.picks) < 0 ? "red" : "blue"}}>{this.calculatePlayerTotal(player.picks)}</span></strong>
            </div>
            {this.renderGolferList(player.picks)}
          </div>
        )}
      </div>
    );
  }

}

export default Overview;
