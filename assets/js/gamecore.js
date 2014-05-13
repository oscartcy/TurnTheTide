function setUpGame(info)
{
	gameID=info.id;
	$("#main").addClass("hide");
	TukTuk.Modal.hide();
	$("#GamePlaying").removeClass("hide");
	var players=JSON.parse(info.players);
	var me=getMyself(players);
	var pos=1;
	$("#center").removeClass("hide");
	for (var i=0;i<info.playerNumber;i++)
	{
		if (players[i]!=me)
		{
			generatePlayer(players[i].Name,pos,info.playerNumber,0,players[i].Life);
			pos++;
		}
	}
if (info.playerNumber==3)
{
	$("#center").css("top","40%");
}
else
{
	$("#center").css("top","50%");
}
	$("#userPlayer").removeClass("hide");
	$("#userPlayer>.cycle").text("Cycle: "+info.cycle);
	$("#userPlayer>.round").text("Round: "+info.round);
	$("#userPlayer>.userName").text("Name: "+playerId);
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#userPlayer").append($tide);
	
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#center>.tidecard1").append($tide);
	
	var $tide2 = $('<img class="tidecard" >'); 
	$tide2.attr('src', "/images/card/t_back.jpg");
	$("#center>.tidecard2").append($tide2);	
	setTides(info.currentTides);
	setMyself(me);
	setHandListener(info.id);
	
	var loadPlayerInfo = function() {

		return (function(name, picture) {
			$("#userPlayer").find('name').text("Name:{0}".format(name));
			var $img=$("<img class=myprofile>");
			$img.attr('src', picture);
			$("#userPlayer").find('myprofile').append($img);
			
		});
	};

	loadPlayerInfoFromFb(playerId, loadPlayerInfo());
	

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
			$("#userPlayer>.weathercard").empty();
			var img = $('<img class="weathercard" >'); 
			img.attr('src', path);
			$("#userPlayer>.weathercard").append(img);
			
			path=$("#userPlayer>.weathercard>.weathercard").prop('src');
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
			var num=($(this).parent().children().length-1)*65;
			$(".myrow").css("width",num);
			//$(".myrow").animate({"width":num});
		});
	});
}



