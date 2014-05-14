//generate player id
var playerId = getRandomInt(1, 100000);
var currentRoomID;
var	gameID;
var spectate=false;
var cyc;

$('#playerName').text(playerId);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
	
//main//
if(socket.socket.connected)
	main();
else 
	socket.on('connect', main);

function main() {
	init();
	refreshGameRoomList();
	searchRm();
	checkIfInvited();
}
//end of main

function init() {
	initSocketListen();
	initCreateRoomButton();
	initMatchButton();
	initLoadingScreen();		
	initContCycleButton();
	
	function initContCycleButton()
	{
		$(".cont").on('click',function(){
				socket.post('/Game/continueGame/' + gameID,
					{ 
						continueFlag:true,
						rmID:gameID,
						gmRM:currentRoomID
					});
		});
		$(".endGame").on('click',function(){
				socket.post('/Game/continueGame/' + gameID,
					{ 
						continueFlag:false,
						rmID:gameID,
						gmRM:currentRoomID
					});
		});
		$(".cs").on('click',function(){
					TukTuk.Modal.hide();
				destoryGame();	
				// socket.post('/Game/continueGame/' + gameID,
					// { 
						// continueFlag:false,
						// rmID:gameID,
						// gmRM:currentRoomID
					// });
		});
	}

	function initSocketListen(){
		socket.on('message', function(res) {
			if(res.model == 'gameroom') {
				if(res.verb == 'create') {
					console.log("some gameroom created", res);

					refreshGameRoomList();
				}
			}

			if(res.model == 'gameroom' && res.verb == 'update') {
				console.log('room message: ', res);

				if(res.data)
					updateRoomInfo(res.data.room);

				//without room info, boardcast update
				refreshGameRoomList();
			}

			if(res.model == 'gameroom' && res.verb == 'destroy') {
				console.log('some gameroom destroy', res);

				refreshGameRoomList();
			}
		});

		socket.on('gameRoom', function(res) {
			console.log('game room status:', res);

			if(res.status == 'ready') {
				gameRoomReady(res.roomMaster);

			}
		});

		//message for in game
		socket.on('game', function(res) {
			console.log('game room status:', res);

			if(res.status == 'gameCreated') {
					 setUpGame(res.game);
			}

			if (res.status=='handReady'){
				setPlayerReady(res.playerId);		
			}

			if (res.status=='endRound')
			{
				console.log(res.round);
				//false= this player not dead
				displayEndTurn(res.round,res.endCycle);
				// if (!displayEndTurn(res.round,res.endCycle) && !res.endCycle)
					// window.setTimeout(	setHandListener(gameID),13000);
			}

			if (res.status=='endCycle')
			{
				//window.setTimeout(	showNewCycle(res.cycle),9000);
			//	showNewCycle(res.cycle);
				cyc=res.cycle;
				endGameDisplay(res.cycle.player, res.cycle.mark,true);
			}
			
			if (res.status=='continue')
			{
				TukTuk.Modal.hide();
				showNewCycle(cyc);
				if (!spectate)
				setHandListener(gameID);
			}
			
			if (res.status=='endEarly')
			{
			TukTuk.Modal.hide();
				destoryGame();
			}
			
			if (res.status=='endGame')
			{
				console.log(res.gameResult);
				endGameDisplay(res.gameResult.player,res.gameResult.mark,false);	
			//	destoryGame();
			//	window.setTimeout(	function(){showEndGame(res.gameResult)},9000);
			}
		});
		
		//message that your friends have logged in
		socket.on('user_login',function(res){
			console.log("A fd has logged in");
			$("#rank_table").empty();
			renderFriendList();
		});
		
		//message that your friends have logged out
		socket.on('user_logout',function(res){
			console.log("A fd has logged out");
			$("#rank_table").empty();
			renderFriendList();
		});
	};

	function initCreateRoomButton() {
		var btn = $("#createRoomButton");
		btn.on('click', function() {
			$("#createRoomForm input[name=name]").val("");
		});

        //create room start button
        var createRoomStartBtn = $("#createRoomStartBtn");
        createRoomStartBtn.on('click',function(){
            var size = $("#gameRoomSize").val();
            var name = $("#createRoomForm input[name=name]").val();

            // $("#gameRoomSelection").removeClass('active');
            // createRoomStartBtn.off('click');
            // TukTuk.Modal.hide();

            socket.post('/GameRoom/create',
                {
                    size: size,
                    name: name,
					
                },
                function(res) {
                	console.log("create room response: ", res);

                	if(res.error)
                		console.log(res);
                	else {
                    	var room = res;

                    	socket.post('/GameRoom/join/' + room.id,
                    		{ playerId: playerId },
                    		function(res) {
                    			if(res.error) {
                    				console.log(res.error);
                    			} else {
                    				console.log("Join Game Room response: ", res);

                    				joinGameRoom(res);
                    			}
                    		});
                    }
                });

        });
    }

    function initMatchButton() {

    	var matchBtn = $("#matchButton");

    	matchBtn.on('click', function() {
    		matchRoom();
    	});

    	function matchRoom() {
    		socket.post('/GameRoom/match',
    			{ playerId: playerId },
    			function(res) {
    				console.log("Match Game Room response: ", res);

    				if(res.error)
    					console.log(res);
    				else
    					joinGameRoom(res);
    			});
    	}
    }

    function initLoadingScreen() {
    	$(document).on('fblogin', function() {
    		$("#loading").addClass('hide');
    	});
    }
}



