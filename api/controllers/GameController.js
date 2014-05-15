/**
 * GameController
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

//
module.exports = {
	create: function(req, res) {                                                                        
				var roomid = req.param('roomid');
				GameRoom.findOne(roomid).done(function (err, room) {
					var number=room.size;
					
					var playername=JSON.parse(room.players);
					var playerJSON=generatePlayerInfo(playername);
		
				
					
					
					var curTides=new Array();
					var remTides=new Array();
					var roundcards=new Array(number);
					for (var i=0;i<number;i++)
					{
						roundcards[i]=0;
					}
					generateTides(curTides,remTides);
					
					Game.create({
						playerNumber:number,
						round:1,
						cycle:1,
						players:playerJSON,
						currentTides:curTides,
						remainingTides:remTides,
						alive:number,
						numOfReady:0,
						roundCards:roundcards,
						playerPos:playername,
						gameRoomId:roomid
					}).done(function(err, game) {  
						for (var i=0;i<playername.length;i++) {
							User.findOneByFbid(playername[i]).done(function(err, user) {
								if(err)
									console.log('disconnect find user error: ', err);

								user.status = 'inGame';
								
								user.save(function(err) {
									if(err)
										console.log(err);

									//emit logout message to your friends
									var sockets = GameRoom.subscribers();
									for(var i in sockets) {
										//		console.log(user.fbid+" has logged out");
										var temp_socket = sockets[i];
										temp_socket.emit('user_logout', {});
									}
								});
							});
						}

						var sockets = GameRoom.subscribers(room.id);
						console.log(game);
						console.log(game.id);					
						GameRoom.findOne(roomid).done(findRoomCallback);
						
						function findRoomCallback(err, room) {
							room.gameid=game.id;
							room.save(function(err) {
									if(err) {
										console.log(err);
							}});													
						};
						
						
						for(var i in sockets) {
							var socket = sockets[i];

							socket.emit('game', { status: 'gameCreated', game: game });
						}				  
					}); 
				});
            },			
	playhand:function(req,res){
			var roomid = req.param('id');
			var playerId = req.param('playerId');
			var card=req.param('card');
			card=parseInt(card);
			var thisPlayer;
			
			if(! (roomid && playerId))
				return res.json({ error: "no room info received"});

			Game.findOne(roomid).done(findRoomCallback);
			function findRoomCallback(err, room) {
				if(err)
					return res.json({ error: err});
					
				room.numOfReady=room.numOfReady+1;
				for (var i=0;i<room.playerNumber;i++)
				{
					if (room.playerPos[i]==playerId)
						room.roundCards[i]=card;
				}
				room.save(function(err) {
						if(err) {
							console.log(err);
							return res.json({ error: err});
				}});
				var channel=room.gameRoomId;					
				var sockets = GameRoom.subscribers(channel);
				for(var i in sockets) {
					var socket = sockets[i];
					socket.emit('game', { status: 'handReady', playerId: playerId });
				}
				console.log(room.alive);
				console.log(room.roundCards);
				console.log(room.numOfReady);
				
				// or time out?
				//checkIfAllPplhandedIn
				if (room.numOfReady==room.alive)
				{
	
					var endCycFlag=false;
					result=computeRound(room);
					room.numOfReady=0;
					for (var i=0;i<room.playerNumber;i++)
					{
						room.roundCards[i]=-1;
					}
					room.save(function(err) {
							if(err) {
								console.log(err);
								return res.json({ error: err});
					}});
					//checkIfEndCycle
					endCycFlag=checkEndCycle(room);
					
					var channel=room.gameRoomId;					
					var sockets = GameRoom.subscribers(channel);
					for(var i in sockets) {
						var socket = sockets[i];
						socket.emit('game', { status: 'endRound', round: result ,endCycle:endCycFlag});
					}
					
					if (endCycFlag)
					{
						room.cycle=room.cycle+1;
						console.log(room.cycle);
					}
					if (endCycFlag && room.cycle!=room.playerNumber+1)
					{

						console.log(room.cycle);
						console.log(room.playerNumber);
						extraresult=setNextCycle(room);
						room.save(function(err) {
							if(err) {
								console.log(err);
								return res.json({ error: err});
							}});
							

						setTimeout(callback, 9000);
						
						function callback()
						{

							var channel=room.gameRoomId;
							console.log(room);
							var sockets = GameRoom.subscribers(channel);
							for(var i in sockets) {
								var socket = sockets[i];
								socket.emit('game', { status: 'endCycle', cycle:extraresult});
							}	
						}						
					}
					else if (endCycFlag && room.cycle==room.playerNumber +1)
					{
						console.log("hey");
						console.log(room.cycle);
						console.log(room.playerNumber);
						result=endGame(room);
						//destroy room and
						//no need to save
						//save result to user record
					
						setTimeout(callbackDick, 9000);	

						for (var i=0;i<room.playerPos.length;i++) {
							User.findOneByFbid(room.playerPos[i]).done(updateUser());

							function updateUser() {
								var cnt = i;

								return (function(err, user) {
									if(err)
										console.log('disconnect find user error: ', err);

									user.status = 'online';
									user.score += result[cnt].mark;

									user.save(function(err) {
										if(err)
											console.log(err);

										//emit logout message to your friends
										var sockets = GameRoom.subscribers();
										for(var i in sockets) {
										//	console.log(user.fbid+" has logged out");
										var temp_socket = sockets[i];
										temp_socket.emit('user_logout', {});
									}
								});
								});
							}
						}

						GameRoom.findOne(room.gameRoomId).done(destroyRoom);
						
						room.destroy(function(err) {
									if(err) {
										console.log(err);
							}});	
						
	
						
						function destroyRoom(err,gameroom)
						{
							gameroom.destroy(function(err) {
								if(err) 
									console.log(err);
										
								var sockets = GameRoom.subscribers();

								for(var i in sockets) {
									var socket = sockets[i];
									socket.emit('message', { model: 'gameroom', verb: 'destroy', id: room.id});
								}		
							});
					
						}
						
							
						
						function callbackDick()
						{
							var channel=room.gameRoomId;
							console.log(result);
							var sockets = GameRoom.subscribers(channel);
							for(var i in sockets) {
								var socket = sockets[i];
								socket.emit('game',  { status: 'endGame', gameResult:result});
							}	
						}		
						
					}
				}
				
				// var players=JSON.parse(room.players);
				//need to push cards in correct sequence
				// for (var i=0;i<players.length;i++)
				// {
					// if (players[i].RemainingLife!=-1)
					// {
						// if (players[i].Name==playerId)
						// {
							// thisPlayer=players[i];
							// if (!validateHand(thisPlayer,card))
							// {
									// otherCards.push(randomCard(thisPlayer));
							// }
							// else
							// {
								// otherCards.push(card);
							// }
						// }
						// else
							// otherCards.push(randomCard(players[i]));
					// }
					// else
					// {
						// otherCards.push(-1);
					// }
				// }
				
				
				//one hand out ends
				
				//when all hand in cards
				// var result;
				// var extraresult;
				// result=computeRound(otherCards,room);
				//check END CYCLE
				// if (!checkEndCycle(room))
				// {		
					// room.save(function(err) {
						// if(err) {
							// console.log(err);
							// return res.json({ error: err});
						// }});
					
					 // return res.json({round:result});
				 // }
				 // else
				 // {
					// console.log("here");
					// extraresult=setNextCycle(room);
					// room.save(function(err) {
						// if(err) {
							// console.log(err);
							// return res.json({ error: err});
						// }});
					// return res.json({cycle:extraresult,round:result})
				 // }
				
			
			}
		},
	continueGame:function(req,res){
		var roomid = req.param('rmID');
		var flag=req.param('continueFlag');
		var channel=req.param('gmRM');	
		Game.findOne(roomid).done(findRoomCallback);
		function findRoomCallback(err, room) {
			if (flag)
			{				
				var sockets = GameRoom.subscribers(channel);
				for(var i in sockets) {
					var socket = sockets[i];
					socket.emit('game', { status: 'continue' });
				}				
			}
			else
			{
				//destroy room
				//save result to user model
				var players=JSON.parse(room.players);
				
				GameRoom.findOne(room.gameRoomId).done(destroyRoom);
				var channel=room.gameRoomId;
				room.destroy(function(err) {
							if(err) {
								console.log(err);
					}});	
				for (var i=0;i<room.playerPos.length;i++) {
					User.findOneByFbid(room.playerPos[i]).done(updateUser());

					function updateUser() {
						var cnt = i;

						return (function(err, user) {
							if(err)
								console.log('disconnect find user error: ', err);

							user.status = 'online';
							user.score += players[cnt].Mark;

							user.save(function(err) {
								if(err)
									console.log(err);

										//emit logout message to your friends
										var sockets = GameRoom.subscribers();
										for(var i in sockets) {
										//	console.log(user.fbid+" has logged out");
										var temp_socket = sockets[i];
										temp_socket.emit('user_logout', {});
									}
								});
						});
					}
				}
				
				function destroyRoom(err,gameroom)
				{
					gameroom.destroy(function(err) {
						if(err) 
							console.log(err);
								
						var sockets = GameRoom.subscribers();

						for(var i in sockets) {
							var socket = sockets[i];
							socket.emit('message', { model: 'gameroom', verb: 'destroy', id: room.id});
						}		
					});
				}

				var sockets = GameRoom.subscribers(channel);
				for(var i in sockets) {
					var socket = sockets[i];
					socket.emit('game', { status: 'endEarly' });
				}					
			}
		}
	},
	spectate:function(req,res){
		var room=req.param('id');
		
		Game.findOne(room).done(findRoomCallback);
		function findRoomCallback(err,room){
			var info=spectateinfo(room);
			console.log(info);
			return res.json({info:info});
		}
	},
   _config: {}


};

function generateTides(curTides,remTides)
{
	if (remTides.length==0)
	{
		for (var i=1;i<=12;i++)
		{
			remTides.push(i);
			remTides.push(i);
		}
	}

	for (var i=0;i<2;i++)
	{
		var ran=Math.floor(Math.random()*remTides.length);
		curTides.push(remTides[ran]);
		remTides.splice(ran,1);
	}
	
	curTides.sort(function compareNumbers(a, b) {
		return a - b;
	});
	console.log(curTides);
}

function generatePlayerInfo(playername)
{
	var players=new Array();
	var deck=genDeck();
	for (var i=0;i<playername.length;i++)
	{
		var hand=deck.slice(i*12,i*12+12);
		var life=computeLife(hand);
		var person = {No:(i+1),Name:playername[i], 
					  Tide:0, Mark:0,
					  Hands:hand,RemainingHands:hand,
					  Life:life,RemainingLife:life};
		players.push(person);
	}
	return JSON.stringify(players);
}


function genDeck()
{
	var deck=new Array();
	var newdeck;
	for (var i=1;i<=60;i++)
	{
		deck.push(i);
	}
	newdeck = shuffle(deck);
	return newdeck;
	
}

function computeLife(hand)
{
	var life=0;
	for(var i=0;i<12;i++)
	{
		if ((hand[i]>=13 && hand[i]<=24) || (hand[i]>=37 && hand[i]<=48))
			life=life+0.5;
		else if (hand[i]>=25 && hand[i]<=36)
			life++;
	}
	return Math.floor(life);
}

function validateHand(thisPlayer,card)
{
	for (var i=0;i<thisPlayer.RemainingHands.length;i++)
	{
		if (thisPlayer.RemainingHands[i]==card)
		{
		//	thisPlayer.Remaininghand.splice(i,1);
			return true;
		}
	}
	return false;
}

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


function randomCard(otherPlayer)
{
	var ran=Math.floor(Math.random()*otherPlayer.RemainingHands.length);
	return otherPlayer.RemainingHands[ran];
//	return otherPlayer.Remaininghand.splice(ran,1);
}


function checkEndCycle(room)
{
//ori=13
	if (room.round==13 || room.alive<=2)
	{
		return true;
	}
	else
		return false;
}


function spectateinfo(room)
{
console.log(room);
	console.log(room.players);
	console.log(room.currentTides);
	var players=JSON.parse(room.players);
	var info={
		player:[],
		cycle:room.cycle,
		mark:[],
		life:[],
		fieldtide:[],
		round:room.round,
		ready:[],
		remLife:[],
		tide:[]
	}

	console.log(room);
	info.fieldtide=room.currentTides;	
	for (var i=0;i<players.length;i++)
	{
		info.player.push(players[i].Name);
		info.tide.push(players[i].Tide);
		info.remLife.push(players[i].RemainingLife);
		info.life.push(players[i].Life);
		info.mark.push(players[i].Mark);
	}
	for (var i=0;i<players.length;i++)
	{
		console.log("here");
		console.log(room.roundCards[i]);
		if (room.roundCards[i]!=-1 && room.roundCards[i]!=0)
			info.ready.push(true);
		else
			info.ready.push(false);			
	}
	info.keeperHand=players[0].RemainingHands.length;
	
	return info;
}

function setNextCycle(room)
{

	var players=JSON.parse(room.players);
	var tmphand=players[0].Hands.slice();
	var tmplife=players[0].Life;
	var newCycle={
		player:[],
		cycle:room.cycle,
		mark:[],
		hand:[],
		life:[],
		fieldtide:[]
	}
	room.round=1;
	room.alive=room.playerNumber;
	for (var i=0;i<players.length;i++)
	{
		newCycle.player.push(players[i].Name);
		players[i].Mark=players[i].Mark+players[i].RemainingLife;
		newCycle.mark.push(players[i].Mark);
		if (i!=players.length-1)
		{
			players[i].Hands=players[i+1].Hands;
			players[i].Life=players[i+1].Life;
			players[i].RemainingHands=players[i].Hands;
			players[i].RemainingLife=players[i].Life;
		}
		else
		{
			players[i].Hands=tmphand;
			players[i].Life=tmplife;
			players[i].RemainingLife=players[i].Life;
			players[i].RemainingHands=players[i].Hands;
		}
		newCycle.hand.push(players[i].Hands);
		newCycle.life.push(players[i].Life);
		players[i].Tide=0;
	}
	
	var curTides=new Array();
	var remTides=new Array();
	generateTides(curTides,remTides);
	room.currentTides=curTides;
	room.remainingTides=remTides;
	room.players = JSON.stringify(players);
	
	newCycle.fieldtide=curTides;
	return newCycle;
	
}

function computeRound(room)
{
	var result=new Object();
	result.player=new Array();
	result.playerHand=new Array();
	result.tide=new Array();
	result.remaininglife=new Array();
	result.life=new Array();
	result.fieldtide=new Array();
	
	
	var players=JSON.parse(room.players);
	
	var thisRoundCard=room.roundCards;
	var sorted = thisRoundCard.slice();
	console.log("This Round Card "+thisRoundCard);
	sorted.sort(function compareNumbers(a, b) {
		return b - a;
	});
	room.currentTides.sort(function compareNumbers(a, b) {
		return a - b;
	});
	//distribute tides
	var endthisflag=false;
	var k=0;
	// for (var k=0;k<thisRoundCard.length;k++)
	// {
		for (var i=0;i<players.length;i++)
		{
			if (players[i].RemainingLife!=-1)
			{
				for (var j=0;j<players[i].RemainingHands.length;j++)
				{
					for (var k=0;k<thisRoundCard.length;k++)
					{
						if (players[i].RemainingHands[j]==thisRoundCard[k])
							{								
								result.playerHand.push(thisRoundCard[k]);
								players[i].RemainingHands.splice(j,1);
								if (thisRoundCard[k]==sorted[0])
								{
									players[i].Tide=room.currentTides[0];
									result.transfer1=players[i].Name;
									
								}
								else if (thisRoundCard[k]==sorted[1])
								{
									players[i].Tide=room.currentTides[1];
									result.transfer2=players[i].Name;
								}
								
							}
					}
				}
			}
			else
			{
				result.playerHand.push(-1);
				endthisflag=true;

			}		
		}
	// }
	

	//regen tides
	//room.currentTides=new Array();
	var curTides=new Array();
	if (room.remainingTides.length!=0)
	{
		generateTides(curTides,room.remainingTides);
		room.currentTides=curTides;
	}
	//find Death;

	var pos1=-1;
	var pos2=-1;
	var highest=0;
	for (var i=0;i<players.length;i++)
	{
		if (players[i].Tide>highest && players[i].RemainingLife!=-1)
		{
			highest=players[i].Tide;
			pos1=i;
			pos2=-1;
		}
		else if (players[i].Tide==highest && players[i].RemainingLife!=-1)
		{
			pos2=i;
		}		
	}
	
	players[pos1].RemainingLife=players[pos1].RemainingLife-1;
	result.loselife1=pos1;
	result.loselife2=-1;
	if (players[pos1].RemainingLife<0)
		room.alive=room.alive-1;
	if (pos2!=-1)
	{
			players[pos2].RemainingLife=players[pos2].RemainingLife-1;
			result.loselife2=pos2;
			if (players[pos2].RemainingLife<0)
				room.alive=room.alive-1;
			
	}	
			
	for (var i=0;i<players.length;i++)
	{
		result.player.push(players[i].Name);
		result.tide.push(players[i].Tide);
		result.remaininglife.push(players[i].RemainingLife);
		result.fieldtide=room.currentTides;
		result.life.push(players[i].Life);
	}
			
	room.players = JSON.stringify(players);
	room.round=room.round+1;
	
	result.round=room.round;
	
	console.log(result.player);
	console.log(result.playerHand);
	console.log(result.tide);
	console.log(result.remaininglife);
	console.log(result.fieldtide);
	
	return result;
	
	
}

function endGame(room)
{
	var result={
		player:[],
		mark:[]
	}
	var players=JSON.parse(room.players);
	for (var i=0;i<players.length;i++)
	{
		result.player.push(players[i].Name);
		players[i].Mark=players[i].Mark+players[i].RemainingLife;
		result.mark.push(players[i].Mark);
	}
	room.players = JSON.stringify(players);
	return result;
}

