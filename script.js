// noprotect

//find window height and width
var h = $(window).height()-10;
var w=$(window).width()-10;

//set button and text position
$("#over").css("left",w/2-$('#over').width()/2);
$('h1').css("font-size",w/16+"px");
$('#ovebtn').css('width',w/16*9+'px');
$("#overbtn").css("left",w/2-w/16*4.5);
$('#overbtn').css('width',w/16*9+( -w/11));

//canvas set-up
var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;
  var background= document.createElement('img');
  background.src="img/back.png";
  context.fillStyle = "black";
  context.fillRect(0,0,canvas.width, canvas.height);

//variables
var levelSets=0;
var paused=false;
var highScore=0;

/*Everything moves down
once the character reaches
the top of the screen*/
var moveDown=false;
var moveDownTo;

var score=0;

//game over
var over=false;
var overAnim = false;
var game_is_running=true;

//audio/visual
var theme=0;
var playSound=true;
var die = new Audio('sounds/die.mp3');
die.load();
var newlev=new Audio('sounds/newlev.mp3');
newlev.load();
var up = new Audio('sounds/up.mp3');
up.load();

//easter egg: tilt screen
var tilt;
var prevTilt;
var extras={tilt:{now:false,next:true}};


$(window).load(function(){//when window loads

//load high score from cookie
  highScore=setCookie('hScore','');
  if(highScore===''){
    highScore=0;
    $('#hScore').html("High Score: 0");
  }
  else $('#hScore').html("High Score: "+highScore);
  
  //add canvas
  $('body').append(canvas);
  setInterval(function(){updateAll(over,themes,theme,character,enemies,water,overAnim);},31);
  
  //tilt screen
  setInterval(function(){
    if(extras.tilt.now&&!paused){
      if(prevTilt!==0)context.translate(-w/2*prevTilt,-h/2*prevTilt);
      context.rotate(-prevTilt);   //return to regular rotation
      if(prevTilt!==0)context.translate(w/2*prevTilt,h/2*prevTilt); 
      tilt=Math.random()*Math.PI/10-Math.PI/20;
      
      //rotate to a random position
      prevTilt=tilt;
      if(tilt!==0)context.translate(-w/2*tilt,-h/2*tilt);
      context.rotate(tilt);
      if(tilt!==0)context.translate(w/2*tilt,h/2*tilt);

      tilt=0;
    }
  },1500);
});

function makeChar(x,y,xVel,w){//make a charactr object
  return{
    x:x,
    y:y,
    xVel:xVel,
    t:0,//used to determine y velocity: dy= d/dx(kt^2)*dx
    rotate:0,
    jumping:false,
    w:w,
    floor:h-80,
    xMult:1.1,
    xPlus:0, //is added onto the x velocity 
    moveX:true,
  };
}

function makeEnemy(splitX,y,splitW,vel,index){//make a hoizontal bar with an opening across the screen
 var a =Math.random()*25+25;
  if(splitX-splitW/2<10)splitX=splitW/2+10;
  if(splitX+splitW/2>w-10)splitX=-splitW/2+w-10;
  return{
    x:splitX,
    y:y,
    width:splitW,
    vel:vel,
    index:index,
    widthChange:a,
    widthTo:splitW-a,
    drawX:splitX-splitW/2,
  };
}

function makeWater(vel){
  return{
    height:0,
    vel:vel
  };
}

function setCookie(cname, cvalue) {
    if(cvalue!==''){
      document.cookie = cname + "=" + cvalue + "; ";
      return "";
    }
    else{
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
      }
      return "";
      }
    
}

