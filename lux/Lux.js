/*
*   Global vars.
*/
var TWEEN = require('tween.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
io.set('log level', 1); // reduce logging

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

var users = {players:[], spectators:[]};
var maps = require("./maps.json");
var settings = require("./settings.json");

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
    
    socket.on("vote", function(data){
    
    	if (state == STATE.LOBBY) {
    		
    		//Count the vote
    		maps.maps[data].votes += 1;
    		io.sockets.emit("voteregistered", {"map":data, "num":maps.maps[data].votes});
    		
    		
    	} 
    	
    });
    
    socket.on("unvote", function(data) {
       
       if (state == STATE.LOBBY) {
    		
    		//Uncount the vote
    		maps.maps[data].votes -= 1;
    		io.sockets.emit("voteregistered", {"map":data, "num":maps.maps[data].votes});
    		
    		
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

	if ( state === STATE.LOBBY) {
		
		if(interval.time === undefined) {
				
			if(users.players.length >= settings.min_players) {
				
				interval.time = 30;
				
				io.sockets.emit('countdown', {time:interval.time});
				
			} else {
				
				interval.time = undefined;
				
				io.sockets.emit('countdown', {time:"Not enough players"});
				
			}
			
		} else {
			
			if(users.players.length >= settings.min_players) {
				
				interval.time -= 1;
				
				io.sockets.emit('countdown', {time:interval.time});
				
				if(interval.time === 0) {
					
					clearInterval(interval.tick);
					
					state = STATE.GAME;
					
					var votes = [];
					
					for(var i = 0; i < maps.maps.length; i++) {
						
						votes.push(maps.maps[i].votes);	
						
					}
					
					io.sockets.emit('gamestart', {"map" : votes.maxIndex()});
					
					maps.currentmap = JSON.parse(JSON.stringify(maps.maps[votes.maxIndex()]));
					
					interval.tick = setInterval(tick, 100);
					
				}
				
			} else {
				
				interval.time = undefined;
				
				io.sockets.emit('countdown', {time:"Not enough players"});
				
			}
			
		}
		
	} else {
		
		//Collision detection! Yay.
	
			//Check distance between objects. (Ship groups and stars)
		
			//Individual ship math
	
		//Spawn new ships.
	
			//But only on active stars
	
		//Upgrade star
		
	}
	
};

/*
*	Util Methods.
*/
var addUser = function() { 
	
	var user = {};
	
	//If they're the first user, start ticking.
	if(state == STATE.EMPTY) {
		
		interval.tick = setInterval(tick, 1000);
	
		state = STATE.LOBBY;
		
	}
	
	if(users.players.length < settings.max_players) {
		
		users.players.push(user);
		user.playing = true;
		
	} else {
		
		users.spectators.push(user);
		user.playing = false;
	}
	
	return user;
	
};

var removeUser = function(user) {
	
	if(user.playing) {
		
		for( var i=0; i<users.players.length; i++) {

			if (user.position === users.players[i].position) {
		
				users.players.splice(i, 1);
				if ( users.players.length < 1 ) {
					
					state = STATE.EMPTY;
					clearInterval(interval.tick);
					clearInterval(interval.tween);
					
					for(var j = 0; j < maps.maps.length; j++) {
						
						maps.maps[j].votes = 0;
						
					}
					
				}
		
			}
			
		}
		
	} else {
		
		for( var i=0; i<users.players.length; i++) {
		
			if(user.position === users.spectators[i].position) {
				
				users.spectators.splice(i, 1);
				
			}
			
		}
		
	}
	
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

Array.prototype.maxIndex = function() {
	
    var max = this[0];
	var maxIndex = 0;

	for (var i = 1; i < this.length; i++) {
    	if (this[i] > max) {
    		maxIndex = i;
        	max = this[i];
    	}
	}
	
	return maxIndex;
};