function joinGameRoom(room) {
	TukTuk.Modal.show('gameRoom');

	$("#gameRoomName").text(room.name);

	$("#gameRoomStartBtn").prop("disabled", true);

	updateRoomInfo(room);

	//start button
	$("#gameRoomStartBtn").on('click', gameRoomStartHandler);

	function gameRoomStartHandler(e) {
		$(e.target).off('click', gameRoomStartHandler);
		$(e.target).prop('disabled', true);

		socket.post('/GameRoom/start/' + room.id, 
			{},
			function(res) {
				if(res.error)
					console.log(res.error);
				if (res.status=="success")
				{
					startGame(room);
				}
			});	
	}

    //leave button
    $('#gameRoomExitBtn').on('click', gameRoomExitHandler);
    function gameRoomExitHandler(e) {
    	$(e.target).off('click', gameRoomExitHandler);

    	socket.post('/GameRoom/leave/' + room.id,
    		{ playerId: playerId },
    		function(res) {
    			if(res.error) {
    				console.log(res.error);
    			}
    		});
    }

    //invite button
    $("#gameRoomInviteBtn").on('click', function() {
    	sendFbInvite(null, 'Join this room and play with me!', room.id,
    		function(res){
    			console.log('facebook send invite', res);
    		});
    });
}

function updateRankTable(){

}

function updateRoomInfo(room) {
	var players = JSON.parse(room.players);
	var size = room.size;

	$("#gameRoomCount").text("{0} / {1}".format(players.length, size));

	var i;
	for(i = 0; i < players.length; i++) {
		var player = players[i];
		var playerDiv = $('#gameRoomPlayer' + (i + 1));

		playerDiv.find('p').text("");

		var loadPlayerInfo = function() {
			var div = playerDiv;

			return (function(name, picture) {
				div.find('p').text(name);
				div.find('img').attr('src', picture);
    		});
    	};

    	loadPlayerInfoFromFb(player, loadPlayerInfo());
	}

	for(; i < size; i++) {
		var playerDiv = $('#gameRoomPlayer' + (i + 1));
		playerDiv.find('p').text("");
		playerDiv.find('img').attr('src', 'images/user.jpg');
	}

	for(; i < 5; i++) {
		var playerDiv = $('#gameRoomPlayer' + (i + 1));
		playerDiv.find('p').text("");
		playerDiv.find('img').attr('src', 'images/no_user.jpg');
	}
}

function gameRoomReady(roomMaster) {
	if(roomMaster == playerId)
		$("#gameRoomStartBtn").prop('disabled', false);
}

function startGame(room) {
	socket.post('/Game/create/', 
		{ roomid: room.id, playerId: playerId  }, 
		function(res) {
			console.log('game started: ', res);
		});

	// $("#gameRoom").addClass('hide');
}


function searchRm(){
	var search_rm_txt = $("#search_rm_txt");
	search_rm_txt.keyup(function(){
		//need to handle when the text i null 
		//if the text is null all rm should been shown
		socket.post('/GameRoom/search',
			{
				query: search_rm_txt.val()
			},
			
			
			
			function(res) {
				if(res.error){
					console.log(res.error);
					refreshGameRoomList();
				}
				else{
					console.log("query is:"+search_rm_txt.val());
					//console.log("the response is:"+JSON.stringify(res));
					//console.log("testing:"+res.rooms[0].size);
					$("#gameRoomList").empty();
					for(var i=0; i<res.rooms.length; i++){
						addGameRoomToList(res.rooms[i]);
						console.log("successful");
					}
				}
			});
	});
}

