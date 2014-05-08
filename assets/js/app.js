/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


 (function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  if (typeof console !== 'undefined') {
  	log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      // log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

  });


    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
    	'Socket is now connected and globally accessible as `socket`.\n' +
    	'e.g. to send a GET request to Sails, try \n' +
    	'`socket.get("/", function (response) ' +
    		'{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


});


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
  	if (typeof console !== 'undefined') {
  		console.log.apply(console, arguments);
  	}
  }


})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

  );

(function($){
	//testing area//
	var btn = $("#createRoomButton");

	btn.on('click', function() {
		var gameRoomSelection = $("#gameRoomSelection").removeClass();
		var block = $("#block").removeClass('block');
		
		//create room start button
		var createRoomStartBtn = $("#createRoomStartBtn");
		createRoomStartBtn.on('click',function(){
			var size = $("#gameRoomSize").val();
			var gameRoomSelection = $("#gameRoomSelection").addClass('block');
			var block = $("#block").addClass('block');
			socket.post('/GameRoom/create',
			{size: size},
			function(res) {
				console.log("create room response: ", res);
			});
			
		});
		
		//create room leave button
        $('#createRoomExitBtn').on('click', function(e) {
        	var gameRoomSelection = $("#gameRoomSelection").addClass('block');
			var block = $("#block").addClass('block');
        	socket.post('/GameRoom/leave/' + room.id,
        		{ playerId: playerId },
        		function(res) {
        			if(res.error) {
        				console.log(res.error);
        			}
        		});
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

	var playerId = getRandomInt(1, 100000);
	$('#playerName').text(playerId);

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
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

			if(res.status == 'start') {
				console.log('game start:', res);

				startGame(res.room);
			}
		});
	};

	function addGameRoomToList(room) {
		/*var listItem = $('<li/>', {
			id: 'gameroom' + room.id,
			html: 'Game Room' + room.id
		});
		
		
		var tr = $("<tr><td>"+ "<img src=/images/gameroom.jpg style=\"width:80px;height:50px;\">" + '<br>Game Room' + room.id + "</td></tr>",{
			id: 'gameroom' + room.id
		});*/
		
		var row_div_1 =$('<div/>',{
			id: 'gameroom' + room.id,
			class: 'row rm_row'
		});
		
		var gameRoomName=$('<div/>',{
			class: 'column_5'
		});
		gameRoomName.append("<h6 class=\"color theme text bold\">Game Room</h6>");
		
		var join_button_div=$('<div/>',{
			class:'column_2',
		});
		var join_button = $("<button class=\"button success small\">&nbsp&nbsp&nbsp&nbsp&nbspJoin&nbsp&nbsp&nbsp&nbsp</button>");
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
			/*
			socket.post('/GameRoom/join/' + room.id,
				{ playerId: playerId },
				function(res) {
					if(res.error) {
						console.log(res.error);
					} else {
						console.log("Join Game Room response: ", res);

						joinGameRoom(res);
					}
				});*/
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
		var gameroom = $("#gameRoom").removeClass('hide');
		var block = $("#block").removeClass('block');

		$("#gameRoomName").text('Room ' + room.id);

		$("#gameRoomStartBtn").prop("disabled", true);

		updateRoomInfo(room);

		//start button
		$("#gameRoomStartBtn").on('click', function(e) {
			$(e.target).off('click');
			$(e.target).prop('disabled', true);

			socket.post('/GameRoom/start/' + room.id, 
				{},
				function(res) {
					if(res.error)
						console.log(res.error);
				});

			socket.delete('/GameRoom/' + room.id,
				function(res) {
					console.log('room deleted: ', res);
				})
		});

        //leave button
        $('#gameRoomExitBtn').on('click', function(e) {
        	$(e.target).off('click');
        	gameroom.addClass('hide');
			block.addClass('block');

        	socket.post('/GameRoom/leave/' + room.id,
        		{ playerId: playerId },
        		function(res) {
        			if(res.error) {
        				console.log(res.error);
        			}
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
    	socket.post('/Game/start/' + room.id, 
    		{}, 
    		function(res) {
    			console.log('game started: ', res);
    		});

    	$("#gameRoom").addClass('hide');
    }

})(jQuery);

//sprintf in js
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
		});
	};
}
