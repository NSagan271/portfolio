// noprotect

//find window height and width*****************************************
var h = $(window).height()-10;
var w=$(window).width()-10;

//set button and text position*****************************************
$("#over").css("left",w/2-$('#over').width()/2); //centered
$('h1').css("font-size",w/16+"px"); //text size
$('#ovebtn').css('width',w/16*9+'px'); //button position
$("#overbtn").css("left",w/2-w/16*4.5);
$('#overbtn').css('width',w/16*9+( -w/11));

//canvas set-up*****************************************
var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;
  var background= document.createElement('img');
  background.src="img/back.png";
  context.fillStyle = "black";
  context.fillRect(0,0,canvas.width, canvas.height); //black background

//variables*****************************************
var levelSets=0;
var paused=false;
var highScore=0;
var score=0;

var deathByBomb;
var explodeCount=20;

/*Everything moves down
once the character reaches
the top of the screen******************************************/
var moveDown=false;
var moveDownTo;



//game over****************************************
var over=false;
var overAnim = false; //water filling the screen all the way

//audio/visual
var theme=0;
var playSound=true;
var die = new Audio('sounds/die.mp3');
die.load();
var newlev=new Audio('sounds/newlev.mp3');
newlev.load();
var up = new Audio('sounds/up.mp3');
up.load();
var explode = new Audio('sounds/explode.mp3');
explode.load();

//easter egg: tilt screen****************************************
var tilt;
var prevTilt;
var extras={tilt:{now:false,next:true},pause:{now:false,next:true}}; //object allowing for multiple add-ons: tilt, pause


$(window).load(function(){//when window loads

//load high score from cookie****************************************
  highScore=getCookie('hScore'); //
  if(highScore===''){//cookie not found
    highScore=0; //default value is 0
    $('#hScore').html("High Score: 0"); //update high score text
  }
  else $('#hScore').html("High Score: "+highScore); //update high score text

  //add canvas***************************************
  $('body').append(canvas);
  setInterval(function(){updateAll(over,themes,theme,character,enemies,water,overAnim);},31); //game loop

  //tilt screen***************************************
  setInterval(function(){
    if(extras.tilt.now&&!paused){ //set to tilt and game is not paused
      if(prevTilt!==0)context.translate(-w/2*prevTilt,-h/2*prevTilt); //translated so that the canvas rotates around the center
      context.rotate(-prevTilt);   //return to regular rotation; reverse previous rotation
      if(prevTilt!==0)context.translate(w/2*prevTilt,h/2*prevTilt); //returning canvas to normal loaction

      tilt=Math.random()*Math.PI/10-Math.PI/20; //rotate to a random position
      prevTilt=tilt;//(prevTilt is set so that this rotation can be reversed)
      if(tilt!==0)context.translate(-w/2*tilt,-h/2*tilt);//translated so that the canvas rotates around the center
      context.rotate(tilt); //tilt canvas
      if(tilt!==0)context.translate(w/2*tilt,h/2*tilt);//returning canvas to normal loaction
    }
  },1500);
});

function makeChar(x,y,xVel,w){//make a character object**********************************************
  return{ //returns the object
    x:x, // x and y position
    y:y,
    xVel:xVel, //x velocity
    t:0,//used to determine y velocity: dy= d/dt(kt^2)*dx/dt
    rotate:0, //the character consists of different colored circles aranged in a circle
    //and their positions rotate
    jumping:false, //not jumping
    w:w, //width of character
    floor:h-80, //the character has to stay above a certain y-value
    xMult:1.1, //making the x-velocity faster w/o changing the jump height
    xPlus:0, //is added onto the x velocity (increasing it at a constant rate)
    xMo:0 //accounts for momentum when the character stops moving left and right
    };
}

function makeEnemy(splitX,y,splitW,vel,index){//make a hoizontal bar with an opening across the screen****************************
 var a =Math.random()*25+25; //the value to which the the width of the gap will change
  if(splitX-splitW/2<10)splitX=splitW/2+10; //making sure that the gap is not off the screen
  if(splitX+splitW/2>w-10)splitX=-splitW/2+w-10;
  return{//returns object
    x:splitX,//x position of gap
    y:y, //y position of bar
    width:splitW, //width of gap
    vel:vel, //velocity of gap moving left and right
    index:index, // the number of bars produced before
    widthChange:a, //the amount that the width of the gap can change from the set width
    widthTo:splitW-a, //the target width
    drawX:splitX-splitW/2, //the x value is halfway between the two edges of the gap. This is the left edge.
  };
}

