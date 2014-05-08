function setUpGame(info)
{
	gameID=info.id;
	$("#main").addClass("hide");
	$("#GamePlaying").removeClass("hide");
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
	$("#userPlayer>.userName").text("Name: "+playerId);
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#userPlayer").append($tide);
	
	setTides(info.currentTides);
	setMyself(me);
	setHandListener(info.id);
}

function getMyself(players)
{
	for (var i=0;i<players.length;i++)
	{
		if (players[i].Name==playerId)
			return players[i];
	}	
}

function setHandListener(id)
{
	$(".hand").find(".weathercard").each(function()
	{
		$(this).dblclick(function(e)
		{
			//console.log($(this).text());
			var path=$(this).prop('src');
			
			//$("#userPlayer>.weathercard").text($(this).text());
			$("#userPlayer>.weathercard").remove();
			var img = $('<img class="weathercard" >'); 
			img.attr('src', path);
			$("#userPlayer").append(img);
			
			path=$("#userPlayer>.weathercard").prop('src');
			numArray=path.match(/(card\/.)(.*)(\.)/);
			num=parseInt(numArray[2]);
		//	$("#userPlayer>.weathercard").text($(this).text());
			unsetHandListener();
			socket.post('/Game/playhand/' + id,
				{ 
				  playerId: playerId,
				  card:num,
				  channelId:currentRoomID
				},
				function(res){ 
							//false= this player not dead
								// if (typeof  res.cycle == 'undefined')
								// {
									// if (!displayEndTurn(res.round,true))
										// setHandListener(id);
								// }
								// else
								// {
									// console.log(res.cycle);
									// displayEndTurn(res.round,false);
									// setTimeout(function() {
										// showNewRound(res.cycle);
									// }, 2000);
									
								// }
							});
			$(this).remove();
		});
	});
}



function setPlayerReady(playerId)
{
	if ($("#"+playerId).length!=0)
	{
		//$("#"+playerId+">.weathercard").text("Ready");
		
		var img = $('<img class="weathercard" >'); 
		img.attr('src', "/images/card/w_back.jpg");
		$("#"+playerId).append(img);
	}
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
	// $("#center>.tidecard1").text(tideArray[0]);
	// $("#center>.tidecard2").text(tideArray[1]);
	var img = $('<img class="tidecard1 tidecard" >'); 
	img.attr('src', "/images/card/t{0}.jpg".format(tideArray[0]));
	img.appendTo('#center');
	
	var img = $('<img class="tidecard2 tidecard" >'); 
	img.attr('src', "/images/card/t{0}.jpg".format(tideArray[1]));
	img.appendTo('#center');	
	
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
	//	var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
		var $life=$('<div class="life">');
		for (var i=0;i<player.Life;i++)
		{
			var $lifeguard = $('<img class="lifeguard" >'); 
			$lifeguard.attr('src', "/images/card/life.png");
			$life.append($lifeguard);
		}
		
	//	var $tide=$('<div class="tidecard"></div>');
		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");

	//	var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
	
	//	$player.append($weather);
	
		$("#GamePlaying").append($player);
	}
	if (pos==2)
	{
		var $player=$('<div class="otherPlayer playerLeft pos2"></div>');
		$player.attr('id',player.Name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(player.Name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(player.Mark));
		var $life=$('<div class="life">');
		for (var i=0;i<player.Life;i++)
		{
			var $lifeguard = $('<img class="lifeguard" >'); 
			$lifeguard.attr('src', "/images/card/life.png");
			$life.append($lifeguard);
		}
//		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
	//	var $tide=$('<div class="tidecard"></div>');
		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");
		
	//	var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
	//	$player.append($weather);
		$("#GamePlaying").append($player);
	}
	if (pos==3)
	{
		var $player=$('<div class="otherPlayer playerLeft pos3"></div>');
		$player.attr('id',player.Name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(player.Name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(player.Mark));
		var $life=$('<div class="life">');
		for (var i=0;i<player.Life;i++)
		{
			var $lifeguard = $('<img class="lifeguard" >'); 
			$lifeguard.attr('src', "/images/card/life.png");
			$life.append($lifeguard);
		}
//		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
//		var $tide=$('<div class="tidecard"></div>');
		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");
		
	//	var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
	//	$player.append($weather);
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
		var $life=$('<div class="life">');
		for (var i=0;i<player.Life;i++)
		{
			var $lifeguard = $('<img class="lifeguard" >'); 
			$lifeguard.attr('src', "/images/card/life.png");
			$life.append($lifeguard);
		}
//		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
//		var $tide=$('<div class="tidecard"></div>');
		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");
		
	//	var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
	//	$player.append($weather);
		$("#GamePlaying").append($player);

	}

}

function setMyself(me)
{
	me.Hands.sort(function compareNumbers(a, b) {
		return a - b;
	});
	
//	$("#userPlayer>.life").text("Life: "+me.Life+"/"+me.RemainingLife);
	for (var i=0;i<me.Life;i++)
	{
		var $lifeguard = $('<img class="lifeguard" >'); 
		$lifeguard.attr('src', "/images/card/life.png");
		$("#userPlayer>.life").append($lifeguard);
	}
	
	$("#userPlayer>.mark").text("Mark: "+me.Mark);
	for (var i=0;i<me.Hands.length;i++)
	{
		if (i<=5)
		{
			// var $card=$('<div class="weathercard"></div>');
			// $card.text(me.Hands[i]);
			// $(".hand>.row1").append($card);
			
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(me.Hands[i]));
			$(".hand>.row1").append(img);
		}
		else
		{
			// var $card=$('<div class="weathercard"></div>');
			// $card.text(me.Hands[i]);
			// $(".hand>.row2").append($card);
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(me.Hands[i]));
			$(".hand>.row1").append(img);
		}
	}
}

