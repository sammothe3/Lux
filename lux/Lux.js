/*
 *   Global vars.
 */
var TWEEN = require('tween.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

/*
 *	HTTP Server.
 */
app.use(express.static(__dirname + '/aura'));
http.listen(process.env.PORT || 8080);
//Tell the admin where we're listening.
console.info("Listening on " + process.env.IP + ":" + process.env.PORT);

//Game Globals
var STATE = {
	EMPTY: -1,
	LOBBY: 0,
	GAME: 1
};
var state = STATE.EMPTY;

var users = {
	players: [],
	spectators: []
};
var maps = require("./maps.json");
var settings = require("./settings.json");

var interval = {};

io.sockets.on('connection', function(socket) {

	//Initilize User.
	var user = addUser();
	console.info("User " + user.colorname + " joined.");
	socket.emit("user", user);


	//Send map data, relevant to what state the game is in.
	if (state == STATE.LOBBY) {

		//Send them all the maps For voting.
		socket.emit("maps", maps);

	}
	else {

		//Get the map in play right NAOW
		socket.emit("map", maps.currentmap);
		socket.emit("ships", maps.currentmap);

	}

	socket.on("vote", function(data) {

		if (state == STATE.LOBBY) {

			//Count the vote
			maps.maps[data].votes += 1;
			io.sockets.emit("voteregistered", {
				"map": data,
				"num": maps.maps[data].votes
			});


		}

	});

	socket.on("unvote", function(data) {

		if (state == STATE.LOBBY) {

			//Uncount the vote
			maps.maps[data].votes -= 1;
			io.sockets.emit("voteregistered", {
				"map": data,
				"num": maps.maps[data].votes
			});


		}

	});

	socket.on("command", function(data) {

		console.info("User " + user.colorname + " commanded " + data.ships.length + " ships.");
		//Actually command the ships.


	});

	socket.on("disconnect", function() {

		//Safely remove user.
		removeUser(user);
		console.info("User " + user.colorname + " left.");

	});

});

/*
 * 	Tick... Tock.
 */
var tick = function(sendtouser) {

	//See if we're running at the correct speed.
	interval.current = Date.UTC();

	if (interval.current - interval.last < interval.interval) return;

	if (state === STATE.LOBBY) {

		if (interval.time === undefined) {

			if (users.players.length >= settings.min_players) {

				interval.time = 30;

				io.sockets.emit('countdown', {
					time: interval.time
				});

			}
			else {

				interval.time = undefined;

				io.sockets.emit('countdown', {
					time: "Not enough players"
				});

			}

		}
		else {

			if (users.players.length >= settings.min_players) {

				interval.time -= 1;

				io.sockets.emit('countdown', {
					time: interval.time
				});

				if (interval.time === 0) {

					state = STATE.GAME;

					var votes = [];

					for (var i = 0; i < maps.maps.length; i++) {

						votes.push(maps.maps[i].votes);

					}

					io.sockets.emit('countdown', {
						time: ""
					});

					maps.currentmap = JSON.parse(JSON.stringify(maps.maps[votes.maxIndex()]));
					maps.currentmap.shipgroups = [];
					maps.currentmap.ships = [];

					io.sockets.emit('gamestart', {
						"map": maps.currentmap.map,
						"colors": maps.currentmap.colors,
						"path": maps.currentmap.path
					});

					setTimeout(tick, 100);
					interval.interval = 100;

					return;

				}

			}
			else {

				interval.time = undefined;

				io.sockets.emit('countdown', {
					time: "Not enough players"
				});

			}

		}

		setTimeout(tick, 1000);
		interval.interval = 1000;

	}

	else if (state === STATE.GAME) {

		//Collision detection! Yay.
		var groups = maps.currentmap.shipgroups;

		//Store b/c of modifying array length in loop.
		var numGroups = groups.length;

		for (var i = 0; i < numGroups; i++) {

			for (var j = 0; j < groups.length; j++) {

				//Check distance between groups
				if (distanceToSquared(groups[0].loc, groups[j].loc) <= radiusSquared(groups[0].loc) + radiusSquared(groups[j]).loc) {

					var nearStar = false;

					if (groups[0].orbiting || groups[j].orbiting) {

						nearStar = true;

					}

					var enemyGroups = false;

					if (notSameTeam(groups[0], groups[j])) {

						enemyGroups = true;

					}

					if (enemyGroups || nearStar) {

						//Individual ship math
						var OGships = groups[0];
						var NEships = groups[j];

						var numShips = OGships.length;
						for (var h = 0; h < numShips; h++) {

							for (var f = 0; f < NEships.length; f++) {

								if (distanceToSquared(OGships.ships[0], NEships.ships[f]) < 0.3 && enemyGroups) {

									//Destroy ships.
									maps.currentmap.shipgroups[i].ships.removeById(OGships[0].AURAid);
									maps.currentmap.shipgroups[j].ships.removeById(NEships[f].AURAid);

									maps.currentmap.ships.removeById(OGships[0].AURAid);
									maps.currentmap.ships.removeById(NEships[f].AURAid);

									io.sockets.emit("shipsdestroyed", {
										ids: [OGships[0].AURAid, NEships[f].AURAid]
									});

								}

							}

							if (nearStar) {

								//Calc distance to star - include health.
								if (distanceToSquared(OGships.ships[0], maps.currentmap.map.getById(OGships.orbitingID)) < maps.currentmap.map.getById(OGships.orbitingID).level * 15) {

									if (enemyGroups) {

										

									}
									
									else {

										

									}

								}

							}

							OGships.splice(0, 1);

						}

					}

				}

			}

			groups.splice(0, 1);

		}

		//Spawn new ships.
		for (var i = 0; i < maps.currentmap.map; i++) {

			//But only on active stars
			updateStar(i);

			//Check for upgrades on stars


		}

		setTimeout(tick, 100);
		interval.interval = 100;

	}

	else {

		console.log("Tick error: Running while empty.");
		maps.currentmap = undefined;
		interval.interval = -1;

	}

	interval.last = Date.UTC();

};

/*
 *	Util Methods.
 */
var addUser = function() {

	var user = {};

	//If they're the first user, start ticking.
	if (state == STATE.EMPTY) {

		setTimeout(tick, 1000);
		interval.interval = 1000;
		state = STATE.LOBBY;

	}

	if (users.players.length < settings.max_players) {

		users.players.push(user);
		user.playing = true;

	}
	else {

		users.spectators.push(user);
		user.playing = false;
	}

	return user;

};

var removeUser = function(user) {

	if (user.playing) {

		for (var i = 0; i < users.players.length; i++) {

			if (user.position === users.players[i].position) {

				users.players.splice(i, 1);
				if (users.players.length < 1) {

					state = STATE.EMPTY;
					maps.currentmap = undefined;
					interval.interval = -1;

					for (var j = 0; j < maps.maps.length; j++) {

						maps.maps[j].votes = 0;

					}

				}

			}

		}

	}
	else {

		for (var i = 0; i < users.players.length; i++) {

			if (user.position === users.spectators[i].position) {

				users.spectators.splice(i, 1);

			}

		}

	}

};

var distanceToSquared = function(a, b) {

	var dx = a.x - b.x;
	var dy = a.y - b.y;
	var dz = a.z - b.z;

	return dx * dx + dy * dy + dz * dz;

};

var radiusSquared = function(obj) {

	if (obj.level === undefined) {
		return obj.radius * obj.radius;
	}
	else {
		return obj.level * 5 * obj.level * 5;
	}

};

var notSameTeam = function(g1, g2) {

	if (g1.colorname === g2.colorname) return false;

	return true;

};

var updateStar = function(index) {

	if (maps.currentmap.map[index].level < 4) {

		//Spawn new ships.

	}

};

/*
 *   Prototype Methods.
 */
Array.prototype.containsById = function(needle) {

	for (var i in this) {

		if (this[i].AURAid == needle) return true;

	}

	return false;

};

Array.prototype.getById = function(needle) {

	for (var i in this) {

		if (this[i].AURAid == needle) return this[i];

	}

	return false;

};

Array.prototype.removeById = function(needle) {

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