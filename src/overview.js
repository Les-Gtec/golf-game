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
      current_round:0,
      cut_line:0,
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
         console.log('cut line ',data.leaderboard.cut_line.cut_line_score);
         const now = new Date();
         this.setState(
           { golfers: returnData.objData,
             lastUpdate: now.toLocaleString("en-GB"),
             current_round: data.leaderboard.current_round,
             cut_line_score: data.leaderboard.cut_line.cut_line_score
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
    let playingStatus = 'Not Started';
    let missingCut = false;
    console.log('golfer: ', specificGolfer);
    if(specificGolfer.thru && specificGolfer.current_round === this.state.current_round){
      if(specificGolfer.thru === 18){
        playingStatus = 'Round finished'
      } else {
        playingStatus = `On Course thru: ${specificGolfer.thru}`
      }
    }
    if(specificGolfer.status === 'cut'){
      playingStatus = 'Cut'
    }
    if(specificGolfer.total > this.state.cut_line_score){
      missingCut = true;
    }

    return (
      <li className="list-group-item" key={golferId}>
        {specificGolfer.current_position} {player_bio.first_name} {player_bio.last_name} - Score: <span style={{color: specificGolfer.total < 0 ? "red" : "blue"}}>{specificGolfer.total}</span> - {playingStatus} {missingCut ? <span style={{color: "red"}}>Missing Cut</span> : <span />}
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

  updatePlayerScore = (player) => {

    player.totalScore = 0;
    player.status = 'Active';

    player.picks.forEach( (golferId) => {
      if((golferId in this.state.golfers)) {
        player.totalScore = player.totalScore + parseInt(this.state.golfers[golferId].total);

        // console.log('checking cut status: ', this.state.golfers[golferId].player_bio.last_name, " Status: ", this.state.golfers[golferId].status);
        if(this.state.golfers[golferId].status==='cut'){
          player.status = 'Cut';
        }
      }
    });
  }

  renderCutLine = (current_round, cut_line_score) => {
    if(parseInt(current_round)>2){
      return (
        <div>
          It's the weekend
        </div>
      )
    } else {
      return (
        <div>
          Proj. Cut: {cut_line_score}
        </div>
      )
    }
  }

  render() {
    const { players,lastUpdate, current_round, cut_line_score } = this.state;

    // Update each player with live scores and status
    players.forEach( (nextPlayer) => {
      this.updatePlayerScore(nextPlayer);
    });

    // Sort the player list descending by totalScore
    const sortedPlayers = Object.values(players).sort((playerA, playerB) => {
      return playerA.totalScore - playerB.totalScore
    });

    console.log("sortedPlayers: ", sortedPlayers);

    // Render the sorted player list
    return (
      <div className="container">
      <header>
          <div class="navbar navbar-dark bg-dark shadow-sm">
            <div class="container navbar-brand d-flex justify-content-between">
                <div>
                  <strong>Golf Sweepstake</strong>
                </div>
                <div>
                  Round: {current_round}
                </div>
                  { this.renderCutLine(current_round, cut_line_score)}
                <div>
                   Updated: {lastUpdate}
                </div>
            </div>
          </div>
        </header>
        {sortedPlayers.map(nextPlayer =>
          <div key={nextPlayer.id}  className="card mt-2 mb-2">
            <div className={"card-header" + (nextPlayer.status === 'Cut' ? ' mc-header' : '')}>
              <strong>{nextPlayer.initials} - Total Score: <span style={{color: nextPlayer.totalScore < 0 ? "red" : "blue"}}>{nextPlayer.totalScore}</span> {nextPlayer.status}</strong>
            </div>
            {this.renderGolferList(nextPlayer.picks)}
          </div>
        )}
      </div>
    );
  }

}

export default Overview;
