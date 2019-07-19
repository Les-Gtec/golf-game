import React, { Component } from 'react';
import _ from 'lodash';

const API = 'https://statdata.pgatour.com/r/100/leaderboard-v2mini.json';
//const DEFAULT_QUERY = 'redux';

class Overview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [
        {"id":1, "initials":"NK", "picks":["28237","46970","34242"]},
        {"id":2, "initials":"LM", "picks":["28237","25572","24138"]},
        {"id":3, "initials":"JR", "picks":["26329","25364","33204"]},
        {"id":4, "initials":"CB", "picks":["30911","22405","34360"]},
        {"id":5, "initials":"JOB", "picks":["32102","26329","26499"]},
        {"id":6, "initials":"RB", "picks":["25572","26329","32839"]},
        {"id":7, "initials":"HB", "picks":["28237","36689","37250"]},
        {"id":8, "initials":"PM", "picks":["28237","24138","01810"]},
        {"id":9, "initials":"JaG", "picks":["36689","08793","29970"]},
        {"id":10, "initials":"JoG", "picks":["36689","08793","27349"]},
        {"id":11, "initials":"MF", "picks":["46970","29454","24138"]},
        {"id":12, "initials":"AG", "picks":["29454","48887","34046"]}],
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
    let returnScore = {};
    returnScore.totalScore = 0;
    returnScore.status = 'Active';
    golferArray.forEach( (golferId) => {
      if((golferId in this.state.golfers)){
        returnScore.totalScore = returnScore.totalScore + parseInt(this.state.golfers[golferId].total)
        console.log('checking cut status: ',this.state.golfers[golferId].player_bio.last_name, " Status: ", this.state.golfers[golferId].status);
        if(this.state.golfers[golferId].status==='cut'){
          returnScore.status = 'Cut'
        }
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
            <div className={"card-header" + (this.calculatePlayerTotal(player.picks).status === 'Cut' ? ' mc-header' : '')}>
              <strong>{player.initials} - Total Score: <span style={{color: this.calculatePlayerTotal(player.picks).totalScore < 0 ? "red" : "blue"}}>{this.calculatePlayerTotal(player.picks).totalScore}</span> {this.calculatePlayerTotal(player.picks).status}</strong>
            </div>
            {this.renderGolferList(player.picks)}
          </div>
        )}
      </div>
    );
  }

}

export default Overview;
