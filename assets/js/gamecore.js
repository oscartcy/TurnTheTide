var state=1;
var roundRes;
var cycleFlag;

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
	
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#center>.tidecard1").append($tide);
	
	var $tide2 = $('<img class="tidecard" >'); 
	$tide2.attr('src', "/images/card/t_back.jpg");
	$("#center>.tidecard2").append($tide2);	
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
		
		var img = $('<img class="weathercard face" >'); 
		img.attr('src', "/images/card/w_back.jpg");
		$("#"+playerId+">.weathercard").append(img);
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
	if (!flag && !endCycleFlag)
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
			back=$("#"+player[i]+">.weathercard>.weathercard");
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
						$weathercard=$("#userPlayer>.weathercard");
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
		if (!$("#userPlayer>.weathercard").hasClass('grayscale'))
			$("#userPlayer>.weathercard").remove();
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
	window.setTimeout(function() {
				 setHandListener(gameID);
	},4000);	
}

function genMeNewCycle(hand,mark,life,cycle)
{
	$("#userPlayer>.mark").text('Mark:{0}'.format(mark));
	$("#userPlayer>.cycle").text("Cycle: "+cycle);
	$("#userPlayer>.round").text("Round: 1");
	//life
	$("#userPlayer>.tide").remove();	
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#userPlayer>.tide").append($tide);
	
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
		if (i<=5)
		{
			
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(hand[i]));
			$(".hand>.row1").append(img);
		}
		else
		{
			// var $card=$('<div class="weathercard"></div>');
			// $card.text(me.Hands[i]);
			// $(".hand>.row2").append($card);
			var img = $('<img class="weathercard" >'); 
			img.attr('src', "/images/card/w{0}.jpg".format(hand[i]));
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
	$("#"+player+">.tide").remove();	
	var $tide = $('<img class="tidecard" >'); 
	$tide.attr('src', "/images/card/t_back.jpg");
	$("#"+player).append($tide);
	$("#"+player+">.weathercard").empty();	
	

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

function showEndGame(gameResult)
{
	
	//call drawTable function gameResult.player gaemResult.mark
	
	
	//When return button is clicked
	//	$("#GamePlaying").addClass("hide");
	//	$(".hand.>row1").empty();
	// $(".pos1").remove();
	// $(".pos2").remove();
	// $(".pos3").remove();
	// $(".pos4").remove();	
}