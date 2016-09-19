import angular from 'angular';
import ngCookies from 'angular-cookies';

import '../style/clear.less';
import '../style/app.less';

let game = () => {
  return {
    template: require('./app.jade'),
    controller: 'GameCtrl',
    controllerAs: 'game'
  }
};

class GameCtrl {
  constructor($timeout, $cookies) {
     var self = this;

    self.scoreYou = $cookies.get('scoreYou');
    if (isNaN(self.scoreYou)) self.scoreYou = 0;

    self.scoreCpu = $cookies.get('scoreCpu');
    if (isNaN(self.scoreCpu)) self.scoreCpu = 0;


    self.appState = 'start';
    self.gameOverText = '';

    self.changeAppState = function(state){
        self.appState = state;
    }

    self.newGame = function () {
        self.curTurn = 'X';
        self.appState = 'play';
        self.game = [null, null, null, null, null, null, null, null, null];
    };

    self.playerState = function(player) {
        var playerArray = [];

        self.game.forEach(function(item){
            if (item == player) {
                playerArray.push(1);
            } else {
                playerArray.push(0);
            }
        });
        return parseInt(playerArray.join(''), 2);
    }

    self.checkWin = function (playerState) {
        var winArr = [292, 146, 73, 448, 56, 7, 273, 84];
        var isWin = false;

        winArr.forEach(function (winState) {
            if ((winState & playerState) == winState) {
                isWin = true;
            }
        });
        return isWin;
    };

    self.gameOver = function (winner) {

        if (winner == 'X') {
            self.scoreYou++;
            $cookies.put('scoreYou', self.scoreYou);
            self.gameOverText = "You win!";
        }
        else if (winner == '0') {
            self.scoreCpu++;
            $cookies.put('scoreCpu', self.scoreCpu);
            self.gameOverText = "CPU win!";
        }
        else if (winner == 'draw') {
            self.gameOverText = "Draw";
        }


        $timeout(function(){
            self.changeAppState('finish');
        }, 1000);

        return false;
    };

    self.noEmptyCell = function () {
        return self.game.indexOf(null) < 0;
    };

    self.cpuTurn = function () {
        var stateYou = self.playerState('X');
        var stateCpu = self.playerState('0');

         var changeState = Array(256, 128, 64, 32, 16 ,8 ,4 , 2, 1);

        for (var i = 0; i < 9; i++) {
            if (self.game[i] == null) {
                if( self.checkWin(stateCpu ^ changeState[i]) ){
                    self.turn(i);
                    return;
                }
            }
        }

        for (var i = 0; i < 9; i++) {
            if (self.game[i] == null) {
                if( self.checkWin(stateYou ^ changeState[i]) ){
                    self.turn(i);
                    return;
                }
            }
        }

        for (var i = 0; i < 9; i++) {
            if (self.game[i] == null) {
                self.turn(i);
                return;
            }
        }
    }

    self.turn = function (num) {
        if (this.game[num] == null) {

            self.game[num] = self.curTurn;

            if (!self.checkWin(self.playerState(self.curTurn))) {
                 self.curTurn = (self.curTurn == '0' ? 'X' : '0');
            }
            else {
                self.gameOver(self.curTurn);
                return true;
            }

            if (self.noEmptyCell()) {
                self.gameOver('draw');
                return true;
            }
            else{
                if(self.curTurn == '0')
                $timeout(self.cpuTurn, 300);
            }
        }
    };

  }
}

angular.module('ticTacToeApp', ['ngCookies'])
  .directive('game', game)
  .controller('GameCtrl', GameCtrl);
