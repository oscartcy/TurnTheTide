/**
 * GameRoomController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

 module.exports = {

 	create: function(req, res) {
 		var size = req.param('size');

 		if(!size)
 			return res.json({ error: 'Room size missing' });

 		//console.log("In GameRoom create");
 		GameRoom.create({
 			players: "[]",
 			size: size
 		}).done(function(err, room) {
 			if(err)
 				return res.json({ error: err});

 			GameRoom.publishCreate({
 				id: room.id,
 				room: room
 			});

 			var sockets = GameRoom.subscribers(room.id);

 			for(var i in sockets) {
 				var socket = sockets[i];
 				GameRoom.unsubscribe(socket, [{ id: room.id}]);
 			}
 			
 			return res.json(room);
 		});
 	},

 	index: function(req, res) {
 		//console.log("In GameRoom index");
 		GameRoom.subscribe(req.socket);
 		GameRoom.find()
 		.done(function(err, rooms) {
 			res.json('rooms', rooms);
 		});
 	},

 	join: function(req, res) {
 		var roomid = req.param('id');
 		var playerId = req.param('playerId');

 		if(! (roomid && playerId))
 			return res.json({ error: "no room info received"});

 		GameRoom.findOne(roomid).done(findRoomCallback);

 		function findRoomCallback(err, room) {
 			if(err)
 				return res.json({ error: err});

 			var players = JSON.parse(room.players);

 			if(players.indexOf(playerId) != -1)
 				return res.json({ error: 'already in room'});

 			if(players.length >= room.size)
 				return res.json({ error: 'room is full'});

			//update room player list
			players.push(playerId);
			room.players = JSON.stringify(players);

			room.save(function(err) {
				if(err) {
					//console.log(err);
					return res.json({ error: err});
				}

				GameRoom.subscribe(req.socket, room);
				GameRoom.publishUpdate(roomid, { room: room });

				if(players.length == room.size)
					fireReadyToStart(room);

				return res.json('room', room);
			});
		}

		function fireReadyToStart(room) {
			// GameRoom.publish(req, [{ id: room.id }], { status: 'ready' });

			var sockets = GameRoom.subscribers(room.id);

			for(var i in sockets) {
				var socket = sockets[i];
				var players = JSON.parse(room.players);

				socket.emit('gameRoom', { status: 'ready', roomMaster: players[0] });
			}
		}
	},

	leave: function(req, res) {
		var roomid = req.param('id');
		var playerId = req.param('playerId');

		if(!(roomid && playerId))
			return res.json({ error: "no room info received"});

		GameRoom.findOne(roomid).done(findRoomCallback);

		function findRoomCallback(err, room) {
			if(err)
				return res.json({ error: err });

			var players = JSON.parse(room.players);

			var index = players.indexOf(playerId);
			if(index == -1)
				return res.json({ error: 'not in room'});

			players.splice( index, 1 );
			room.players = JSON.stringify(players);

			room.save(function(err) {
				if(err) {
					//console.log(err);
					return res.json({ error: err});
				}

				GameRoom.unsubscribe(req.socket, room);
				GameRoom.publishUpdate(roomid, { room: room});

				return res.json('room', room); 							
			});
		}
	},

	start: function(req, res) {
		var roomid = req.param('id');

		if(!roomid)
			return res.json({ error: "no room info received"});

		GameRoom.findOne(roomid)
		.done(function(err, room) {
			if(err)
				return res.json({ error: err });

			var players = JSON.parse(room.players);

			if(players.length != room.size)
				return res.json({ error: 'room not full yet' });

			var sockets = GameRoom.subscribers(room.id);

			for(var i in sockets) {
				var socket = sockets[i];

				socket.emit('gameRoom', { status: 'start', room: room });
			}
		});
	},

	destroy: function(req, res) {
		var roomid = req.param('id');

		if(!roomid)
			return res.json({ error: "no room info received"});

		GameRoom.findOne(roomid)
		.done(function(err, room) {
			if(err)
				return res.json({ error: err });

			if(!room)
				return res.json({ error: 'room not found'});

			room.destroy(function(err) {
				if(err)
					return res.json({ error: err});

				// GameRoom.publishDestroy(room.id);
	 			var sockets = GameRoom.subscribers();

	 			for(var i in sockets) {
	 				var socket = sockets[i];
	 				socket.emit('message', { model: 'gameroom', verb: 'destroy', id: room.id});
	 			}

			});

			// var sockets = GameRoom.subscribers(room.id);

			// for(var i in sockets) {
			// 	var socket = sockets[i];

			// 	socket.emit('gameRoom', { status: 'start', room: room });
			// }
		});
	},
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to GameRoomController)
     */
     _config: {}


 };