function setPlayerReady(playerId)
{
	if ($("#"+playerId).length!=0)
	{
		//$("#"+playerId+">.weathercard").text("Ready");
		
		var img = $('<img class="weathercard face" >'); 
		img.attr('src', "/images/card/w_back.jpg");
		$("#"+playerId+">.weathercard").append(img);
	}
	else if (spectate)
	{
		var img = $('<img class="weathercard face" >'); 
		img.attr('src', "/images/card/w_back.jpg");	
		$("#userPlayer>.weathercard").append(img);
		var child=$(".hand>.row1").children();
		var num=(child.length-1)*65;
		$(".myrow").css("width",num);
		$(child[0]).remove();
		//$(".myrow").animate({"width":num});
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
	//tideArray.sort();

	back1=$("#center>.tidecard1>.tidecard");
	back2=$("#center>.tidecard2>.tidecard");
	var img1 = $('<img class="tidecard1 tidecard tidefront face" >'); 
	img1.attr('src', "/images/card/t{0}.jpg".format(tideArray[0]));	
	img1.css("opacity",0.5);
	img1.appendTo("#center>.tidecard1");
	
	var img2 = $('<img class="tidecard2 tidecard tidefront face" >'); 
	img2.attr('src', "/images/card/t{0}.jpg".format(tideArray[1]));
	img2.css("opacity",0.5);
	img2.appendTo("#center>.tidecard2");
	rotate(img1,back1);
	rotate(img2,back2);
	//img.appendTo("#center");	
	
}

function generatePlayer(name,pos,totalnumber,mark,life)
{
	if (pos==1)
	{
		var $player=$('<div class="otherPlayer playerLeft pos1"></div>');
		$player.attr('id',name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(mark));
	//	var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
		var $life=$('<div class="life">');
		for (var i=0;i<life;i++)
		{
			var $lifeunit=$('<div class="lifeunit">')
			
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life_back.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life.png");
			
			$lifeunit.append($lifedeath);			
			$lifeunit.append($lifeguard);
			$lifeunit.css("left",i*30+10);			
			$life.append($lifeunit);
		}
		
	//	var $tide=$('<div class="tidecard"></div>');
		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");

		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
	
		$player.append($weather);
		
		if (totalnumber==3)
			$player.css("top","10%");
		else
			$player.css("top","30%");
	
		$("#GamePlaying").append($player);
	}
	if (pos==2)
	{
		var $player=$('<div class="otherPlayer playerLeft pos2"></div>');
		$player.attr('id',name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(mark));
		var $life=$('<div class="life">');
		for (var i=0;i<life;i++)
		{
			// var $lifeguard = $('<img class="lifeguard" >'); 
			// $lifeguard.attr('src', "/images/card/life.png");
			// $life.append($lifeguard);
			var $lifeunit=$('<div class="lifeunit">')
			
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life_back.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life.png");
			
			$lifeunit.append($lifedeath);			
			$lifeunit.append($lifeguard);
			$lifeunit.css("left",i*30+10);			
			$life.append($lifeunit);
		}
//		var $life=$('<p class="life">Life:{0}/{1}</p>'.format(player.RemainingLife,player.Life));
	//	var $tide=$('<div class="tidecard"></div>');
		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");
		
		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
		$player.append($weather);
		
		if (totalnumber==3)
			$player.css("top","10%");
		else
			$player.css("top","30%");
		$("#GamePlaying").append($player);
	}
	if (pos==3)
	{
		var $player=$('<div class="otherPlayer playerLeft pos3"></div>');
		$player.attr('id',name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(mark));
		var $life=$('<div class="life">');
		for (var i=0;i<life;i++)
		{
			// var $lifeguard = $('<img class="lifeguard" >'); 
			// $lifeguard.attr('src', "/images/card/life.png");
			// $life.append($lifeguard);

			var $lifeunit=$('<div class="lifeunit">')
			
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life_back.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life.png");
			
			$lifeunit.append($lifedeath);			
			$lifeunit.append($lifeguard);
		$lifeunit.css("left",i*30+10);			
			$life.append($lifeunit);
		}

		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");
		
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
		else
		{
			$player.css("left","260px");
		}
	}
	if (pos==4)
	{
		var $player=$('<div class="otherPlayer playerLeft pos4"></div>');
		$player.attr('id',name);
		var $profile=$('<div class="profile"></div>');
		var $name=$('<p class="name">Name:{0}</p>'.format(name));
		var $mark=$('<p class="mark">Mark:{0}</p>'.format(mark));
		var $life=$('<div class="life">');
		for (var i=0;i<life;i++)
		{
			var $lifeunit=$('<div class="lifeunit">')
			
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life_back.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life.png");
			
			$lifeunit.append($lifedeath);			
			$lifeunit.append($lifeguard);
					$lifeunit.css("left",i*30+10);
			
			$life.append($lifeunit);
		}

		var $tide = $('<img class="tidecard" >'); 
		$tide.attr('src', "/images/card/t_back.jpg");
		
		var $weather=$('<div class="weathercard"></div>');
		$player.append($name);
		$player.append($mark);
		$player.append($life);
		$player.append($profile);
		$player.append($tide);
		$player.append($weather);
		$("#GamePlaying").append($player);

	}
	
	var loadPlayerInfo = function() {
		var div = pos;

		return (function(name, picture) {
			$(".pos"+pos).find('name').text("Name:{0}".format(name));
			var $img=$("<img class=profile>");
			$img.attr('src', picture);
			$(".pos"+pos).find('profile').append($img);
			
		});
	};

	loadPlayerInfoFromFb(name, loadPlayerInfo());
}

function setMyself(me)
{
	me.Hands.sort(function compareNumbers(a, b) {
		return a - b;
	});
	
//	$("#userPlayer>.life").text("Life: "+me.Life+"/"+me.RemainingLife);
	for (var i=0;i<me.Life;i++)
	{

		
		var $lifeunit=$('<div class="lifeunit">')
		
		var $lifedeath=$('<img class="lifeguard face">'); 
		$lifedeath.attr('src', "/images/card/life_back.png");
		$lifedeath.css("opacity",0.5);
		
		var $lifeguard = $('<img class="lifeguard face">'); 
		$lifeguard.attr('src', "/images/card/life.png");
		
		$lifeunit.append($lifedeath);			
		$lifeunit.append($lifeguard);
		
		$lifeunit.css("left",i*30+10);
		
		$("#userPlayer>.life").append($lifeunit);
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
	var flag=false;
	
	state=1;
	roundRes=res;
	cycleFlag=endCycleFlag;	
	setPlayerCard(res.player,res.playerHand,res.remaininglife);
	
	window.setTimeout(function() {
		setPlayerTide(res.player,res.tide,res.remaininglife,res.transfer1,res.transfer2);
	},2000);
	
	window.setTimeout(function() {
		setPlayerLife(res.player,res.remaininglife,res.life,res.loselife1,res.loselife2);
	},5000);
	
	for (var i=0;i<res.player.length;i++)
	{
		 if ($("#"+res.player[i]).length==0)
		 {
				 if (res.remaininglife[i]==-1)
					flag=true;
		 }	
	}
	
	if (!endCycleFlag)
	{
		window.setTimeout(function() {
				 setTides(res.fieldtide);
		},9000);
	}
		 
	if (!endCycleFlag)
	{
		window.setTimeout(function() {
			setRound(res.round,res.player);
		},12000);
	}
	if (!flag && !endCycleFlag && !spectate)
		window.setTimeout(	function() {setHandListener(gameID)},13000);

	return flag;
}

//change tide animation
function setPlayerTide(player,tide,rem,tran1,tran2)
{

	
	for (var i=0;i<player.length;i++)
	{
		if (player[i]==tran1 || player[i]==tran2)
		{
				var	$ori;
				if ($("#"+player[i]).length!=0)
					$ori=$("#"+player[i]+">.tidecard");
				else
					$ori=$("#userPlayer>.tidecard");

				$ori.css('z-index', -1);
				var	oriLeft=$ori.offset().left;
				var	oriTop=$ori.offset().top;
				
				if (player[i]==tran1)
				{
					var	$field=$(".tidecard1.tidefront");	
					var remove="tidecard1";
					 child=$(".tidecard1").children();
					 $(child[0]).remove();
					var $tide = $('<img class="tidecard1 tidecard" >'); 
					$tide.attr('src', "/images/card/t_back.jpg");
				//	$tide.css('z-index', -1);
					$("#center>.tidecard1").append($tide);
				}
				else
				{
					var	$field=$(".tidecard2.tidefront");	
					var remove="tidecard2";
					child=$(".tidecard2").children();
					$(child[0]).remove();
					var $tide2 = $('<img class="tidecard2 tidecard" >'); 
					$tide2.attr('src', "/images/card/t_back.jpg");
					$("#center>.tidecard2").append($tide2);
				}
				var fieldLeft=$field.offset().left;
				var fieldTop=$field.offset().top;
				var moveleft=oriLeft-fieldLeft;
				var movetop=oriTop-fieldTop;
				if (player[i]==tran1)
				{
					move(".tidecard1.tidefront")
						.translate(moveleft, movetop)
						.duration(2000)
						.end(animateCallback())	;
				}
				else
				{
					move(".tidecard2.tidefront")
						.translate(moveleft, movetop)
						.duration(2000)
						.end(animateCallback())	;		
				}
				
				function animateCallback() {
					var field = $field;
					var cnt = i;
					
					return (function(){		
							var	$ori;
							if ($("#"+player[cnt]).length!=0)
							{
								$ori=$("#"+player[cnt]+">.tidecard");
								$ori.remove();
							}
							else
							{							
								$ori=$("#userPlayer>.tidecard");
								$ori.remove();
							}

							field.remove();
							var img = $('<img class="tidecard" >'); 
							img.attr('src', "/images/card/t{0}.jpg".format(tide[cnt]));
							if ($("#"+player[cnt]).length!=0)							
								$("#"+player[cnt]).append(img);
							else
								$("#userPlayer").append(img);
					}) ;
				}		
		}
	}
}

function setPlayerCard(player,playerHand,rem)
{
	for (var i=0;i<player.length;i++)
	{
		if(playerHand[i]!=-1)
		{
			
		//	$("#"+player[i]+">.weathercard").text(playerHand[i]);
			//flipping animation
		//	 $("#"+player[i]+">.weathercard").remove();
			var back=$("#"+player[i]+">.weathercard>.weathercard");
			var img = $('<img class="weathercard face" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(playerHand[i]));
			img.css("opacity",0.5);
			$("#"+player[i]+">.weathercard").append(img);
			
			if (img.css("opacity")==0.5)
				rotate(img,back);
			else
				rotate(back,img);
			

		}
	}
	
	if (spectate)
	{
		var back=$("#userPlayer>.weathercard>.weathercard");
		var img = $('<img class="weathercard face" >'); 
		img.attr('src', "/images/card/w{0}.jpg".format(playerHand[0]));
		img.css("opacity",0.5);
		$("#userPlayer>.weathercard").append(img);
		rotate(img,back);
	}	
}

function setPlayerLife(player,remaininglife,life,die1,die2)
{
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
			   // var src = $(children[pos]).attr("src").replace("life", "life_back");
			//	$(children[pos]).attr("src", src);
				var lifeunit= $(children[pos]);
				var child=lifeunit.children();
				rotate($(child[0]),$(child[1]));
			}
		
			if (remaininglife[i]==-1)
				window.setTimeout(Callback(),2000);
				
		}
		
		function Callback() {

			var cnt = i;

			
			return (function(){		
					var $tide;
					var $weathercard;
					if ($("#"+player[cnt]).length!=0)
					{
						$tide=$("#"+player[cnt]+">.tidecard");
						$weathercard=$("#"+player[cnt]+">.weathercard>.weathercard");
					}
					else
					{							
						$tide=$("#userPlayer>.tidecard");
						$weathercard=$("#userPlayer>.weathercard>.weathercard");
					}
					$tide.addClass("grayscale");
					$weathercard.addClass("grayscale");


			}) ;
		}	
	}
}

