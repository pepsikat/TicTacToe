angular = require('angular')
ngCookies = require('angular-cookies')

require '../style/clear.less'
require '../style/app.less'



angular.module('ticTacToeApp', ['ngCookies'])
.directive('game', ->
  {
    template: require('./app.html')
    controller: 'GameCtrl'
    controllerAs: 'game'
  }
)
.controller 'GameCtrl', ($timeout, $cookies) ->
  self = @
  self.scoreYou = if isNaN($cookies.get('scoreYou')) then 0 else $cookies.get('scoreYou')
  self.scoreCpu = if isNaN($cookies.get('scoreCpu')) then 0 else $cookies.get('scoreCpu')
  self.appState = 'start'
  self.gameOverText = ''

  self.changeAppState = (state) ->
    self.appState = state
    return

  self.newGame = ->
    self.curTurn = 'X'
    self.appState = 'play'
    self.game = [null, null, null, null, null, null, null, null, null];
    return

  self.playerState = (player) ->
    playerArray = []
    self.game.forEach (item) ->
      if item == player
        playerArray.push 1
      else
        playerArray.push 0
      return
    parseInt playerArray.join(''), 2

  self.checkWin = (playerState) ->
    winArr = [292, 146, 73, 448, 56, 7, 273, 84]
    isWin = false
    winArr.forEach (winState) ->
      isWin = true if (winState & playerState) == winState
      return
    isWin

  self.gameOver = (winner) ->
    if winner == 'X'
      self.scoreYou++
      $cookies.put 'scoreYou', self.scoreYou
      self.gameOverText = 'You win!'
    else if winner == '0'
      self.scoreCpu++
      $cookies.put 'scoreCpu', self.scoreCpu
      self.gameOverText = 'CPU win!'
    else if winner == 'draw'
      self.gameOverText = 'Draw'
    $timeout (->
      self.changeAppState 'finish'
      return
    ), 1000
    false

  self.noEmptyCell = ->
    self.game.indexOf(null) < 0

  self.cpuTurn = ->
    stateYou = self.playerState('X')
    stateCpu = self.playerState('0')
    changeState = Array(256, 128, 64, 32, 16, 8, 4, 2, 1)
    i = 0
    while i < 9
      if self.game[i] == null
        if self.checkWin(stateCpu ^ changeState[i])
          self.turn i
          return
      i++
    i = 0
    while i < 9
      if self.game[i] == null
        if self.checkWin(stateYou ^ changeState[i])
          self.turn i
          return
      i++
    i = 0
    while i < 9
      if self.game[i] == null
        self.turn i
        return
      i++
    return

  self.turn = (num) ->
    if @game[num] == null
      self.game[num] = self.curTurn
      if !self.checkWin(self.playerState(self.curTurn))
        self.curTurn = if self.curTurn == '0' then 'X' else '0'
      else
        self.gameOver self.curTurn
        return true
      if self.noEmptyCell()
        self.gameOver 'draw'
        return true
      else
        if self.curTurn == '0'
          $timeout self.cpuTurn, 300
    return
  return
