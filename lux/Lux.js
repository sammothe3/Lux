/*
*   Global vars.
*/
var fs = require('fs');
var TWEEN = require('tween.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

/*
*	HTTP Server.
*/
app.use( express.static(__dirname + '/aura'));
http.listen(process.env.PORT || 8080);
//Tell the admin where we're listening.
console.info("Listening on " + process.env.IP + ":" + process.env.PORT);

//Game Globals
var STATE = { EMPTY : -1, LOBBY : 0, GAME : 1 };
var state = STATE.EMPTY;

var users = [];
var maps = require("./maps.json");

var interval = {};

io.sockets.on('connection', function(socket) {

    //Initilize User.
    var user = addUser();
    console.info("User " + user.colorname + " joined.");
    socket.emit("welcome", state);
    socket.emit("user", user);
    
    
    //Send map data, relevant to what state the game is in.
    if (state == STATE.LOBBY) {
    	
    	//Send them all the maps For voting.
    	socket.emit("maps", maps);
    	
    } else {
    	
    	//Get the map in play right NAOW
    	
    	//Send it to them
    	
    }
    
    socket.on("vote", function(date){
    
    	if (state == STATE.LOBBY) {
    		
    		//Count the vote
    		
    	} else {
    		
    		//Send an error.
    		
    	}
    	
    });
    
    socket.on("command", function(data){
    
    	console.info("User " + user.colorname + " commanded " + data.ships.length + " ships.");
    	//Actually command the ships.
    	
    	
    });
    
    socket.on("disconnect", function(){
    	
    	//Safely remove user.
    	removeUser(user);
    	console.info("User " + user.colorname + " left.");
    	
    });
    
});

/*
* 	Tick... Tock.
*/
var tick = function(sendtouser) {
	
	//Collision detection! Yay.
	
		//Check distance between objects. (Ship groups and stars)
		
		//Individual ship math
	
	//Spawn new ships.
	
		//But only on active stars
	
	//Upgrade stars.
	
	
};

/*
*	Util Methods.
*/
var addUser = function() { 
	
	var user = {};
	
	//If they're the first user, start ticking.
	if(state == STATE.EMPTY) {
		
		interval.tick = setInterval(tick, 100);
	
		
		
	}
	
	return user;
	
};

var removeUser = function() {
	
	
	
};

/*
*   Prototype Methods.
*/
Array.prototype.containsById = function ( needle ) {

	for (var i in this) {

		if (this[i].AURAid == needle) return true;
	
	}

	return false;

};

Array.prototype.getById = function ( needle ) {

	for (var i in this) {

		if(this[i].AURAid == needle) return this[i];

	}

	return false;

};

Array.prototype.removeById = function ( needle ) {

	for (var i in this) {

		if (this[i].AURAid == needle) {

			this.splice(i, 1);

			return true;
		
		}

	}

	return false;	

};

Array.prototype.clone = function() {
	
	return this.slice(0);
	
};