function checkIfInvited() {
	//logic here

	//provide roomid if it is invited by others
	var roomid = 1;

	if(roomid) {
		if(fbLogin)
			join();
		else
			// FB.Event.subscribe('auth.statusChange', join);
			$(document).on('fblogin', join);
	}

	function join() {
		socket.post('/GameRoom/join/' + roomid,
			{ playerId: playerId },
			function(res) {
				if(res.error) {
					console.log(res.error);
				} else {
					console.log("Join Game Room response: ", res);
					
					joinGameRoom(res);
				}
			});
	}
}

function refreshGameRoomList() {
	socket.get('/GameRoom',
		"",
		function (res) {
			console.log("gameroom list", res);

			$("#gameRoomList").empty();

			$.each(res, function() {
				addGameRoomToList(this);
			});
		});
}

function addGameRoomToList(room) {
	var players = JSON.parse(room.players);
	var size = room.size;

	var row_div_1 =$('<div/>',{
		id: 'gameroom' + room.id,
		class: 'row rm_row'
	});
	
	var gameRoomName=$('<div/>',{
		class: 'column_5'
	});
	gameRoomName.append("<h6 class=\"color theme text bold\">" + room.name + "</h6>");
	
	var join_button_div=$('<div/>',{
		class:'column_2',
	});
	var join_button = $('<button class="button success small">&nbsp&nbsp&nbsp&nbsp&nbspJoin&nbsp&nbsp&nbsp&nbsp</button>');
	join_button.on('click', function() {
		socket.post('/GameRoom/join/' + room.id,
			{ playerId: playerId },
			function(res) {
				if(res.error) {
					console.log(res.error);
				} else {
					console.log("Join Game Room response: ", res);
					
					joinGameRoom(res);
				}
			});
	});
	join_button_div.append(join_button);
	row_div_1.append(gameRoomName);
	row_div_1.append(join_button_div);
	
	var row_div_2 =$('<div/>',{
		class: 'row rm_row'
	});

	var i;
	for(i = 0; i < players.length; i++) {
		var player = players[i];
		var player_div= $('<div/>', {
			class:'column_1',
		}).append("<img src=\"/images/user.jpg\">");

		row_div_2.append(player_div);

		var loadPlayerInfo = function() {
			var div = player_div;

			return (function(name, picture) {
				div.find('img').attr('src', picture);
			});
		};

		loadPlayerInfoFromFb(player, loadPlayerInfo());
	}

	for(; i < room.size; i++) {
		var player_div= $('<div/>', {
			class:'column_1',
		}).append("<img src=\"/images/user.jpg\">");

		row_div_2.append(player_div);
	}

	for(; i < 5; i++) {
		var player_div= $('<div/>', {
			class:'column_1',
		}).append("<img src=\"/images/no_user.jpg\">");

		row_div_2.append(player_div);
	}
	
	var spec_button_div=$('<div/>',{
		class:'column_2',
	});
	var spec_button = $("<button class=\"button small spec_btn_move\">Spectate</button>");
	spec_button.on('click', function() {
		
		socket.post('/GameRoom/spectate/' + room.id,
			{ },
			function(res) {
				if(res.error) {
					console.log(res.error);
				} else {
					//	console.log(res);
					console.log(res.room);
					socket.post('/Game/spectate/' + res.room, 
						{},
						function(res) {
							if(res.error)
								console.log(res.error);
							console.log(res.info);
							spectateGame(res.info);
						});													
				}
			});
	});
	spec_button_div.append(spec_button);

	row_div_2.append(spec_button_div);

	$("#gameRoomList").append(row_div_1);
	$("#gameRoomList").append(row_div_2);
	$("#gameRoomList").append("<br><br>");
}

function searchRm(){
	var search_rm_txt = $("#search_rm_txt");
	search_rm_txt.keyup(function(){
		//need to handle when the text i null 
		//if the text is null all rm should been shown
		socket.post('/GameRoom/search',
			{
				query: search_rm_txt.val()
			},
			function(res) {
				if(res.error){
					console.log(res.error);
					refreshGameRoomList();
				}
				else{
					console.log("query is:"+search_rm_txt.val());
					//console.log("the response is:"+JSON.stringify(res));
					//console.log("testing:"+res.rooms[0].size);
					$("#gameRoomList").empty();
					for(var i=0; i<res.rooms.length; i++){
						addGameRoomToList(res.rooms[i]);
						console.log("successful");
					}
				}
			});
	});
}