function move(c){
  if(!moveDown){
    if (keys[39] || keys[68]){
      c.xVel=Math.abs(c.xVel);
      if(c.x+10<=w-80) c.x+=(c.xVel*c.xMult+c.xPlus);
      else c.x=1;
    }
    if (keys[37] || keys[65]){
      c.xVel=-Math.abs(c.xVel);
      if(c.x>=0) c.x+=(c.xVel*c.xMult-c.xPlus);
      else c.x=w-81;
    }
    if((keys[38]||keys[87]||keys[32])&&!c.jumping&&c.y>=c.floor-1){
      c.jumping=true;
      c.t= -6;
    }
    if(keys[40]||keys[83]){
      c.t+=0.4;
    }

   if (c.jumping){
     c.y+=Math.abs(c.xVel)*0.5*c.t;
     c.t+=0.3;
    }
    if(c.y<=0){
      c.t=Math.abs(c.t);
    }

    if (c.y>=c.floor-1){
      c.y=c.floor-1;
      c.jumping = false;
    }
    else if (c.y<=c.floor-1){
      if(!c.jumping){
        c.jumping=true;
        c.t=5;
      }
    }
    if(c.y==c.floor-1&&enemies.length===0){
      enemies = [makeEnemy(100,h-160,200,2,0)];
    }

  }
  if (h-water.height<=c.y){
    over=true;
    
    if(playSound){
      die.play();
    }
    overAnim=true;
    $("#over").css("visibility","visible");
    water.vel=6;
  }

  c.rotate+=c.xVel/65;


}
function moveEnemy(e,c){

  if(!moveDown){
    e.x+=e.vel;
    if(e.width<e.widthTo){
      e.width+=(1+Math.abs(e.vel));
      e.drawX=e.x-e.width/2;
      if (e.width>=e.widthTo)e.widthTo-=e.widthChange*2;
    }
    else{
      e.width-=(1+Math.abs(e.vel));
      e.drawX=e.x-e.width/2;
      if (e.width<=e.widthTo)e.widthTo+=e.widthChange*2;
    }

    if (e.x+e.width/2>=w-40){
      e.vel=-Math.abs(e.vel);
    }
    else if (e.x-e.width/2<=40){
      e.vel=Math.abs(e.vel);
    }



    if(c.floor>=e.y+10){

      if(c.y+10<e.y&&c.y+70>e.y+10){
          if(c.x-3+c.xVel<=e.drawX+e.vel){
            c.x=e.drawX+Math.abs(c.xVel)*2+8;
            if(e.width>e.widthTo&&e.vel>0) c.x+=(1+e.vel);
            else if(e.width<e.widthTo&&e.vel<0) c.x+=(1+e.vel);
            else  c.x+=1;
            if(c.t>0){
              c.x+=10;
            }
          }
          if(c.x+80+c.xVel>=e.drawX+e.width){
            c.x=e.drawX+e.width-Math.abs(c.xVel)*2-80-8;
            if(e.width<e.widthTo&&e.vel>0) c.x-=(1+e.vel);
            else if(e.width>e.widthTo&&e.vel<0)c.x-=(1+e.vel);
            else c.x-=1;
            if(c.t>0){
              c.x-=10;
            }

          }
      }
      if (c.y<=e.y+20&&(c.x<e.drawX ||c.x+80> e.drawX+e.width)){
        c.t=Math.abs(c.t);
        c.y+=Math.abs(c.xVel)*0.5*c.t;
      }
      if (c.y<e.y&&(c.x<e.drawX ||c.x+80> e.drawX+e.width)){
        c.y=e.y-1;
        c.floor=e.y-80;
        if(enemies.length==e.index+1){
          score++;
          if(parseInt(highScore)<score){
            highScore=score;
            setCookie('hScore',highScore);
            $('#hScore').html('High Score: '+setCookie('hScore',''));
          }
          $('#score').html("Score: "+score);
          if(e.index===0)$('.inst').css("visibility", "hidden");
          if(water.vel===0)water.vel=0.385;
          if(playSound){
            if(e.y>360) up.play();
            else newlev.play();
          }

          var newX;
          var width=Math.random()*70+170;
          var num;
          if(w>e.width*3+100){
            var gap1=e.x-e.width;
            var gap2=e.x+e.width;
            if(gap1<50){
              num=w-gap2-50;
              newX=Math.random()*num+gap2;
            }
            else if(gap2+150>w-50){
              num=gap1-50;
              newX=Math.random()*num+50;
            }
            else{
              num=gap1+w-gap2-100;
              newX=Math.random()*num+10;
              if (newX>gap1)newX+=e.width*2;
            }
          }
          else newX=Math.random()*(w-300)+50;

          enemies[e.index+1]=makeEnemy(newX,e.y-160,width,Math.random()*2.5+2,e.index+1);

          if (w>1200)enemies[e.index-1].width+=(w-1200)/7.6;
          if(e.y<=360){
            theme=Math.floor(Math.random()*32);
            moveDown=true;
            moveDownTo=enemies[1].y;
            c.y-=90;
            c.x+=c.xVel;
          }
        }
      }
    }

    else if (c.floor==e.y-80&&c.x>e.drawX&&c.x+80< e.drawX+e.width&&c.y>=c.floor-70){
      c.floor=e.y+80;
    }
  }
  else{
    if(enemies[enemies.length-1].y>=moveDownTo&&e.index===0){
      moveDown=false;

      enemies=[enemies[enemies.length-2],enemies[enemies.length-1]];
      enemies[0].index=0;
      enemies[1].index=1;
      c.y+=90;
     levelSets++;
      water.vel+=(0.345/(2*Math.sqrt(levelSets*5/6)))*(h/900);
      c.xPlus+=(0.30/(2*Math.sqrt(levelSets)))*(h/1000) ;
      if (water.height<=0)water.height=-water.vel* 20;
      c.floor=enemies[0].y-80;
    }
    else {
      e.y+=10;
    if(e.index===0){
      c.y+=10;
      c.floor+=10;
      water.height-=10;
    }
    }


  }
}