function displayEndTurn(res,endCycleFlag)
{
	var flag;
	setPlayerCard(res.player,res.playerHand,res.remaininglife);
	if (!endCycleFlag)
		setTides(res.fieldtide);
	setPlayerTide(res.player,res.tide,res.remaininglife,res.transfer1,res.transfer2);
	flag=setPlayerLife(res.player,res.remaininglife,res.life,res.loselife1,res.loselife2);
	if (!endCycleFlag)
		setRound(res.round);
	return flag;
}

//change tide animation
function setPlayerTide(player,tide,rem,tran1,tran2)
{
	
	for (var i=0;i<player.length;i++)
	{
		if (player[i]==tran1 || player[i]==tran2)
		{
			if ($("#"+player[i]).length!=0)
			{
				$("#"+player[i]+">.tidecard").remove();
				var img = $('<img class="tidecard" >'); 
				img.attr('src', "/images/card/t{0}.jpg".format(tide[i]));
				$("#"+player[i]).append(img);
			}
			else
			{
				$("#userPlayer>.tidecard").remove();
				var img = $('<img class="tidecard" >'); 
				img.attr('src', "/images/card/t{0}.jpg".format(tide[i]));
				$("#userPlayer").append(img);
			}
		}
	}
}

function setPlayerCard(player,playerHand,rem)
{
	for (var i=0;i<player.length;i++)
	{
		if (rem[i]==-1)
		{
			//do nothing
			//set animation first card,then death
			// $("#"+player[i]+">.weathercard").text("Dead Already");
			
			// if ($("#"+player[i]).length==0)
			// {
				// $("#userPlayer>.weathercard").text("Dead Already");
			// }
		} 
		else if(playerHand[i]!=-1)
		{
			
		//	$("#"+player[i]+">.weathercard").text(playerHand[i]);
			//flipping animation
			 $("#"+player[i]+">.weathercard").remove();
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(playerHand[i]));
			$("#"+player[i]).append(img);
		
			// if ($("#"+player[i]).length==0)
			// {
					// $("#userPlayer>.weathercard").text(playerHand[i]);
			// }
		}
	}
}

function setPlayerLife(player,remaininglife,life,die1,die2)
{
	var flag=false;
	for (var i=0;i<player.length;i++)
	{
		//flip animation
		if (i==die1 || i==die2)
		{
			var children;
			if ($("#"+player[i]).length!=0)
				children=$("#"+player[i]+">.life").children();
			else
				children=$("#userPlayer>.life").children();
			var pos=life[i]-remaininglife[i]-1;
			if (pos!=life[i])
			{
			    var src = $(children[pos]).attr("src").replace("life", "life_back");
				$(children[pos]).attr("src", src);
			}
			else
			{
				//setDeathanimation
			}

		
		}
		// $("#"+player[i]+">.life").text("Life:{0}/{1}".format(remaininglife[i],life[i]));
	
	//	 if ($("#"+player[i]).length==0)
	//	 {
				// $("#userPlayer>.life").text("Life:{0}/{1}".format(remaininglife[i],life[i]));
				// if (remaininglife[i]==-1)
					// flag=true;
	//	 }
		
		//death animation
		//if (remaininglife[i]==-1)
		//and if i==player himself set flag to true
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