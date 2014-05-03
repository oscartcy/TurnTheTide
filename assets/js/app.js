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
		socket.post('/GameRoom/create',
			{},
			function(res) {
				console.log("create room response: ", res);
			});
	});

	var playerId = getRandomInt(1, 100000);
	$('#playerName').text(playerId);

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	//end of testing area//

	subscribeGameRoomList();
	function subscribeGameRoomList() {
		socket.get('/GameRoom',
			"",
			function (res) {
				console.log("Subscribed Game Room Message: ", res);

				$.each(res, function() {
					addGameRoomToList(this);
				});
			});
	}

	initSocketListen();
	function initSocketListen(){
		socket.on('message', function(res) {
			if(res.model == 'gameroom') {
				if(res.verb == 'create') {
					console.log("Game Room List Received");

					var room = res.data;

					addGameRoomToList(room);
				}
			}

			if(res.model == 'gameroom' && res.verb == 'update') {
				console.log('room message: ', res, res.data);

				updateRoomInfo(res.data.room);
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

		updateRoomInfo(room);

        //leave button
        $('#gameRoomExitBtn').on('click', function(e) {
        	socket.post('/GameRoom/leave/' + room.id,
        		{ playerId: playerId },
	        	function(res) {
	        		if(res.error) {
	        			console.log(res.error);
	        		}

	        		$(e.target).off('click');
	        		gameroom.addClass('hide');
	        	}
        	);

        });
    }

    function updateRoomInfo(room) {
    	var players = JSON.parse(room.players);

    	var i;
    	for(i = 0; i < players.length; i++) {
    		$('#gameRoomPlayer' + (i + 1) + ' p').text(players[i]);
    	}

    	for(; i < 5; i++) {
    		$('#gameRoomPlayer' + (i + 1) + ' p').text("");
    	}
    }

})(jQuery);