function draw(c){
 context.fillStyle="black";
  context.lineWidth="3";
  for(var i = c.rotate; i<Math.PI*2-0.0001+c.rotate; i+=Math.PI/11 ){
    context.strokeStyle = col[Math.round((i-c.rotate)/Math.PI*6)];

    for(var j = 35; j>0;j-=10){

       context.beginPath();
      context.arc((c.x+40)-Math.cos(i-j/10)*j, (c.y+40)-Math.sin(i-j)*j, 5, 0, Math.PI*2, true);
      context.closePath();
      context.stroke();
      context.fill();

    }

  }
  context.fillStyle="";

}
function drawWater(wa){
  var val=50;
  var i=0;
  for(i= wa.height;i>-10;i-=5){
    val=Math.random()*1+30;
    context.fillStyle="hsla(0,100%,"+val+"%,0.5)";
    context.fillRect(0,h-i,w,10.1);
  }
 if(!paused){
   if (wa.height+wa.vel<h&&!moveDown)wa.height+=wa.vel;
   else if(moveDown)wa.height-=wa.vel/35;
   else{
     c=null;
     enemies=[];
     overAnim=false;
   }
 }

}

function drawEnemy(e){
  context.strokeStyle='black';
  context.lineWidth=1.5;
  context.strokeRect(0,e.y,e.drawX,10);
  context.strokeRect(e.drawX+e.width,e.y,w,10);
  context.fillStyle = themes[theme][1];
  context.fillRect(0,e.y+1.5,e.drawX,7);
   context.fillRect(e.drawX+e.width,e.y+1.5,w,7);
}

var col = ['red','orangered','yellow','lime','aqua','fuchsia','red','orangered','yellow','lime','aqua','fuchsia'];
var themes = [['black','white'],['blueviolet','#B0E0E6 '], ['darkslategrey','cyan'], ['midnightblue','deeppink'], ['maroon','whitesmoke'], ['darkslateblue','bisque'], ['navy','fuchsia'], ['dimgrey','lime'], ['#651a1a','lavender'], ['teal','palegreen'], ['lightgrey','black'], ['darkgreen','aliceblue'],['indigo','gold'],['orangered','moccasin'], ['khaki','crimson'],['turquoise','coral'],['pink','yellow'],['purple','gray'],['blue','yellow'],['teal','pink'],['cyan','purple'],['#2efa91','#864991'],['black','red'],['black','gold'],['silver','black'],['green','black'],['brown','orange'],['green','yellow'],['blue','orange'],['midnightblue','brick'],['#ff0080','lime'],['silver','blue']];

var character=makeChar(0,h-80,6,w);
character.xMult=w/1100;
if(character.xMult<1.225)character.xMult=1.225;
else if (character.xMult>1.35)character.xMult=1.35;
var enemies = [makeEnemy(100,h-160,200,2,0)];
if (w>1200)enemies[0].width+=(w-1200)/7.9;
var water = makeWater(0);

