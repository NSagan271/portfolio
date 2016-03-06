// noprotect
var h = $(window).height()-10;
var w=$(window).width()-10;

$("#over").css("left",w/2-$('#over').width()/2);
$('h1').css("font-size",w/16+"px");
$('ovebtn').css('width',w/16*9+'px');
$("overbtn").css("left",w/2-$('button').width()/2);
$('overbtn').css('width',$('button').width()+( -w/11));
var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;
  $('body').append(canvas);

context.fillStyle = "black";
context.fillRect(0,0,canvas.width, canvas.height);
var game_is_running=true;
var moveDown=false;
var moveDownTo;
var score=0;
var over=false;
var overAnim = false;
var theme=0;
var playSound=true;
var audio;


function makeChar(x,y,xVel,w,colors,mainColor){
  return{
    x:x,
    y:y,
    xVel:xVel,
    t:0,
    rotate:0,
    jumping:false,
    w:w,
    colors:colors,
    mainColor:mainColor,
    floor:h-80,
    xMult:1.1,
    moveX:true,
  };
}

function makeEnemy(splitX,y,splitW,vel,index){
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

function move(c){
  if(!moveDown){
    if (keys[39] || keys[68]){
      c.xVel=Math.abs(c.xVel);
      if(c.x+10<=w-80) c.x+=c.xVel*c.xMult;
      else c.x=1;
    }
    if (keys[37] || keys[65]){
      c.xVel=-Math.abs(c.xVel);
      if(c.x>=0) c.x+=c.xVel*c.xMult;
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
      audio = new Audio('sounds/die.mp3');
      audio.play();
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
            else  c.x+=10;
            if(c.t>0){
              c.y+=20;
              c.x+=10;
            }
          }
          if(c.x+88+c.xVel>=e.drawX+e.width){
            c.x=e.drawX+e.width+Math.abs(c.xVel)*2-80-8;
            if(e.width<e.widthTo&&e.vel>0) c.x-=(1+e.vel);
            else if(e.width>e.widthTo&&e.vel<0)c.x-=(1+e.vel);
            else c.x-=10;
            if(c.t>0){
              c.y+=20;
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
          $('#score').html("Score: "+score);
          if(e.index===0)$('.inst').css("visibility", "hidden");
          if(water.vel===0)water.vel=0.2;
          if(playSound){
            if(e.y>360) audio = new Audio('sounds/up.mp3');
            else  audio = new Audio('sounds/newlev.mp3');
            audio.play();
          }
          enemies[e.index+1]=makeEnemy(Math.random()*(w-300)+50,e.y-160,Math.random()*70+170,Math.random()*2.5+2,e.index+1);
          if (w>1200)enemies[e.index-1].width+=(w-1200)/7.6;
          if(e.y<=360){
            theme=Math.floor(Math.random()*32);
            moveDown=true;
            moveDownTo=enemies[1].y;
            c.y-=90;
            c.x+=c.xVel*5;
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
      water.vel+=0.08;
      c.xMult+=0.02 ;
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
    context.strokeStyle = c.colors[Math.round((i-c.rotate)/Math.PI*6)];

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
  context.fillStyle="hsla(0,100%,50%,0.5)";
  context.fillRect(0,h-wa.height,w,h);
  if (wa.height+wa.vel<h&&!moveDown)wa.height+=wa.vel;
  else if (moveDown)wa.height-=1;
  else{
    c=null;
    enemies=[];
    overAnim=false;
  }
}

function drawEnemy(e){
  context.fillStyle = themes[theme][1];
  context.fillRect(0,e.y,e.drawX,10);
   context.fillRect(e.drawX+e.width,e.y,w,10);
}

var col = ['red','orangered','yellow','lime','aqua','fuchsia','red','orangered','yellow','lime','aqua','fuchsia'];
var themes = [['black','white'],['blueviolet','#B0E0E6 '], ['darkslategrey','cyan'], ['midnightblue','deeppink'], ['maroon','whitesmoke'], ['darkslateblue','bisque'], ['navy','fuchsia'], ['dimgrey','lime'], ['#651a1a','lavender'], ['teal','palegreen'], ['lightgrey','black'], ['darkgreen','aliceblue'],['indigo','gold'],['orangered','moccasin'], ['khaki','crimson'],['turquoise','coral'],['pink','yellow'],['purple','gray'],['blue','yellow'],['teal','pink'],['cyan','purple'],['#2efa91','#864991'],['black','red'],['black','gold'],['silver','black'],['green','black'],['brown','orange'],['green','yellow'],['blue','orange'],['midnightblue','brick'],['#ff0080','lime'],['silver','blue']];

var character=makeChar(0,h-80,6,w,col,'white');
character.xMult=w/1100;
if(character.xMult<1)character.xMult=1;
else if (character.xMult>1.35)character.xMult=1.35;
var enemies = [makeEnemy(100,h-160,200,2,0)];
if (w>1200)enemies[0].width+=(w-1200)/7.9;
var water = makeWater(0);

function updateAll(over,themes,theme,character,enemies,water,overAnim){
  if (!over){
    context.fillStyle = themes[theme][0];
  context.fillRect(0,0,canvas.width, canvas.height);

    move(character);
    draw(character);
    for(var i=enemies.length;i>0;i--){
      moveEnemy(enemies[i-1],character);
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

setInterval(function(){updateAll(over,themes,theme,character,enemies,water,overAnim);},31);

$("#overbtn").click(function(){
  over=false;

  $("#over").css("visibility","hidden");
  $('.inst').css("visibility","visible");

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  $('.inst').css('visibility','hidden');
}
  character=makeChar(0,h-80,6,w,col,'white');
  character.xMult=w/1100;
if(character.xMult<1)character.xMult=1;
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
       if(w<=1100)wDiff2=1100-w;
       else wDiff2=$(window).width()-10-w;
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
   $('overbtn').css('width',w/16*9+'px');
   $("overbtn").css("left",w/2-$('overbtn').width()/2);
   $('overbtn').css('width',$('overbtn').width()+( -w/11));

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