function setRound(round,player)
{
	$("#userPlayer>.round").text("Round: "+round);
	for (var i=0;i<player.length;i++)
	{
		if ($("#"+player[i]+">.weathercard").length!=0 && !$("#"+player[i]+">.weathercard>.weathercard").hasClass('grayscale'))
			$("#"+player[i]+">.weathercard").empty();
		else
		if (!$("#userPlayer>.weathercard>.weathercard").hasClass('grayscale'))
			$("#userPlayer>.weathercard>.weathercard").remove();
	}
}

function showNewCycle(cycle)
{
	for (var i=0;i<cycle.player.length;i++)
	{
		if ($("#"+cycle.player[i]).length!=0)
			genPlayerNewCycle(cycle.player[i],cycle.mark[i],cycle.life[i]);
		else
			genMeNewCycle(cycle.hand[i],cycle.mark[i],cycle.life[i],cycle.cycle);
	}
	window.setTimeout(function() {
				 setTides(cycle.fieldtide);
	},2000);
	// window.setTimeout(function() {
				 // setHandListener(gameID);
	// },4000);	
}

function genMeNewCycle(hand,mark,life,cycle)
{
	$("#userPlayer>.mark").text('Mark:{0}'.format(mark));
	$("#userPlayer>.cycle").text("Cycle: "+cycle);
	$("#userPlayer>.round").text("Round: 1");
	//life
	$("#userPlayer>.tidecard").remove();	
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#userPlayer").append($tide);
	$("#userPlayer>.weathercard").empty();
	var $life=$("#userPlayer>.life");
	$life.empty();
	for (var i=0;i<life;i++)
	{

		
		var $lifeunit=$('<div class="lifeunit">')
		
		var $lifedeath=$('<img class="lifeguard face">'); 
		$lifedeath.attr('src', "/images/card/life_back.png");
		$lifedeath.css("opacity",0.5);
		
		var $lifeguard = $('<img class="lifeguard face">'); 
		$lifeguard.attr('src', "/images/card/life.png");
		
		$lifeunit.append($lifedeath);			
		$lifeunit.append($lifeguard);
		
		$lifeunit.css("left",i*30+10);
		
		$("#userPlayer>.life").append($lifeunit);
	}
	//hand
	$(".hand>.row1").empty();
	hand.sort(function compareNumbers(a, b) {
		return a - b;
	});
	for (var i=0;i<hand.length;i++)
	{
		if (!spectate)
		{
			
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(hand[i]));
			$(".hand>.row1").append(img);
		}
		else
		{
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w_back.jpg");
			$(".hand>.row1").append(img);		
		}

	}
	
}