function updateAll(over,themes,theme,character,enemies,water,overAnim){
  if((keys[49]||keys[97])&&(keys[50]||keys[98])&&(keys[55]||keys[103])) {
    if(extras.tilt.now!=extras.tilt.next&&!extras.tilt.now){

      tilt=(Math.random()*Math.PI/10)-Math.PI/20;
      prevTilt=tilt;
    }
    else tilt=0;
    extras.tilt.now=extras.tilt.next;
    if(extras.tilt.now){
      if(tilt!==0)context.translate(-w/2*tilt,-h/2*tilt);
      context.rotate(tilt);
      if(tilt!==0)context.translate(w/2*tilt,h/2*tilt);
      tilt=0;

    }
    else{
      if(prevTilt!==0)context.translate(-w/2*prevTilt,-h/2*prevTilt);
      context.rotate(-prevTilt);
      if(prevTilt!==0)context.translate(w/2*prevTilt,h/2*prevTilt);

      tilt=0;
      prevTilt=0;

    }
  }
  else if(extras.tilt.now==extras.tilt.next)extras.tilt.next=!extras.tilt.next;
  if (!over){
    context.fillStyle = themes[theme][0];
  context.fillRect(0,0,canvas.width, canvas.height);
  for(var i=0;i<h;i+=1000){
    for(var j=0;j<w;j+=1000){
      context.drawImage(background,j,i,1000,1000);
    }
  }

    if(!paused)move(character);
    draw(character);
    for(var i=enemies.length;i>0;i--){
      if(!paused)moveEnemy(enemies[i-1],character);
      drawEnemy(enemies[i-1]);
     }

    drawWater(water);

  }
  else if (overAnim){

    drawWater(water);
    draw(character);
    for(var j=enemies.length;j>0;j--){
      drawEnemy(enemies[j-1]);
     }
  }
}



$("#overbtn").click(function(){
  over=false;

  $("#over").css("visibility","hidden");
  $('.inst').css("visibility","visible");

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  $('.inst').css('visibility','hidden');
}
  character=makeChar(0,h-80,6,w);
  character.xMult=w/1100;
if(character.xMult<1.225)character.xMult=1.225;
else if (character.xMult>1.35)character.xMult=1.35;
  enemies = [makeEnemy(200,h-160,200,2.7,0)];
  if (w>1200)enemies[0].width+=(w-1200)/7;
  water = makeWater(0);
  score=0;
  $('#score').html("Score: "+score);

});