function makeWater(vel){ //the water/blood rising from the bottom of the screen************************
  return{//returns object
    height:0,
    vel:vel //the speed of the increase in height
  };
}

function makeBomb(x,y,yVel,xVel){//After level 6, bombs fall from the top of the screen**************
  var bomb= document.createElement('img');//image
  bomb.src="img/bomb.png";
  return{//returns object
    x:x,//position
    y:y,
    width:50,
    img:bomb,
    yVel:yVel,//velocity
    xVel:xVel,
    untilTurn:20//when the bomb moves back and forth, it changes direction
                //when untilTurn==0 (the variable decreases every time the bomb moves)
  };
}

function setCookie(cname, cvalue) {//save a cookie******************************************************
      document.cookie = cname + "=" + cvalue + "; ";
      return "";
}
function getCookie(cname){//retrieve a cookie***********************************************************
      var name = cname + "=";
      var ca = document.cookie.split(';'); //separating multiple cookies
      for(var i=0; i<ca.length; i++) {//check for the given cookie name
        var c = ca[i];//cookie at index i
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length); // return cookie value
      }
      return "";//if the cookie doesn't exist
}


function move(c){//move the character*******************************************************************
  if(!moveDown){ //regular gameplay
    if (keys[39] || keys[68]){//moving right
      c.xVel=Math.abs(c.xVel);//x value increasing
      if(c.x+10<=w-80) c.x+=(c.xVel*c.xMult+c.xPlus);
      else c.x=1; //appearing of the opposite side of the screen
    }
    if (keys[37] || keys[65]){//moving left
      c.xVel=-Math.abs(c.xVel);//x value decreasing
      if(c.x>=0) c.x+=(c.xVel*c.xMult-c.xPlus);
      else c.x=w-81; //appearing on the opposite side of the screen
    }
    if (c.xMo !==0) {//c.Mo stands for momentum; it is used to slow down the character before stopping completely
       c.x+=c.xMo;//slowly increasing x
       c.xMo/=1.3;//decreasing momentum
       if (Math.abs (c.xMo) <=0.4) c.xMo =0;//completely stop character
    }

    if((keys[38]||keys[87]||keys[32])&&!c.jumping&&c.y>=c.floor-1){ //jumping (if not already jumping)
      c.jumping=true;
      c.t= -6; //see  line 191(*!*!*)
    }
    if(keys[40]||keys[83]){//move down manually
      c.t+=0.4;
    }

   if (c.jumping){//jumping
     c.y+=Math.abs(c.xVel)*0.5*c.t;//(*!*!*)the velocity is the derivative of a parabola
                                  //dy/dx(0.25t^2)--> dy = 2*0.25t dx
     c.t+=0.3; //increasing t to change the velocity
    }

    if (c.y>=c.floor-1){//prevent character from going through level floor
      c.y=c.floor-1;
      c.jumping = false; //stops jumping
    }
    else if (c.y<c.floor-1){//falling through a hole in a level
      if(!c.jumping){
        c.jumping=true;
        c.t=5;//gmakes the y value of the character increase (character)
      }
    }
    /*if(c.y==c.floor-1&&enemies.length===0){ doesn't seem to make a difference
      enemies = [makeEnemy(100,h-160,200,2,0)];
    }*/

  }
  if (h-water.height<=c.y){//the character is completely submerged
    over=true;//game over

    if(playSound){//
      die.play();
    }
    overAnim=true;//the water rises to the top of the screen
    $("#over").css("visibility","visible");//GAME OVER text
    water.vel=6; //faster water
  }

  if(c.xVel>0)c.rotate+=(c.xVel+c.xPlus)/65; //rotates positions of circles in character
  else c.rotate+=(c.xVel-c.xPlus)/65;


}
function moveEnemy(e,c){//move a bar going across the screen**************************************************

  if(!moveDown){
    e.x+=e.vel;//changing position
    if(e.width<e.widthTo){//increasing width of gap
      e.width+=(1+Math.abs(e.vel));
      e.drawX=e.x-e.width/2;//changing where the bars are based on the width of the gap
      if (e.width>=e.widthTo)e.widthTo-=e.widthChange*2;//changing direction of width change (--> decreasing)
    }
    else{//decreasing width
      e.width-=(1+Math.abs(e.vel));
      e.drawX=e.x-e.width/2;//changing where the bars are drawn
      if (e.width<=e.widthTo)e.widthTo+=e.widthChange*2;//changing direction of width change
    }

    if (e.x+e.width/2>=w-40){//changing direction of bar movement when the gap reaches the edge of the screen
      e.vel=-Math.abs(e.vel);//going left
    }
    else if (e.x-e.width/2<=40){
      e.vel=Math.abs(e.vel); //going right
    }

    if(c.floor>=e.y+10){//the character is below the bar

      if(c.y+10<e.y&&c.y+70>e.y+10){//the character is inside the gpa between the bars
          if(c.x-3+c.xVel<=e.drawX+e.vel){//hitting left bar
            c.x=e.drawX+Math.abs(c.xVel)*2+8;//character bounces back
            if(e.width>e.widthTo&&e.vel>0) c.x+=(1+e.vel);//compensating for gap width changing
            else if(e.width<e.widthTo&&e.vel<0) c.x+=(1+e.vel);
            else  c.x+=1;
            if(c.t>0){//used to determine if the character is falling from a higher level
              c.x+=10;//prevents a glitch where the character jumps up
            }
          }
          if(c.x+80+c.xVel>=e.drawX+e.width){//hitting right bar
            c.x=e.drawX+e.width-Math.abs(c.xVel)*2-80-8;//character bounces back
            if(e.width<e.widthTo&&e.vel>0) c.x-=(1+e.vel);//compensating for gap width changing
            else if(e.width>e.widthTo&&e.vel<0)c.x-=(1+e.vel);
            else c.x-=1;
            if(c.t>0){//used to determine if the character is falling from a higher level
              c.x-=10;//prevents a glitch where the character jumps up
            }

          }
      }
      if (c.y<=e.y+20&&(c.x<e.drawX ||c.x+80> e.drawX+e.width)){//character hitting the bottom of the bar
        c.t=Math.abs(c.t);//bouncing back
        c.y+=Math.abs(c.xVel)*0.5*c.t;
      }
      if (c.y<e.y&&(c.x<e.drawX ||c.x+80> e.drawX+e.width)){//jumping onto the bar
        c.floor=e.y-80;//changing where the "floor" is for the character
        if(enemies.length==e.index+1){//new level
          score++;
          if(parseInt(highScore)<score){//updating high score
            highScore=score;
            setCookie('hScore',highScore);//updating cookie
            $('#hScore').html('High Score: ' + highScore);//updating html
          }
          $('#score').html("Score: "+score);//updaing html
          if(e.index===0)$('.inst').css("visibility", "hidden");//hiding instructions (if level 1)
          if(water.vel===0)water.vel=0.385;//starting water rising
          if(playSound){//plays a 'beep' sound
            if(e.y>360) up.play();
            else newlev.play();
          }
          //the following code prevents the gap between the bars for the next level is not directly
          //on top of the gap for this level
          var newX;//x value of the new gameplay
          var width=Math.random()*70+170;//next gap width
          var num; //the number of positions the new bar can start from
          if(w>e.width*3+100){//enough space on the screen
            var gap1=e.x-e.width;//left limit for the new gap
            var gap2=e.x+e.width;//right limit
            if(gap1<50){//gap1 is too far right; the new gap is going to be to the right
              num=w-gap2-50;
              newX=Math.random()*num+gap2;
            }
            else if(gap2+150>w-50){//gap2 is too far left; the new gap is going to be to the left
              num=gap1-50;
              newX=Math.random()*num+50;
            }
            else{//the new gap can  be to the left or the right
              num=gap1+w-gap2-100;
              newX=Math.random()*num+10;
              if (newX>gap1)newX+=e.width*2;
            }
          }
          else newX=Math.random()*(w-300)+50; // if there is a narrow screen

          enemies[e.index+1]=makeEnemy(newX,e.y-160,width,Math.random()*2.5+2,e.index+1); //bar for next level

          if (w>1200)enemies[e.index-1].width+=(w-1200)/7.6;//increasing width for wider screens
          if(e.y<=360){//at the top of the screen
            theme=Math.floor(Math.random()*32);//changing colors
            moveDown=true;//everything has to move down to make foom for the next set of levels
            moveDownTo=enemies[1].y;
            c.y=e.y;
            c.y-=90;//prevents glitch (the character was drawn below the bar)
            c.x+=c.xVel;
          }
        }
      }
    }

    else if (c.floor==e.y-80&&c.x>e.drawX&&c.x+80< e.drawX+e.width&&c.y>=c.floor-70){//falling through the gap
      c.floor=e.y+80;

    }
  }
  else{ //if the screen is moving down
    if(enemies[enemies.length-1].y>=moveDownTo&&e.index===0){//finished moving down
      moveDown=false;

      enemies=[enemies[enemies.length-2],enemies[enemies.length-1]];//the enemies array only consists of the
                                                  //bars that are currently on the screen
      enemies[0].index=0;
      enemies[1].index=1;

      c.y+=90;//returning character to prooer position (had been previously moved up 90px)
     levelSets++;

      water.vel+=(0.25/(2*Math.sqrt(levelSets)))*(h/900);//increasing water's speed (using the derivative of a sqrt function)
      if(levelSets<3)water.vel+=(0.1/(2*Math.sqrt(levelSets)))*(h/1000);
      c.xPlus+=(0.18/(2*Math.sqrt(levelSets)))*(h/1000);//increasing the character's velocity based on the water's velocity
      if (water.height<=0)water.height=-water.vel* 20;//if the water is below the bottom of the screen
      c.floor=enemies[0].y-80;//changing "floor" variable

      if(score>=5){//creating a bomb object
        var bombXVel=0;
        if(score>=20)bombXVel=Math.random()*3+3;//bomb moving side to side

        if((score-5)/(Math.floor(bombs.length*3))>=bombs.length){//determining whether to add a bomb
          var bWidth = 50;
          //determining bomb width based on screen width
          if(w<=1400)bWidth=40;
          else if(w<1700&&w>1400)bWidth-=(1700-w)*0.033;
          else if(w<2100&&w>1700) bWidth-=(1700-w)*0.005;
          else if(w>=2100) bWidth=55;
          if(w>2500){ //creating an extra bomb if the screen is wide enough
            bombs[bombs.length]=makeBomb(Math.random()*(w-100)+25,0,Math.random()*3+3,bombXVel);
            bombs[bombs.length].width=bWidth;
          }
          //adding a bomb object
          bombs[bombs.length]=makeBomb(Math.random()*(w-100)+25,0,Math.random()*3+3,bombXVel);
          bombs[bombs.length].width=bWidth;
        }
      }

    }
    else {//still moving down
      e.y+=10;//everything goes down by 10
    if(e.index===0){
      c.y+=10;
      c.floor+=10;
      water.height-=10;
    }
    }


  }
}

