import React, { Component } from 'react';
import _ from 'lodash';

const API = 'https://golf-leaderboard-data.p.rapidapi.com/leaderboard/456';
//const DEFAULT_QUERY = 'redux';

class Overview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [
        {"id":1, "initials":"NK", "picks":["120226","670","118438"]},
        {"id":2, "initials":"JGl", "picks":["123640","120226","115333"]},
        {"id":3, "initials":"PM", "picks":["102088","109483","92167"]},
        {"id":4, "initials":"RB", "picks":["109483","106129","102181"]},
        {"id":5, "initials":"LM", "picks":["102088","109483","1477"]},
        {"id":6, "initials":"CB", "picks":["106129","5839","130246"]},
        {"id":9,"initials":"JGa", "picks":["109483","120226","92167"]}],
      golfers: {},
      lastUpdate: null,
      current_round:0,
      cut_line:0,
    };
  }

  componentDidMount() {
    //Wil get live data here
    let returnData = {};
    fetch(API, {
	    "method": "GET",
	    "headers": {
		    "x-rapidapi-key": "af4dd1cadfmsh382b6fa5593ccb8p1e139fjsnefe3f4bcd52e",
		    "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com"
	    }
    })
    .then(response => response.json())
       .then(data => {
         console.log(data.results.leaderboard);
         //returnData.rawData = data.leaderboard.players;
         returnData.objData = _.mapKeys(data.results.leaderboard, 'player_id');
        //  //console.log('cut line ',data.leaderboard.cut_line.cut_line_score);
         const now = new Date();
         this.setState(
           { golfers: returnData.objData,
             lastUpdate: now.toLocaleString("en-GB"),
             current_round: data.results.tournament.live_details.current_round,
             cut_line_score: data.results.tournament.live_details.cut_value
          })
        })
    .catch(err => {
	    console.error(err);
    });
  }

  renderGolfer = (golferId) => {
    console.log('GolferID:',golferId);
    if(!(golferId in this.state.golfers)){
      console.log('golfer not found!');
      return (
        <li className="list-group-item" key={golferId}>
          Waiting for data for golfer: {golferId}
        </li>
      )
    }
    const specificGolfer = this.state.golfers[golferId];
    console.log('found golfer: ',specificGolfer);
    const { player_bio } = specificGolfer;
    let playingStatus = 'Not Started';
    let missingCut = false;
    //console.log('golfer: ', specificGolfer);
    if(specificGolfer.holes_played && specificGolfer.current_round === this.state.current_round){
      if(specificGolfer.holes_played === 18){
        playingStatus = 'Round finished'
      } else {
        playingStatus = `On Course thru: ${specificGolfer.holes_played}`
      }
    }
    if(specificGolfer.status === 'cut'){
      playingStatus = 'Cut'
    }
    if(this.state.current_round < 3 && specificGolfer.total_to_par > this.state.cut_line_score){
      missingCut = true;
    }

    return (
      <li className="list-group-item" key={golferId}>
        {specificGolfer.current_position} {specificGolfer.first_name} {specificGolfer.last_name} - Score: <span style={{color: specificGolfer.total_to_par < 0 ? "red" : "blue"}}>{specificGolfer.total_to_par}</span> - {playingStatus} {missingCut ? <span style={{color: "red"}}>Missing Cut</span> : <span />}
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
        player.totalScore = player.totalScore + parseInt(this.state.golfers[golferId].total_to_par);

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

  cmpPlayers = (a, b) => {
    if (a > b) return +1;
    if (a < b) return -1;
    return 0;
  }

  render() {
    const { players,lastUpdate, current_round, cut_line_score } = this.state;

    // Update each player with live scores and status
    players.forEach( (nextPlayer) => {
      this.updatePlayerScore(nextPlayer);
    });

    // Sort the player list descending by totalScore
    // const sortedPlayers = Object.values(players).sort((playerA, playerB) => {
    //   return playerA.totalScore - playerB.totalScore
    // });
    const sortedPlayers = Object.values(players).sort((playerA, playerB) => {
      return this.cmpPlayers(playerA.status, playerB.status) || this.cmpPlayers(playerA.totalScore, playerB.totalScore)
    });

    //console.log("sortedPlayers: ", sortedPlayers);

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
              <strong>{nextPlayer.initials} - Total Score: <span style={{color: (nextPlayer.status !== 'Cut' && nextPlayer.totalScore) < 0 ? "red" : "blue"}}>{nextPlayer.totalScore}</span> {nextPlayer.status}</strong>
            </div>
            {this.renderGolferList(nextPlayer.picks)}
          </div>
        )}
      </div>
    );
  }

}

export default Overview;
