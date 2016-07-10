var lastLetter = "";
var divLen=0;
//var text = "<body id =\"index\"><nav class=\"navbar navbar-inverse navbar-fixed-top\"><div class=\"container-fluid\"><div class=\"navbar-header\><button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#bs-example-navbar-collapse-1\" aria-expanded=\"false\"><span class=\"sr-only\">Toggle navigation</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button><a class=\"navbar-brand\" id = \"brand\" href=\"#\"><img alt=\"Brand\" width=\"35px\" height=\"35px\"src=\"res/icon.png\"></a></div>";
var text = " ********** \"Peace is its own reward\"-Mahatma Gandhi ********** \"It always seems impossible until its done.\"-Nelson Mandela ********** \"We don't get a chance to do that many things, and every one should be really excellent. Because this is our life. Life is brief, and then you die, you know? And we've all chosen to do this with our lives. So it better be damn good. It better be worth it.\"-Steve Jobs ********** \"Keep your eyes on the stars, and your feet on the ground.\"-Theodore Roosevelt ********** \"Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning.\"-Albert Einstein ********** \"The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.\"-Hellen Keller ********** \"That's been one of my mantras-focus and simplicity. Simple can be harder than complex; you have to work hard to get your thinking clean to make it simple\"-Steve Jobs";
var len = text.length;
var w;
var lastL = 0;
var thisL = 0;
var fps;
var temp;
$(window).load(function(){
  w = parseInt($(window).width());
  $(".main").css("margin-top",$("nav").css("height"));
  $(".main").css({"margin-top":"+=40px","height":"-="+$("nav").css("height")});
  $("body").css("height","-="+$("nav").css("height"));
  $(".scroll").css({"margin-top":$("nav").css("height"),"width":(len*15).toString()+"px"});
  $(".scroll").text(text);
  lastL = new Date-16;
  draw();
});

$(window).resize(function(){
  $(".main").css("margin-top",$("nav").css("height"));
  $(".main").css("margin-top","+=40px")
  $("body").css("height","90%");
  $(".main").css("height","85%");
  $(".main").css("height","-="+$("nav").css("height"));
  $("body").css("height","-="+$("nav").css("height"));
  $(".scroll").css("margin-top",$("nav").css("height"));

});

function draw() {

    var f = requestAnimationFrame(draw);
    thisL = new Date;
    fps = 1000/(thisL-lastL);
    lastL = thisL;
    temp = 60.0/fps;

    // Drawing code goes here
    $(".scroll").css({"left":"-="+(2*temp).toString()+"px"});
    divLen+=2*temp;
    //console.log(divLen-(15*len-w));
    if (divLen>=15*len-w-45){
      text = text.slice(len-divLen/15+1,len)+text.slice(0,len-(divLen/15)+1);
      $(".scroll").css({"left":"0px"});
      $(".scroll").text(text);
      divLen = 0;
    }

}