function checkIfInvited() {
	if(fbLogin)
		check();
	else
		// FB.Event.subscribe('auth.statusChange', join);
		$(document).on('fblogin', check);

	function check() {
		var request_ids = getUrlParameter('request_ids');
		var access_token = FB.getAuthResponse()['accessToken'];

		if(request_ids) {
			// //hardcode to join the first one
			// var request_id = request_ids[0];

			// getGameRoomID(request_id, access_token, join);
			console.log('request_ids', request_ids);

			renderInviteList(request_ids, access_token);
		}
	}

	function renderInviteList(request_ids, access_token) {
		var article = $("#invitationList > article");

		for(var i in request_ids) {
			var loadRequestInfo = function() {
    			var request_id = request_ids[i];

    			return (function(fbid, roomid) {
    				if(fbid && roomid) {
    					var row = $('<div />', {
    						class: 'row'
    					}).appendTo(article);    					

    					var playerDiv = $('<div />', {
    						class: 'column_3'
    					}).appendTo(row);

    					var inviteDiv = $('<div />', {
    						class: 'column_3',
    						style: 'text-align: center'
    					}).appendTo(row);

	    				//invite button
	    				var btn = $("<button />", {
	    					class: 'button success',
	    					text: 'Join My Room'
	    				});

	    				btn.on('click', function() {
	    					socket.post('/GameRoom/join/' + roomid,
	    						{ playerId: playerId },
	    						function(res) {
	    							if(res.error) {
	    								console.log(res.error);
	    							} else {
	    								console.log("Join Game Room response: ", res);

	    								joinGameRoom(res);
	    							}
	    						});
	    				});

	    				btn.appendTo(inviteDiv);

	    				//invite player info
	    				loadPlayerInfoFromFb(fbid, 
		    				function(name, picture) {
			    				$('<img />', {
			    					src: picture
			    				}).appendTo(playerDiv);

			    				$('<p />', {
			    					text: name,
			    					class: 'text center'
			    				}).appendTo(playerDiv);
				    		}
			    		);
	    			}
		    	});
	    	};		    	
	    	getGameRoomID(request_ids[i], access_token, loadRequestInfo());
		}
		
		TukTuk.Modal.show('invitationList');
	}

	function join(roomid) {
		socket.post('/GameRoom/join/' + roomid,
			{ playerId: playerId },
			function(res) {
				if(res.error) {
					console.log(res.error);
				} else {
					console.log("Join Game Room response: ", res);
					
					joinGameRoom(res);
				}
			});
	}

	function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1));
		var sURLVariables = sPageURL.split('&');
		var request_id_string;

		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) {
				request_id_string = sParameterName[1];
				break;
			}
		}
		if(request_id_string)
			return request_id_string.split(',');
	}

	function getGameRoomID(request_id, access_token, callback){
		var url = "https://graph.facebook.com/"+request_id+"?access_token="+access_token;

		console.log("trying to get game room id...");

		$.get(url)
			.done(function(result) {
				console.log("from fb request id", result);
				var data = JSON.parse(result.data);

				var room_id = data.room_id;
				var fbid = data.fbid;

				deleteRequest(request_id, playerId);

				callback(fbid, room_id);
			})
			.fail(function() {
				console.log('get game room id from request id fail');
				callback(null, null);
			});
	}

	function deleteRequest(requestId, user_id) {
	    FB.api(requestId+"_"+user_id, 'delete', function(response) {
	        console.log("deleted request = " + response);
	    });
	    console.log('delete request', requestId);
	}
}

//facebook invite
function sendFbInvite(to, message, room_id, callback) {
	var options = {
		method: 'apprequests'
	};
	if (to) {
		options.to = to;
	};
	if (message) {
		options.message = message;
	};
	if (room_id) {
		options.data = {room_id: room_id, fbid: playerId} ;
	};
	FB.ui(options, function(response) {
		if(callback) callback(response);
	});
}

function loadPlayerInfoFromFb(fbid, callback) {
	if(fbLogin)
		load();
	else
		$(document).on('fblogin', load);

	function load(){
		FB.api('/'+fbid, {fields: 'first_name, picture.width(100).height(100)'}, function(response){
			if( !response.error ) {
				return callback(response.first_name, response.picture.data.url);
			} else {
				console.error('fb api error: ', response);
			}
		});
	}

	// $.get("http://graph.facebook.com/{0}".format(fbid))
	// 	.done(function(res) {
	// 		var name = "";

	// 		if(res.first_name)
	// 			name = res.first_name;

	// 		var picture = "http://graph.facebook.com/{0}/picture?height=100&type=normal&width=100".format(fbid);
	// 		callback(name, picture);
	// 	})
	// callback("http://graph.facebook.com/{0}/picture?height=100&type=normal&width=100".format(fbid));
}
