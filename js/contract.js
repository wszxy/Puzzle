"use strict";

var User = function(text){
  if(text){
    var o = JSON.parse(text);
    this.name = o.name;
    this.address = o.address;
    this.maxScore = o.maxScore;//min steps
    this.gameCounter = o.gameCounter;
  }
  else{
    this.name = "";
    this.address = "";
    this.maxScore = -1;
    this.gameCounter = 0;   
  }
};

User.prototype = {
 toString: function () {
  return JSON.stringify(this);
 }
};

var Game = function(text){
  if(text){
    var o = JSON.parse(text);
    this.user = o.user;//addr
    this.step = o.step;
  }
  else{
    this.user = "";
    this.step = -1;//not complete
  }
};

Game.prototype = {
 toString: function () {
  return JSON.stringify(this);
 }
};

var GameContract = function () {
 LocalContractStorage.defineMapProperty(this, "userVault", {
  parse: function (text) {
   return new User(text);
  },
  stringify: function (o) {
   return o.toString();
  }
 });
  LocalContractStorage.defineProperty(this, "gameCounter");
  LocalContractStorage.defineMapProperty(this, "gameVault",{
   parse: function (text) {
    return new Game(text);
   },
   stringify: function (o) {
    return o.toString();
   }
  });
};

GameContract.prototype = {
  init: function () {
     this.gameCounter = 0;
   },
   /*game:function (aArr){
     var iLength = aArr.length,
     i = iLength;
     var mTemp;
     var iRandom;
 
     while(i--){
         if(i !== (iRandom = parseInt(Math.random() * iLength))){
             mTemp = aArr[i];
             aArr[i] = aArr[iRandom];
             aArr[iRandom] = mTemp;
         }
     }
 
     return aArr;
   },*/
   start:function createArr(n){
    var i = parseInt(n);
    var arr = new Array();

    i = i*i;
    while(i>0){
        arr[i-1] = i;
        i--;
    }
    for(var j = 0;j < arr.length; j++){
      var rand = parseInt(Math.random()*arr.length);
      var t = arr[rand];
      arr[rand] =arr[j];
      arr[j] = t;
    }
    return arr;
   },
   register:function(name){
     var from = Blockchain.transaction.from;
     var user = new User();
     user.name = name;
     user.address = from;
     this.userVault.put(from,user);
   },
   saveData:function(step){//after game over,user this method to save and update some info
     var from = Blockchain.transaction.from;
     var maxScore = parseInt(step);
     var user = this.userVault.get(from);
     if(maxScore < user.maxScore||user.maxScore == -1){
       user.maxScore = maxScore;
     }
     user.gameCounter += 1;
     this.userVault.put(from,user);

     var game = new Game();
     game.user = from;
     game.step = maxScore;
     this.gameVault.put(this.gameCounter,game);
     this.gameCounter += 1;
   },
   getRankOfAllUsers:function(){
     var gameArray = new Array();
     for(var i=0;i<this.gameCounter;i++){
       var game = this.gameVault.get(i);
       gameArray.push(game);
     }
     gameArray = this.sort1(gameArray);
     if(this.gameCounter<=5){
       return gameArray;
     }else {
       gameArray.splice(5,gameArray.length-5);
       return gameArray;
     }
   },
   getRankOfUser:function(){
     var from = Blockchain.transaction.from;
     var user = this.userVault.get(from);
     var gameArray = new Array();
     for(var i=0;i<this.gameCounter;i++){
       var game = this.gameVault.get(i);
       if(game.user==from){
         gameArray.push(game);
       }
     }
     gameArray = this.sort1(gameArray);
     if(user.gameCounter<=5){
       return gameArray;
     }else {
       gameArray.splice(5,gameArray.length-5);
       return gameArray;
     }
   },
   sort1:function(arr){
     var array = new Array();
     var resultArray = new Array();
     for(var i = 0;i<arr.length;i++){
       var game = arr[i];
       array.push(game.step);
     }
     array.sort();
     for(var j=0;j<arr.length;j++){
       for(var k=0;k<array.length;k++){
         var game = arr[k];
         if(game.step==array[j]){
           resultArray.push(game);
           break;
         }
       }
     }
     return resultArray;
   },
   userOf:function(){
     var from = Blockchain.transaction.from;
     var user = this.userVault.get(from);
     return user;
   },
   gameOf:function(n){
     return this.gameVault.get(parseInt(n));
   }
};

module.exports = GameContract;