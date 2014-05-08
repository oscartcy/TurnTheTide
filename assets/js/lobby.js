//generate player id
var playerId = getRandomInt(1, 100000);
var currentRoomID;
var	gameID;
$('#playerName').text(playerId);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
	
(function($){
	//testing area//
	var btn = $("#createRoomButton");

	btn.on('click', function() {
		var size = $("#gameRoomSize").val();

		socket.post('/GameRoom/create',
			{size: size},
			function(res) {
				console.log("create room response: ", res);
			});
	});

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
	//end of testing area//

	//main//
	refreshGameRoomList();
	initSocketListen();
	//end of main

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
	
	function initSocketListen(){
		socket.on('message', function(res) {
			if(res.model == 'gameroom') {
				if(res.verb == 'create') {
					console.log("some gameroom created", res);

					var room = res.data;

					addGameRoomToList(room);
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
				if (!displayEndTurn(res.round,res.endCycle))
					setHandListener(gameID);
				
			}
		});
	};

	function addGameRoomToList(room) {
		var listItem = $('<li/>', {
			id: 'gameroom' + room.id,
			html: 'Game Room' + room.id
		});

		var button = $("<button>Join</button>");
		button.on('click', function() {
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

		listItem.append(button);

		$("#gameRoomList").append(listItem);
	}

	function joinGameRoom(room) {
		var gameroom = $("#gameRoom").removeClass('hide');

		$("#gameRoomName").text('Room ' + room.id);

		$("#gameRoomStartBtn").prop("disabled", true);

		updateRoomInfo(room);
		currentRoomID=room.id;
		//start button
		$("#gameRoomStartBtn").on('click', function(e) {
			$(e.target).off('click');
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

//			socket.delete('/GameRoom/' + room.id,
//				function(res) {
//					console.log('room deleted: ', res);
//				})
		});

        //leave button
        $('#gameRoomExitBtn').on('click', function(e) {
        	$(e.target).off('click');
        	gameroom.addClass('hide');

        	socket.post('/GameRoom/leave/' + room.id,
        		{ playerId: playerId },
        		function(res) {
        			if(res.error) {
        				console.log(res.error);
        			}
        		});
        });
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

    	$("#gameRoom").addClass('hide');
    }

})(jQuery);