function moveBomb(b,index){//moving a bomb object********************************************
  if(!paused&&!moveDown&&!over){//able to move
    b.y+=b.yVel;// changing x and y
    b.x+=b.xVel;
    if (b.x+b.width>=w-10||b.x<=10){//if the bomb is moving horizontally and bounces against a wall
      b.xVel*=-1;
      b.x+=2*b.xVel;
    }
    if(b.xVel!==0){//moving sideways
      b.untilTurn--;//decreasing time until the bomb turns around
      if(b.untilTurn<=0){
        b.xVel*=-1;//switching direction
        b.untilTurn = Math.random()*20+10;
      }
    }
    //character hits a bomb
    if(b.x<character.x+73&&b.x+b.width-b.width/4>character.x+10&&b.y+b.width>character.y+7&&b.y+b.width/4<character.y+73){
      over=true;

      context.fillStyle = themes[theme][0];//filling in the background
      context.fillRect(0,0,canvas.width, canvas.height);
      for(var i=0;i<h;i+=1000){
        for(var j=0;j<w;j+=1000){
          context.drawImage(background,j,i,1000,1000);
        }
      }
      deathByBomb=true;//different animation when this variable is true
      if(playSound){
        explode.play();//explosion sound
      }
    }
  }

  else if(moveDown){//moving down with the rest of the screen
    b.y+=10;
  }

  //after going past bottom of screen
  if(b.y>=h) bombs[index]=makeBomb(Math.random()*(w-50)+25,0,b.yVel,b.xVel);//appears on the top of the screen
  drawBomb(b);//drawing bomb
}

