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
      log('New comet message received :: ', message);
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
// sprintf in js
// Usage:
// "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
// First, checks if it isn't implemented yet.
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

var myFbName="Jackie";
(function($){
    console.log('jquery');

    var btn = $("#startGameButton");

    btn.on('click', function() {
        socket.post('/Game/create',
            {},
            function(res) {
                console.log("game Created");
                console.log(res);
				setUpGame(res);
            });
    });
})(jQuery);

function setUpGame(info)
{
	var players=JSON.parse(info.players);
	var me=getMyself(players);
	var pos=1;
	$("#center").removeClass("hide");
	for (var i=0;i<info.playerNumber;i++)
	{
		if (players[i]!=me)
		{
			generatePlayer(players[i],pos,info.playerNumber);
			pos++;
		}
	}
	$("#userPlayer").removeClass("hide");
	$("#userPlayer>.cycle").text("Cycle: "+info.cycle);
	$("#userPlayer>.round").text("Round: "+info.round);
	$("#userPlayer>.userName").text("Name: "+myFbName);
	setTides(info.currentTides);
	setMyself(me);
	setHandListener(info.id);
}

function getMyself(players)
{
	for (var i=0;i<players.length;i++)
	{
		if (players[i].Name==myFbName)
			return players[i];
	}	
}

function setHandListener(id)
{
	$(".hand").find(".weathercard").each(function()
	{
		$(this).dblclick(function(e)
		{
			console.log($(this).text());
			$("#userPlayer>.weathercard").text($(this).text());
			unsetHandListener();
			socket.post('/Game/playhand/' + id,
				{ 
				  playerId: myFbName,
				  card:$(this).text(),
				},
				function(res){ 
							//false= this player not dead
								if (typeof  res.cycle == 'undefined')
								{
									if (!displayEndTurn(res.round,true))
										setHandListener(id);
								}
								else
								{
									console.log(res.cycle);
									displayEndTurn(res.round,false);
									setTimeout(function() {
										showNewRound(res.cycle);
									}, 2000);
									
								}
							});
			$(this).remove();
		});
	});
}

function unsetHandListener()
{
	$(".hand").find(".weathercard").each(function()
	{
		$(this).unbind( "dblclick" );
	});
}

function setTides(tideArray)
{
	$("#center>.tidecard1").text(tideArray[0]);
	$("#center>.tidecard2").text(tideArray[1]);
}

function generatePlayer(player,pos,totalnumber)
{

	if (pos==1)
	{
		var $player=$('<div class="otherPlayer playerLeft pos1"></div>');
		$player.attr('id',player.Name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(player.Name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(player.Mark));
		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
		var $tide=$('<div class="tidecard"></div>');
		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
		$player.append($weather);
		$("#GamePlaying").append($player);
	}
	if (pos==2)
	{
		var $player=$('<div class="otherPlayer playerLeft pos2"></div>');
		$player.attr('id',player.Name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(player.Name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(player.Mark));
//		var $life=$('<p class="life">Life:{0}</p>'.format(player.Life));
		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
		var $tide=$('<div class="tidecard"></div>');
		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
		$player.append($weather);
		$("#GamePlaying").append($player);
	}
	if (pos==3)
	{
		var $player=$('<div class="otherPlayer playerLeft pos3"></div>');
		$player.attr('id',player.Name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(player.Name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(player.Mark));
		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
		var $tide=$('<div class="tidecard"></div>');
		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
		$player.append($weather);
		$("#GamePlaying").append($player);
		if (totalnumber==5)
		{
			$player.css("left","50px");
		}
	}
	if (pos==4)
	{
		var $player=$('<div class="otherPlayer playerLeft pos4"></div>');
		$player.attr('id',player.Name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(player.Name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(player.Mark));
		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
		var $tide=$('<div class="tidecard"></div>');
		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
		$player.append($weather);
		$("#GamePlaying").append($player);

	}

}

function setMyself(me)
{
	me.Hands.sort(function compareNumbers(a, b) {
		return a - b;
	});
	
	$("#userPlayer>.life").text("Life: "+me.Life+"/"+me.RemainingLife);
	$("#userPlayer>.mark").text("Mark: "+me.Mark);
	for (var i=0;i<me.Hands.length;i++)
	{
		if (i<=5)
		{
			var $card=$('<div class="weathercard"></div>');
			$card.text(me.Hands[i]);
			$(".hand>.row1").append($card);
		}
		else
		{
			var $card=$('<div class="weathercard"></div>');
			$card.text(me.Hands[i]);
			$(".hand>.row2").append($card);
		}
	}
}

function displayEndTurn(res,endCycleFlag)
{
	var flag;
	if (endCycleFlag)
		setTides(res.fieldtide);
	setPlayerTide(res.player,res.tide);
	setPlayerCard(res.player,res.playerHand);
	flag=setPlayerLife(res.player,res.remaininglife,res.life);
	if (endCycleFlag)
		setRound(res.round);
	return flag;
}


function setPlayerTide(player,tide)
{
	for (var i=0;i<player.length;i++)
	{
		if (tide[i]!=0)
			$("#"+player[i]+">.tidecard").text(tide[i]);
	
		if ($("#"+player[i]).length==0)
		{
			if (tide[i]!=0)
				$("#userPlayer>.tidecard").text(tide[i]);
		}
	}
}

function setPlayerCard(player,playerHand)
{
	for (var i=0;i<player.length;i++)
	{
		if(playerHand[i]!=-1)
		{
			$("#"+player[i]+">.weathercard").text(playerHand[i]);
		
			if ($("#"+player[i]).length==0)
			{
					$("#userPlayer>.weathercard").text(playerHand[i]);
			}
		}
		else
			$("#"+player[i]+">.weathercard").text("Dead");
	}
}

function setPlayerLife(player,remaininglife,life)
{
	var flag=false;
	for (var i=0;i<player.length;i++)
	{
		$("#"+player[i]+">.life").text("Life:{0}/{1}".format(remaininglife[i],life[i]));
	
		if ($("#"+player[i]).length==0)
		{
				$("#userPlayer>.life").text("Life:{0}/{1}".format(remaininglife[i],life[i]));
				if (remaininglife[i]==-1)
					flag=true;
		}
	}
	return flag;
}

function setRound(round)
{
	$("#userPlayer>.round").text("Round: "+round);
}

function showNewRound(cycle)
{

}