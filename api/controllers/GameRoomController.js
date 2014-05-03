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
 		console.log("In GameRoom create");
 		GameRoom.create({
 			players: "[]"
 		}).done(function(err, room) {
 			GameRoom.publishCreate({
 				id: room.id,
 				players: room.players
 			});

 			if(err){
 				return res.json(err);
 			}
 			else {
 				return res.json(room);
                        //return res.view({rooms: room});
                    }
                });
 	},

 	index: function(req, res) {
 		console.log("In GameRoom index");
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

			//update room player list
			var players = JSON.parse(room.players);

			if(players.indexOf(playerId) != -1)
				return res.json({ error: 'already in room'});

			players.push(playerId);
			room.players = JSON.stringify(players);

			room.save(function(err) {
				if(err) {
					console.log(err);
					return res.json({ error: err});
				}
				
				GameRoom.subscribe(req.socket, room);
				GameRoom.publishUpdate(roomid, { room: room });

				return res.json('room', room);
			});
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
 					console.log(err);
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

 		if(roomid) {
 			GameRoom.findOne(roomid)
 			.done(function(err, room) {
 				if(err) {
 					return res.json({ error: err });
 				} else {

 				}
 			});
 		} else {
 			return res.json({ error: "no room info received"});
 		}
 	},
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to GameRoomController)
     */
     _config: {}


 };
