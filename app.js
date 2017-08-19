window.onload = function() {
    getTwitchData();
  };
  
  $("input").keyup(function() {
    var name = "";
    const MENU_ALL = "#menu li:nth-child(1)";
    const MENU_ONLINE = "#menu li:nth-child(2)";
    const MENU_OFFLINE = "#menu li:nth-child(3)";
    const CURRENTMENU = "8px solid rgb(127, 255, 0)";
    //alert($("#menu li:nth-child(1)").css("border-top"));
    if ($(MENU_ALL).css("border-top") == CURRENTMENU) {
      $("#twitchDisplay li").each(function(index) {
        name = $(this).find(".tName > div").html();
        if ($("input").val() === name.substring(0, $("input").val().length)) {
          $(this).css("display","block");
        } else {
          $(this).css("display","none");
        }
      });
    } else if ($(MENU_ONLINE).css("border-top") == CURRENTMENU) {
      $("#twitchDisplay li.online").each(function(index) {
        name = $(this).find(".tName > div").html();
        if ($(this).attr("class").indexOf("online")) {
          if ($("input").val() === name.substring(0, $("input").val().length)) {
            $(this).css("display","block");
          } else {
            $(this).css("display","none");
          }
        }
      });
    } else if ($(MENU_OFFLINE).css("border-top") == CURRENTMENU) {
      $("#twitchDisplay li.offline").each(function(index) {
        name = $(this).find(".tName > div").html();
        if ($(this).attr("class").indexOf("offline")) {
          if ($("input").val() === name.substring(0, $("input").val().length)) {
            $(this).css("display","block");
          } else {
            $(this).css("display","none");
          }
        }
      });
    }
  });
  
  $("#menuAll").click(function() {
    $(".online").css("display","block");
    $(".offline").css("display","block");
    $("#menu li:nth-child(1)").css("border-top","8px solid #7FFF00");
    $("#menu li:nth-child(2)").css("border-top","8px solid #1980e6");
    $("#menu li:nth-child(3)").css("border-top","8px solid #1980e6");
    $("input").val("");
  });
  
  $("#menuOnline").click(function() {
    $(".online").css("display","block");
    $(".offline").css("display","none");
    $("#menu li:nth-child(1)").css("border-top","8px solid #1980e6");
    $("#menu li:nth-child(2)").css("border-top","8px solid #7FFF00");
    $("#menu li:nth-child(3)").css("border-top","8px solid #1980e6");
    $("input").val("");
  });
  
  $("#menuOffline").click(function() {
    $(".online").css("display","none");
    $(".offline").css("display","block");
    $("#menu li:nth-child(1)").css("border-top","8px solid #1980e6");
    $("#menu li:nth-child(2)").css("border-top","8px solid #1980e6");
    $("#menu li:nth-child(3)").css("border-top","8px solid #7FFF00");
    $("input").val("");
  });
  
  function getTwitchData() {
    getStatus("freecodecamp","Free Code Camp");
    getFollows();
  }
  
  function getStatus(user, userDisplay) {
    $.ajax({
      type: "GET",
      url: "https://api.twitch.tv/kraken/streams/"+user,
      headers: {
        "Client-ID": "jupenqkwtm0atzw9z9eym5lyej2os6"
      },
      success: function(data) {
        if (data.stream === null) {
          $(fccStatus).html("<a href='https://www.twitch.tv/" + user + "' target='_blank'>" + userDisplay + " is Offline</a>");
        } else {
          $(fccStatus).html(userDisplay + " is Online");
        }
      }
    });
  }
  
  function getFollows() {
    const NAME = 0;
    const STATUS = 1;
    const LOGO = 2;
    const ONLINE = 3;
    $.ajax({
      type: "GET",
      url: "https://api.twitch.tv/kraken/users/freecodecamp/follows/channels/",
      headers: { "Client-ID": "jupenqkwtm0atzw9z9eym5lyej2os6" },
      success: function(data) {
        var follows = [];
        var name = "";
        var status = "";
        var logo = "";
        var noLogo = "https://www.gravatar.com/avatar/a2b6df699ae0cd59f5077a5cae4cf994/?s=80&r=pg&d=mm";
        var online = false;
        for(var i = 0; i < data.follows.length; i++) {
          name = data.follows[i].channel.display_name;
          status = data.follows[i].channel.status;
          logo = data.follows[i].channel.logo;
          if (logo === null) {
            logo = noLogo;
          }
          follows.push([name,status,logo,online]);
        }
        addFollows(follows);
        var htmlLine="";
        for (var i = 0; i < follows.length; i++) {  // I need to use a closure if I wrap ajax in a for loop
          (function(follows,i) {
            $.ajax({
              type: "GET",
              url: "https://api.twitch.tv/kraken/streams/"+follows[i][NAME],
              headers: { "Client-ID": "jupenqkwtm0atzw9z9eym5lyej2os6" },
              success: function(data) { 
                if (data.stream === null) {
                  follows[i][ONLINE] = false;
                } else {
                  follows[i][NAME] = data.stream.channel.display_name;
                  follows[i][STATUS] = data.stream.channel.status;
                  follows[i][LOGO] = data.stream.channel.logo;
                  follows[i][ONLINE] = true;
                }
                htmlLine = $("#twitchDisplay").html();
                if (follows[i][ONLINE]) {
                  htmlLine += "<li class='listItem online'><a href='https://www.twitch.tv/" + follows[i][NAME] + "' target='_blank'>";
                } else {
                  htmlLine += "<li class='listItem offline'><a href='https://www.twitch.tv/" + follows[i][NAME] + "' target='_blank'>";
                }
                htmlLine += "<img class='tLogo' src='" + follows[i][LOGO] + "' / >";
                if (follows[i][ONLINE]) {
                  htmlLine += "<div class='tOnline checked'>&#10004;</div>";
                } else {
                  htmlLine += "<div class='tOnline'>!</div>";
                }
                htmlLine += "<div class='tName'><div>" + follows[i][NAME] + "</div>";
                htmlLine += "<p>" + follows[i][STATUS] + "</p></div>";
                htmlLine += "</a></li>";
                $("#twitchDisplay").html(htmlLine);
              }
            });
          })(follows,i);
        }
      }
    });
  }
  
  // add some users to follows that weren't returned by the API call in getFollows()
  function addFollows(follows) {
    var logo = "https://www.gravatar.com/avatar/a2b6df699ae0cd59f5077a5cae4cf994/?s=80&r=pg&d=mm";
    var status = "";
    var online = false;
    // Add a Twitch account that was closed
    if (follows.indexOf("brunofin") === -1) { follows.push(["brunofin",status,logo,online]); }
    // Add a Twitch account that never existed
    if (follows.indexOf("comster404") === -1) { follows.push(["comster404",status,logo,online]); }
    // Add some Twitch accounts that are usually active
    if (follows.indexOf("OgamingSC2") === -1) { follows.push(["OgamingSC2",status,logo,online]); }
    if (follows.indexOf("ESL_SC2") === -1) { follows.push(["ESL_SC2",status,logo,online]); }
    if (follows.indexOf("cretetion") === -1) { follows.push(["cretetion",status,logo,online]); }
    if (follows.indexOf("freecodecamp") === -1) { follows.push(["freecodecamp",status,"https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-profile_image-d9514f2df0962329-300x300.png",online]); }
    if (follows.indexOf("storbeck") === -1) { follows.push(["storbeck",status,logo,online]); }
    if (follows.indexOf("habathcx") === -1) { follows.push(["habathcx",status,logo,online]); }
    if (follows.indexOf("RobotCaleb") === -1) { follows.push(["RobotCaleb",status,logo,online]); }
    if (follows.indexOf("noobs2ninjas") === -1) { follows.push(["noobs2ninjas",status,logo,online]); }
  }