function draw(c){//drawing character*******************************************************************
 context.fillStyle="black";
  context.lineWidth="3";
  for(var i = c.rotate; i<Math.PI*2-0.0001+c.rotate; i+=Math.PI/11 ){//creating a circle of circles
                              //each is at the end of an line extending from the center at angle i
    context.strokeStyle = col[Math.round((i-c.rotate)/Math.PI*6)];//determining outline color

    //bomb explosion animation
    var times = 21 - explodeCount;
    if(deathByBomb){
      explodeCount--;//gradual explosion

    }

    for(var j = 35; j>0;j-=10){//there are three layers of circles

       context.beginPath();
       //position based on angle i (x = cos(i) and y= sin(i))
      context.arc((c.x+40)-Math.cos(i-j/10)*j*times, (c.y+40)-Math.sin(i-j)*j*times, 5, 0, Math.PI*2, true);
      if(times>1){//bomb explosion
        for (i=1+c.rotate;i<times+c.rotate;i++){//magic
          context.arc((c.x+40)-Math.cos(i-j/10)*j*times, (c.y+40)-Math.sin(i-j)*j*times, 5, 0, Math.PI*2, true);
        }
      }
      //finishing drawing a circle
      context.closePath();
      context.stroke();
      context.fill();

    }
    if (times>=20){//after a bmob explosion
      overAnim=true;//game over
      over=true;
      deathByBomb=false;
      bombs=[];

      $("#over").css("visibility","visible");
      water.vel=6;
    }

  }
  context.fillStyle="";

}
function drawWater(wa){//drawing rising water********************************************************
  var val=50;//determines color of a segement of water
  var i=0;

 if(!paused){
   if (wa.height+wa.vel<h&&!moveDown){//hasn't reached the top of the screen
     wa.height+=wa.vel;//increasing height
     for(i= wa.height;i>-10;i-=5){//filling in a segment
       val=Math.random()*1+30;
       context.fillStyle="hsla(0,100%,"+val+"%,0.5)";
       context.fillRect(0,h-i,w,10.1);
     }
   }

   else if(moveDown){//if moving down
     wa.height-=wa.vel/35;//the water moves down a little more (makes game easier)
     for(i= wa.height;i>-10;i-=5){
       val=Math.random()*1+30;//filling in segments
       context.fillStyle="hsla(0,100%,"+val+"%,0.5)";
       context.fillRect(0,h-i,w,10.1);
     }
   }
   else{//resetting all the objects after reaching the top of the screen
     c=null;
     enemies=[null];
     bombs=[null];
     water=null;
     overAnim=false;
     over = true;
   }
 }
 else{//when paused
   for(i= wa.height;i>-10;i-=5){
     val=Math.random()*1+30;
     context.fillStyle="hsla(0,100%,"+val+"%,0.5)";
     context.fillRect(0,h-i,w,10.1);
   }
 }

}