function genPlayerNewCycle(player,mark,life)
{
	$("#"+player+">.mark").text("Mark:{0}".format(mark));
	var $life=$("#"+player+">.life");
	$life.empty();
	for (var i=0;i<life;i++)
	{
		var $lifeunit=$('<div class="lifeunit">')
		
		var $lifedeath=$('<img class="lifeguard face">'); 
		$lifedeath.attr('src', "/images/card/life_back.png");
		$lifedeath.css("opacity",0.5);
		
		var $lifeguard = $('<img class="lifeguard face">'); 
		$lifeguard.attr('src', "/images/card/life.png");
		
		$lifeunit.append($lifedeath);			
		$lifeunit.append($lifeguard);
		$lifeunit.css("left",i*30+10);			
		$life.append($lifeunit);
	}
	$("#"+player+">.tidecard").remove();	
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#"+player).append($tide);
	$("#"+player+">.weathercard").empty();
	

}

function endGameDisplay(players, scores, flag) {
 		var article = $("#endGameModal article").empty();

			
		if (flag)
		{
			$(".cs").addClass("hide");
			$(".endGame").addClass("hide");
		}
		else
		{
			$(".cs").removeClass("hide");
		//	$(".endGame").removeClass("hide");
		}
		if (flag && players[0]==playerId)
		{
			$(".cont").removeClass("hide");
			$(".endGame").removeClass("hide");
		}
		else
		{
			$(".cont").addClass("hide");
			$(".endGame").addClass("hide");
		}
 		for(var i in players) {
 			var player = players[i];
 			var score = scores[i];
 
 			var row = $('<div />', {
 				class: 'row'
 			});
 
 			$('<div />', {
 				class: 'column_3',
 				html: '<img src="images/user.gif" /><p id="playerName" class="text center">'+player+'</p>'
 			}).appendTo(row);
 
 			$('<div />', {
 				class: 'column_3',
 				html: '<h1 class="color theme text center">'+score+'</h1>'
 			}).appendTo(row);
 
 			article.append(row);
 		}
		
		TukTuk.Modal.show('endGameModal');
 }