var keys = {};

  $("body").keydown(function(event){
    keys[event.which] =true;
 });

  $("body").keyup(function(event){
    delete  keys[event.which];
 });
 $(window).resize(function(){
   var move=false;
   var ind=0;
   var hDiff= h -$(window).height()+10;
   var wDiff=w-$(window).height()+10;
   var wDiff2=wDiff;
   if(w>1200){
     if($(window).width()-10<1200)wDiff=w-1200;
     else wDiff=w-$(window).width()+10;
   }
   else{
     if($(window).width()-10<1200) wDiff=0;
     else wDiff =w-$(window).width()+10;
   }

   if(w>$(window).width()-10){
     if(w>=1485){
       if($(window).width()-10>=1485)wDiff2=0;
       else if($(window).width()-10<=1100)wDiff2=1485-1100;
       else wDiff2=1485-$(window).width()+10;
     }
     else if (w<=1100)wDiff2=0;
     else{
       if($(window).width()-10<=1100)wDiff2=w-1100;
       else wDiff2=w-$(window).width()+10;
     }
   }
   else if (w==$(window).width()-10)wDiff2=0;
   else{
     if($(window).width()-10>=1485){
       if(w>=1485)wDiff2=0;
       else if(w<=1100)wDiff2=1100-1485;
       else wDiff2=w-1485;
     }
     else if ($(window).width()-10<=1100)wDiff2=0;
     else{
       if(w<=1100)wDiff2=1100-$(window).width()+10;
       else wDiff2=w-$(window).width()+10;
     }
   }

   h = $(window).height()-10;
   w=$(window).width()-10;

   character.xMult-=wDiff2/1100;
   $('canvas').remove();
    canvas = document.createElement("canvas");
   context = canvas.getContext("2d");
     canvas.width = w;
     canvas.height = h;
     $('body').append(canvas);
   $("#over").css("left",w/2-$('#over').width()/2);
   $('h1').css("font-size",w/16+"px");
   $('#overbtn').css('width',w/16*9+'px');
   $("#overbtn").css("left",w/2-$('#overbtn').width()/2);
   $('#overbtn').css('width',$('#overbtn').width()+( -w/11));

   for(var i =0;i<enemies.length;i++){
     if(enemies[i].drawX+enemies[i].width>=w-10){
       enemies[i].x=-enemies[i].width/2+w-10;
       enemies[i].drawX=enemies[i].x-enemies[i].width/2;
       enemies[i].width-=wDiff/1200;
       enemies[i].widthTo-=wDiff/1200;
     }
      enemies[i].y-=hDiff;
     if(enemies[i].y<=200){
       while(enemies[i]<enemies.length)delete enemies[i];
       move=true;
       ind=i-1;
       i-=1;
       break;

     }
   }
   if(character.x+80>=w)character.x=w-90;
   character.y-=hDiff;
   character.floor-=hDiff;
   if (move){
     enemies[e.index+1]=makeEnemy(Math.random()*(w-300)+50,e.y-160,Math.random()*70+170,Math.random()*2.5+2,e.index+1);
     moveDown=true;
     moveDownTo=enemies[1].y;
     character.y-=90;
     character.x+=character.xVel*5;
   }
   updateAll(over,themes,theme,character,enemies,water,overAnim);

 });

 $('#sound').click(function(){
  playSound=!playSound;
  if(!playSound)$('#sound').html('<span class="glyphicon glyphicon-volume-up"></span>');
  else $('#sound').html('<span class="glyphicon glyphicon-volume-off"></span>');
 });
 $('#pause').click(function(){
  paused=!paused;
  if(!paused)$('#pause').html('<span class="glyphicon glyphicon-pause"></span>');
  else $('#pause').html('<span class="glyphicon glyphicon-play"></span>');
 });
 $('#rainbow').click(function(){col=['red','orangered','yellow','lime','aqua','fuchsia','red','orangered','yellow','lime','aqua','fuchsia']; });
 $('#gray').click(function(){col=['white','darkslategrey','lightgrey','darkgrey','dimgrey','black','white','darkslategrey','lightgrey','darkgrey','dimgrey','black']; });
 $('#red').click(function(){col=['red','magenta','crimson','maroon','orangered','mediumvioletred','red','magenta','crimson','maroon','orangered','mediumvioletred']; });
 $('#blue').click(function(){col=['blue','aquamarine','navy','cyan','indigo','skyblue','blue','aquamarine','navy','cyan','indigo','skyblue']; });
 $('#green').click(function(){col=['green','lime','olive','lawngreen','forestgreen','limegreen','green','lime','olive','lawngreen','forestgreen','limegreen']; });
 $('#light').click(function(){col=['lightpink','lightsalmon','lemonchiffon','lightgreen','skyblue','lavender','lightpink','lightsalmon','lemonchiffon','lightgreen','skyblue','lavender']; });
 $('#dark').click(function(){col=['darkred','brown','darkgoldenrod','darkgreen','darkslategrey','darkmagenta','darkred','brown','darkgoldenrod','darkgreen','darkslategrey','darkmagenta']; });

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  $('.inst').css('visibility','hidden');
 $(document).click (function (){
    if (event.pageY < h/2){
       keys [38]=true;
       delete keys [40];
    }
    if (event.pageY >= h/2){
       keys [40]=true;
       delete keys [38];
    }
    if (event.pageX > w/2){
       keys [39]=true;
       delete keys [37];
    }
    if ( event.pageX <= w/2){
       keys [37]=true;
       delete keys [39];
    }
 });
 $(document).mouseup (function (){
   delete keys [37];
   delete keys [39];
   delete keys [40];
   delete keys [38];

 });
}