function drawEnemy(e){//drawing bars*********************************************************
  context.strokeStyle='black';//black outline
  context.lineWidth=1.5;
  context.strokeRect(0,e.y,e.drawX,10); //two rectangles: one on either side of the gap
  context.strokeRect(e.drawX+e.width,e.y,w,10);
  context.fillStyle = themes[theme][1]; //colored fill
  context.fillRect(0,e.y+1.5,e.drawX,7);//two rectangles: one on either side of the gap
   context.fillRect(e.drawX+e.width,e.y+1.5,w,7);
}
function drawBomb(b){//drawing bombs************************************************************
  context.drawImage(b.img,b.x,b.y,b.width+3.5,b.width+3.5);
}

//original set of colors for character
var col = ['red','orangered','yellow','lime','aqua','fuchsia','red','orangered','yellow','lime','aqua','fuchsia'];
//sets of colors for screen
var themes = [['black','white'],['blueviolet','#B0E0E6 '], ['darkslategrey','cyan'], ['midnightblue','deeppink'], ['maroon','whitesmoke'], ['darkslateblue','bisque'], ['navy','fuchsia'], ['dimgrey','lime'], ['#651a1a','lavender'], ['teal','palegreen'], ['lightgrey','black'], ['darkgreen','aliceblue'],['indigo','gold'],['orangered','moccasin'], ['khaki','crimson'],['turquoise','coral'],['pink','yellow'],['purple','gray'],['blue','yellow'],['teal','pink'],['cyan','purple'],['#2efa91','#864991'],['black','red'],['black','gold'],['silver','black'],['green','black'],['brown','orange'],['green','yellow'],['blue','orange'],['midnightblue','brick'],['#ff0080','lime'],['silver','blue']];

