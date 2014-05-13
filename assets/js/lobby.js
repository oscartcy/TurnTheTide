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
	
(function($){
	//main//
	init();
	refreshGameRoomList();
	//end of main

	function init() {
		initSocketListen();
		initCreateRoomButton();
		initMatchButton();
		
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
					console.log('room message: ', res, res.data.room);

					updateRoomInfo(res.data.room);
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
		};

		function initCreateRoomButton() {
	        // var btn = $("#createRoomButton");

	        // btn.on('click', function() {
	        //     // var gameRoomSelection = $("#gameRoomSelection").removeClass();
	        //     // var block = $("#block").removeClass('block');

	        //     var gameRoomSelection = $("#gameRoomSelection").addClass('active');

	        //     //create room start button
	        //     var createRoomStartBtn = $("#createRoomStartBtn");
	        //     createRoomStartBtn.on('click',function(){
	        //         var size = $("#gameRoomSize").val();
         //            var name = $("#createRoomForm input[name=name]").val();

	        //         var gameRoomSelection = $("#gameRoomSelection").addClass('block');
	        //         var block = $("#block").addClass('block');
	        //         socket.post('/GameRoom/create',
	        //             {
         //                    size: size,
         //                    name: name
         //                },
	        //             function(res) {
	        //                 console.log("create room response: ", res);
	        //             });

	        //     });

	        //     //create room leave button
	        //     $('#createRoomExitBtn').on('click', function(e) {
	        //         var gameRoomSelection = $("#gameRoomSelection").addClass('block');
	        //         var block = $("#block").addClass('block');
	        //         socket.post('/GameRoom/leave/' + room.id,
	        //             { playerId: playerId },
	        //             function(res) {
	        //                 if(res.error) {
	        //                     console.log(res.error);
	        //                 }
	        //             });
	        //     });

	        // });

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
                TukTuk.Modal.hide();

                socket.post('/GameRoom/create',
                    {
                        size: size,
                        name: name,
						
                    },
                    function(res) {
                        console.log("create room response: ", res);
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

						TukTuk.Modal.show('gameRoom');
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
		var player_div_1=$('<div/>',{
			class:'column_1',
		});
		player_div_1.append("<img src=\"/images/profile.jpg\">");
		
		var player_div_2=$('<div/>',{
			class:'column_1',
		});
		player_div_2.append("<img src=\"/images/profile.jpg\">");
		
		var player_div_3=$('<div/>',{
			class:'column_1',
		});
		player_div_3.append("<img src=\"/images/profile.jpg\">");
		
		var player_div_4=$('<div/>',{
			class:'column_1',
		});
		player_div_4.append("<img src=\"/images/profile.jpg\">");
		
		var player_div_5=$('<div/>',{
			class:'column_1',
		});
		player_div_5.append("<img src=\"/images/profile.jpg\">");
		
		
		
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

		row_div_2.append(player_div_1);
		row_div_2.append(player_div_2);
		row_div_2.append(player_div_3);
		row_div_2.append(player_div_4);
		row_div_2.append(player_div_5);
		row_div_2.append(spec_button_div);

		$("#gameRoomList").append(row_div_1);
		$("#gameRoomList").append(row_div_2);
		$("#gameRoomList").append("<br><br>");
	}

	function joinGameRoom(room) {
		// var gameroom = $("#gameRoom").removeClass('hide');
		// var block = $("#block").removeClass('block');

		// var gameroom = $("#gameRoom").addClass('active');

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
    }
	
	function updateRankTable(){
	
	}

    function updateRoomInfo(room) {
    	var players = JSON.parse(room.players);
    	var size = room.size;

    	$("#gameRoomCount").text("{0} / {1}".format(players.length, size));

    	var i;
    	for(i = 0; i < players.length; i++) {
    		var playerDiv = $('#gameRoomPlayer' + (i + 1));
    		playerDiv.find('p').text(players[i]);
    	}

    	for(; i < 5; i++) {
    		var playerDiv = $('#gameRoomPlayer' + (i + 1));
    		playerDiv.find('p').text("");
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

})(jQuery);
