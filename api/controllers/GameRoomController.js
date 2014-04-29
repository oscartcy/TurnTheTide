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
              var roomid = req.param('roomid');

              if(roomid) {
                  GameRoom.findOne(roomid)
                      .done(function(err, room) {
                          GameRoom.subscribe(req.socket, room);
                          GameRoom.publishUpdate(roomid, {players: "abc"});

                          if(err) {
                              return res.json({ error: err});
                          } else {
                              return res.json('room', room);
                          }
                      });
              } else {
                  return res.json({ error: "no room info received"});
              }},
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to GameRoomController)
     */
    _config: {}


};