//creating a character
var character=makeChar(0,h-80,6,w);
//increasing speed if the screen is wider
character.xMult=w/1100;
if(character.xMult<1.225)character.xMult=1.225;
else if (character.xMult>1.35)character.xMult=1.35;
//first bar/level
var enemies = [makeEnemy(100,h-160,200,2,0)];
//increasing width of gap for wider screens
if (w>1200)enemies[0].width+=(w-1200)/7.9;
var water = makeWater(0);//water: velocity = 0
var bombs=[];//empty set (no bombs until level 6)

function updateAll(over,themes,theme,character,enemies,water,overAnim){//draw everything*****************
  if((keys[49]||keys[97])&&(keys[50]||keys[98])&&(keys[55]||keys[103])) { //setting screen tilt (easter egg)
    if(extras.tilt.now!=extras.tilt.next&&!extras.tilt.now){//pressing the keys for the first time when not tilting
                                                        //(as opposed to the keys being held down)

      tilt=(Math.random()*Math.PI/10)-Math.PI/20;//random tilt
      prevTilt=tilt;//used to reverse tilt
    }
    else tilt=0; //turning tilt feature
    extras.tilt.now=extras.tilt.next;
    if(extras.tilt.now){//tilting screen
      if(tilt!==0)context.translate(-w/2*tilt,-h/2*tilt);//rotating from middle of screen
      context.rotate(tilt);
      if(tilt!==0)context.translate(w/2*tilt,h/2*tilt);//translating back to the original position
      tilt=0;

    }
    else{//reversing tilt (back to normal)
      if(prevTilt!==0)context.translate(-w/2*prevTilt,-h/2*prevTilt);
      context.rotate(-prevTilt);
      if(prevTilt!==0)context.translate(w/2*prevTilt,h/2*prevTilt);

      tilt=0;//not tilted
      prevTilt=0;

    }
  }
  else if(extras.tilt.now==extras.tilt.next)extras.tilt.next=!extras.tilt.next;//keys released
  if (!over){//game running
    context.fillStyle = themes[theme][0];//filling background
  context.fillRect(0,0,canvas.width, canvas.height);
  for(var i=0;i<h;i+=1000){//drawing image (repeated x and y)
    for(var j=0;j<w;j+=1000){
      context.drawImage(background,j,i,1000,1000);
    }
  }
  if(keys[27]){//esc key pressed --> pause/unpause
    if(extras.pause.now!=extras.pause.next){//key pressed; not being held
      extras.pause.now=!extras.pause.now;
      paused=!paused;
      if(!paused){//changing button text
        $('#pauseInst').html('ESC <br>to pause');
        $('#pause').html('<span class="glyphicon glyphicon-pause"></span>');
      }
      else {//changing button text
        $('#pauseInst').html('ESC <br>to unpause');
        $('#pause').html('<span class="glyphicon glyphicon-play"></span>');
      }
    }
  }
  else if (extras.pause.now==extras.pause.next) extras.pause.next=!extras.pause.now;//key released

    if(!paused)move(character); //only move character if the game is not paused
    draw(character);

    for(var i=enemies.length;i>0;i--){//draw bars (only move if not paused)
      if(!paused)moveEnemy(enemies[i-1],character);
      drawEnemy(enemies[i-1]);
     }

    drawWater(water);//draw water
    for (var i=0;i<bombs.length;i++)moveBomb(bombs[i],i); //move bombs

  }
  else if (overAnim){//game over; water is still rising

    //draw elements (cannot move)
    drawWater(water);

    for(var j=enemies.length;j>0;j--){
      drawEnemy(enemies[j-1]);
     }
     draw(character);
     for (var i=0;i<bombs.length;i++)drawBomb(bombs[i]);

  }
  else if(deathByBomb){//bomb exploding


    for(var j=enemies.length;j>0;j--){
      drawEnemy(enemies[j-1]);
     }
     draw(character); //draw character on top of everything
     for (var i=0;i<bombs.length;i++)drawBomb(bombs[i]);
  }
  //nothing is drawn after the 'game over' animation
}