function rotate(back,front)
{
	var margin =back.width()/2;
	var width=back.width();
	var height=back.height();
	front.stop().css({width:'0px',height:''+height+'px',marginLeft:''+margin+'px',opacity:'0.5'});


	back.stop().animate({width:'0px',height:''+height+'px',marginLeft:''+margin+'px',opacity:'0.5'},{duration:500});
// back.stop().animate({width:'0px',height:''+height+'px',marginLeft:''+margin+'px',opacity:'0.5'}
					// , {duration:500,
					   // complete:function(){
											// window.setTimeout(function() {
											// back.stop().animate({width:''+width+'px',height:''+height+'px',marginLeft:'0px',opacity:'1'},{duration:500});
											// },500);}});
	window.setTimeout(function() {
	back.stop().animate({width:''+width+'px',height:''+height+'px',marginLeft:'0px',opacity:'1'},{duration:500});
	},500);


}

function destoryGame()
{
		spectate=false;
		//When return button is clicked
	$(".life").empty();
	$("userPlayer>.weathercard").empty();
	 $(".hand>.row1").empty();
	 $(".pos1").remove();
	 $(".pos2").remove();
	 $(".pos3").remove();
	 $(".pos4").remove();	
	 	 $("#GamePlaying").addClass("hide");
		refreshGameRoomList();
	$("#main").removeClass("hide");
	
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
}