$("#overbtn").click(function(){//clicking RETRY button*********************************************
  over=false;//new game
  times=1;//resetting variables for bomb explosion
  explodeCount=20;
  bombs=[];
  $("#over").css("visibility","hidden");//hiding GAME OVER text
  $('.inst').css("visibility","visible");//showing instructions

  //if on a mobile browser
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  $('#top').html('tap on the <br>top/bottom/left/right <br> of the screen to move');
}
  character=makeChar(0,h-80,6,w);//new character
  character.xMult=w/1100;//adding to speed based on screen width
if(character.xMult<1.225)character.xMult=1.225;
else if (character.xMult>1.35)character.xMult=1.35;
  enemies = [makeEnemy(200,h-160,200,2.7,0)];//new bar/level
  if (w>1200)enemies[0].width+=(w-1200)/7;//increasing gap width based on screen width
  water = makeWater(0);
  score=0;//reset score
  $('#score').html("Score: "+score);//update score html

});

$('#reset').click(function(){//resets high score******************************************************
  setCookie('hScore',0);//setting cookie value to 0
  highScore=0;//setting variable
  $('#hScore').html('High Score: ' + 0);//upadting html
});

//code for key events*********************************************************************************
var keys = {};//key value object: stores key presses

  $("body").keydown(function(event){//key pressed
    keys[event.which] =true;//adding to key object
 });

  $("body").keyup(function(event){//when a key is released
    //set momentum for character
    if (event.which == 39 || event.which ==68 || event.which == 37 || event.which ==65) character.xMo = character.xVel/2;
    delete keys[event.which];//delete element

 });
 $(window).resize(function(){//resizing window*******************************************************
   var move=false;//whether screen will move down

   var h0 = h;//original height
   var wDiff=$(window).height()-10-w;//width difference
   h = $(window).height()-10;//new height and width
   w=$(window).width()-10;

   //changing speed of character based on width
   character.xMult=w/1100;
   if(character.xMult<1.225)character.xMult=1.225;
   else if (character.xMult>1.35)character.xMult=1.35;

   $('canvas').remove();//redraw canvas
   canvas = document.createElement("canvas");
   context = canvas.getContext("2d");
   canvas.width = w;
   canvas.height = h;
   $('body').append(canvas);

   //update width/size of over text and buttons
   $("#over").css("left",w/2-$('#over').width()/2);
   $('h1').css("font-size",w/16+"px");
   $('#overbtn').css('width',w/16*9+'px');
   $("#overbtn").css("left",w/2-$('#overbtn').width()/2);
   $('#overbtn').css('width',$('#overbtn').width()+( -w/11));

   for(var i =0;i<enemies.length;i++){//for each bar on the screen
     if(enemies[i].drawX+enemies[i].width>=w-10){//changing size of the gap depending of screen width
       enemies[i].x=-enemies[i].width/2+w-10;
       enemies[i].drawX=enemies[i].x-enemies[i].width/2;
       enemies[i].width+=wDiff/1200;
       enemies[i].widthTo+=wDiff/1200;
     }
     enemies[i].y = h-(h0-enemies[i].y);//the bars stay in the same place in relation to the bottom of the screen

   }
   for(var j= 0;j<bombs.length;j++){//changing the size of the bombs
     var bWidth = 50;
     //larger on a larger screen and vice versa
     if(w<=1400)bWidth=40;
     else if(w<1700&&w>1400)bWidth-=(1700-w)*0.033;
     else if(w<2100&&w>1700) bWidth-=(1700-w)*0.005;
     else if(w>=2100) bWidth=55;
     bombs[j]=makeBomb(Math.random()*(w-100)+25,0,Math.random()*3+3,bombXVel);//updating object
     bombs[j].width=bWidth;
     //maintaining bombs' position
     bombs[i].y=h-(h0-bombs[i].y);
     if (bombs[i].y<0)bombs[i].y=0;
     if(bombs[i].x>=w-60)bombs[i].x=w-61;
   }
   //everything stays in the same place in relation to the bottom of the screen
   character.y=h-(h0-character.y);
   character.floor=h-(h0-character.floor);
   if(character.x+80>=w)character.x=w-90; //preventing character from going off the screen
   while(enemies[0].y>h-150)delete enemies[0];//deleting bars that are too low
   var i;
   for(i=0;i<enemies.length;i++){//iterating over bars
     if(enemies[i].y<=200){//first bar that is (close to) above the screen
       move=true;//moving down
       break;
     }
   }

   if(character.y+80<=360){//if the character is above y=360
     character.y=enemies[enemies.length-1].y-80;//moving to a bar under that line
     character.floor=enemies[enemies.length-1].y-80;
   }

   if (move){//setting the screen to move down
     //making a new bar
     enemies[enemies.length]=makeEnemy(Math.random()*(w-300)+50,enemies[enemies.length-1].y-160,Math.random()*70+170,Math.random()*2.5+2,enemies.length);
     moveDown=true;
     moveDownTo=enemies[1].y;
   }
   updateAll(over,themes,theme,character,enemies,water,overAnim);//update everything

 });

 $('#sound').click(function(){//turning sound on/off*****************************************
  playSound=!playSound;//updating variable
  //updating buttons
  if(!playSound)$('#sound').html('<span class="glyphicon glyphicon-volume-up"></span>');
  else $('#sound').html('<span class="glyphicon glyphicon-volume-off"></span>');
 });
 $('#pause').click(function(){//pause button**************************************************
  paused=!paused;//pausing/unpausing game
  if(!paused){//updating buttons and text
    $('#pauseInst').html('ESC <br>to pause');
    $('#pause').html('<span class="glyphicon glyphicon-pause"></span>');
  }
  else {
    $('#pauseInst').html('ESC <br>to unpause');
    $('#pause').html('<span class="glyphicon glyphicon-play"></span>');
  }
 });

 //different color schemes for the character
 $('#rainbow').click(function(){col=['red','orangered','yellow','lime','aqua','fuchsia','red','orangered','yellow','lime','aqua','fuchsia']; });
 $('#gray').click(function(){col=['white','darkslategrey','lightgrey','darkgrey','dimgrey','black','white','darkslategrey','lightgrey','darkgrey','dimgrey','black']; });
 $('#red').click(function(){col=['red','magenta','crimson','maroon','orangered','mediumvioletred','red','magenta','crimson','maroon','orangered','mediumvioletred']; });
 $('#blue').click(function(){col=['blue','aquamarine','navy','cyan','indigo','skyblue','blue','aquamarine','navy','cyan','indigo','skyblue']; });
 $('#green').click(function(){col=['green','lime','olive','lawngreen','forestgreen','limegreen','green','lime','olive','lawngreen','forestgreen','limegreen']; });
 $('#light').click(function(){col=['lightpink','lightsalmon','lemonchiffon','lightgreen','skyblue','lavender','lightpink','lightsalmon','lemonchiffon','lightgreen','skyblue','lavender']; });
 $('#dark').click(function(){col=['darkred','brown','darkgoldenrod','darkgreen','darkslategrey','darkmagenta','darkred','brown','darkgoldenrod','darkgreen','darkslategrey','darkmagenta']; });

//mobile browser
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  $('#top').html('<br><br><br><br>tap on the top/bottom/left/right <br> of the screen to move');
  //character motion
 $(document).click( function(event){//move by tapping on the screen--> update key object
    if (event.pageY < h/2){//top half --> jumping
       keys [38]=true;
       delete keys [40];
    }
    if (event.pageY >= h/2){//bottom half--> going down
       keys [40]=true;
       delete keys [38];
    }
    if (event.pageX > w/2){//going right
       keys [39]=true;
       delete keys [37];
    }
    if ( event.pageX <= w/2){//going left
       keys [37]=true;
       delete keys [39];
    }
 });
}