function spectateGame(info)
{
	spectate=true;
	//gameID=info.id;
	var pos=1;
	$("#main").addClass("hide");
	TukTuk.Modal.hide();
	$("#GamePlaying").removeClass("hide");
	$("#center").removeClass("hide");
	for (var i=1;i<info.player.length;i++)
	{
		generatePlayer(info.player[i],pos,info.player.length,info.mark[i],info.life[i]);
		pos++;
	}
	//need to set back tide and life
	
	for (var i=1;i<info.player.length;i++)
	{
		var $tide = $('<img class="tidecard" >'); 
		if (info.tide[i]!=0 && info.remLife[i]!=-1)
		{
			$tide.attr('src', "/images/card/t{0}.jpg".format(info.tide[i]));
			$("#"+info.player[i]+">.tidecard").remove();
			$("#"+info.player[i]).append($tide);
		}
		
		var death=info.life[i]-info.remLife[i];
		if (death>info.life[i])
			death=info.life[i];
		for (var j=0;j<death;j++)
		{	
			var child=$("#"+info.player[i]+">.life").children();
			$(child[j]).empty();
			
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life_back.png");
			
			$(child[j]).append($lifedeath);			
			$(child[j]).append($lifeguard);				
		}
	}
	if (info.playerNumber==3)
	{
		$("#center").css("top","40%");
	}
	else
	{
		$("#center").css("top","50%");
	}
	var death=info.life[0]-info.remLife[0];
	if (death>info.life[0])
			death=info.life[0];
	for (var i=0;i<info.life.length;i++)
	{	
		if (i<death)
		{
			var $lifeunit=$('<div class="lifeunit">');
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life_back.png");
			
			$lifeunit.append($lifedeath);			
			$lifeunit.append($lifeguard);			
		}
		else
		{
			var $lifeunit=$('<div class="lifeunit">');
			
			var $lifedeath=$('<img class="lifeguard face">'); 
			$lifedeath.attr('src', "/images/card/life_back.png");
			$lifedeath.css("opacity",0.5);
			
			var $lifeguard = $('<img class="lifeguard face">'); 
			$lifeguard.attr('src', "/images/card/life.png");
			
			$lifeunit.append($lifedeath);			
			$lifeunit.append($lifeguard);
		}
		$lifeunit.css("left",i*30+10);
		
		$("#userPlayer>.life").append($lifeunit);
	}
	
	// set player ready status	
	for (var i=1;i<info.player.length;i++)
	{
		if (info.ready[i])
		{
			var img = $('<img class="weathercard face" >'); 
			img.attr('src', "/images/card/w_back.jpg");
			$("#"+info.player[i]+">.weathercard").append(img);
		}		
	}
	var img = $('<img class="weathercard face" >'); 
	img.attr('src', "/images/card/w_back.jpg");	
	if (info.ready[0])
		$("#userPlayer>.weathercard").append(img);
		

	for (var i=0;i<info.keeperHand;i++)
	{
		var img = $('<img class="weathercard" >'); 
		img.attr('src', "/images/card/w_back.jpg");
		$(".hand>.row1").append(img);		
	}
	$("#userPlayer").removeClass("hide");
	$("#userPlayer>.cycle").text("Cycle: "+info.cycle);
	$("#userPlayer>.round").text("Round: "+info.round);
	$("#userPlayer>.mark").text("Mark: "+info.mark[0]);
	$("#userPlayer>.userName").text("Name: "+info.player[0]);
	
	var $tide = $('<img class="tidecard" >'); 
	if (info.tide[0]!=0 &&info.remLife[0]!=-1)
	{
		$tide.attr('src', "/images/card/t{0}.jpg".format(info.tide[0]));
		$("#userPlayer").append($tide);
	}
	else
	{
		$tide.attr('src', "/images/card/t_back.jpg");
		$("#userPlayer").append($tide);		
	}
	
	//set death
	for (var i=1;i<info.player.length;i++)
	{
		if (info.remLife[i]<=-1)
		{
			var img = $('<img class="weathercard face" >'); 
			img.attr('src', "/images/card/w_back.jpg");
			$("#"+info.player[i]+">.weathercard").append(img);		
			$("#"+info.player[i]+">.weathercard>.weathercard").addClass('grayscale');
			$("#"+info.player[i]+">.tidecard").addClass('grayscale');
		}		
	}	
	if (info.remLife[0]<=-1)
	{
		var img = $('<img class="weathercard face" >'); 
		img.attr('src', "/images/card/w_back.jpg");
		$("#userPlayer>.weathercard").append(img);
		$("#userPlayer>.weathercard>.weathercard").addClass('grayscale');
		$("#userPlayer>.tidecard").addClass('grayscale');			
	}
	
	var $tide1 = $('<img class="tidecard" >'); 
	$tide1.attr('src', "/images/card/t_back.jpg");
	$("#center>.tidecard1").append($tide1);
	
	var $tide2 = $('<img class="tidecard" >'); 
	$tide2.attr('src', "/images/card/t_back.jpg");
	$("#center>.tidecard2").append($tide2);	
	setTides(info.fieldtide);

	var loadPlayerInfo = function() {

		return (function(name, picture) {
			$("#userPlayer").find('name').text("Name:{0}".format(name));
			var $img=$("<img class=myprofile>");
			$img.attr('src', picture);
			$("#userPlayer").find('myprofile').append($img);
			
		});
	};

	loadPlayerInfoFromFb(playerId, loadPlayerInfo());
}