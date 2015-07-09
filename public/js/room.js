 

    //$().bind('mousemove', this.showIcons_.bind(this));


var VideoRoomCtrl = function(loadingParams) {
    this.cb = new ChatMsgBox(UI_CONSTANTS.chatBoxUl, UI_CONSTANTS.chatBodyDiv);

    /** UI elements injection */
    this.hangupSvg_ = $(UI_CONSTANTS.hangupSvg);
    this.icons_ = $(UI_CONSTANTS.icons);
    this.localVideo_ = $(UI_CONSTANTS.localVideo);

    this.sharingDiv_ = $(UI_CONSTANTS.sharingDiv);
    this.statusDiv_ = $(UI_CONSTANTS.statusDiv);
    this.remoteVideo_ = $(UI_CONSTANTS.remoteVideo);

    this.videosDiv_ = $(UI_CONSTANTS.videosDiv);

    this.confirmReadyButton_ = $(UI_CONSTANTS.confirmReadyButton);
    this.confirmReadyDiv_ = $(UI_CONSTANTS.confirmJoinDiv);
    this.confirmJoinHint_ = $(UI_CONSTANTS.confirmJoinHint);
    this.chatboxDiv_ = $(UI_CONSTANTS.chatboxDiv);
    this.msgTextArea_ = $(UI_CONSTANTS.msgTextArea);
    this.chatInput_ = $(UI_CONSTANTS.chatInput);
    this.newchatDiv_ = $(UI_CONSTANTS.newchatDiv);
    this.chatscreenSvg_ = $(UI_CONSTANTS.chatscreenSvg);
    this.msgSendBtn_ = $(UI_CONSTANTS.msgSendBtn);

    this.speechRecoBtn_ = $(UI_CONSTANTS.speechRecoBtn);
    this.closeChatBtn_ = $(UI_CONSTANTS.closeChatBtn);
    this.muteAudioSvg_ = $(UI_CONSTANTS.muteAudioSvg);
    this.muteVideoSvg_ = $(UI_CONSTANTS.muteVideoSvg);
    this.fullscreenSvg_ = $(UI_CONSTANTS.fullscreenSvg);

    /** ctrl panel btns*/
    // this.muteAudioIconSet_ =
    //   new VideoRoomCtrl.IconSet_(UI_CONSTANTS.muteAudioSvg);
    // this.muteVideoIconSet_ =
    //   new VideoRoomCtrl.IconSet_(UI_CONSTANTS.muteVideoSvg);
    // this.fullscreenIconSet_ =
    //   new VideoRoomCtrl.IconSet_(UI_CONSTANTS.fullscreenSvg);
    // this.chatscreenIconSet_ =
    //   new VideoRoomCtrl.IconSet_(UI_CONSTANTS.chatscreenSvg);

      /** Initialize webrtc */
    // grab the room from the URL
    //this.room = location.search && location.search.split('?')[1];
    this.room = loadingParams.roomid; //location.search && location.search.split('?')[1];
    
    this.logger = loadingParams.logger;

    // var winstonlogger = new (winston.Logger)({
    //     transports: [
    //     new (winston.transports.Console)(),
    //     new (winston.transports.File)({ filename: 'browser_errors.log' })
    //     ]
    // });
    //this.logger = new Srvlogger(true);
    // create our webrtc connection
    this.webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: UI_CONSTANTS.localVideo, //'#local-video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: UI_CONSTANTS.remoteVideo, //'#remote-video',
        // immediately ask for camera access
        autoRequestMedia: true,
        autoRemoveVideos: false,
        debug: true,
        detectSpeakingEvents: false,
        autoAdjustMic: false
        //TODO including log as an option in url
        ,logger: loadingParams.logger
    });



    /** for funcs inside webrtc to access vars defined here */
    var self = this;

    /** controls - events binding */
    /** Chat-box */
    this.chatInput_.keypress( function (e) {  // bind("keypress", {}, function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) { //Enter keycode                        
            e.preventDefault();
            var inputMsg = this.chatInput_.val();
            
            this.chatInput_.val( '' );
            //echo to chatbox
            this.cb.showMsg(this.getNowString_(), inputMsg, "ME", true);

            this.sendChatMsg_ ( inputMsg);
        }
    }.bind(this));

    this.closeChatBtn_.click(function() {
        this.toggleClass_(this.chatscreenSvg_, 'on');
        this.toggleClass_(this.newchatDiv_, 'hidden');
    }.bind(this));

    this.speechRecoBtn_.click(function() {
        if( !this.cb.isSpeechRecognitionOn() ) {
            this.cb.initializeSpeechRecognition();
        }

        this.cb.toggleSpeechRecognition();
    }.bind(this));

    this.msgSendBtn_.click(function (e) {
            e.preventDefault();
            var inputMsg = this.chatInput_.val();
            
            this.chatInput_.val( '' );
            //echo to chatbox
            this.cb.showMsg(this.getNowString_(), inputMsg, "ME", true);

            this.sendChatMsg_ ( inputMsg);        
    }.bind(this));

    /** confirm ready and join/create the room */
    this.confirmReadyButton_.click( function(e) {
        if( this.readyToCall && this.room ) {
            this.logger(' create/join room cb ', arguments);
            this.webrtc.joinRoom(this.room);  

            //this.hide_( this.confirmReadyDiv_ ); //.addClass('hidden');
            //this.toggleClass_( this.confirmReadyDiv_, 'hidden', true);
            this.confirmJoinHint_.text("Waiting for remote");
            this.toggleClass_(this.confirmReadyButton_, 'hidden', true);
        }
    }.bind(this));

    /** svg buts handler */
    this.muteAudioSvg_.click( function() {
        /** switch local stream audio */
        if( this.webrtc.webrtc.isAudioEnabled() ) {
            this.webrtc.webrtc.mute();
        }
        else {
            this.webrtc.webrtc.unmute();   
        }
        
        this.toggleClass_(this.muteAudioSvg_, 'on');//this.muteAudioIconSet_.toggle();

    }.bind(this));

    this.muteVideoSvg_.click( function() {
        /** switch local stream audio */
        if( this.webrtc.webrtc.isVideoEnabled() ) {
            this.webrtc.webrtc.pauseVideo();
        }
        else {
            this.webrtc.webrtc.resumeVideo();            
        }

        this.toggleClass_(this.muteVideoSvg_, 'on');// this.muteVideoIconSet_.toggle();
    }.bind(this));


    this.hangupSvg_.click( function() {
        //TODO hangup and leave the room
        this.webrtc.leaveRoom();
    }.bind(this));

    this.chatscreenSvg_.click( function() {
        this.toggleClass_(this.chatscreenSvg_, 'on');
        this.toggleClass_(this.newchatDiv_, 'hidden');
    }.bind(this));



    /** webrtc event handling */
    this.readyToCall = false;
    this.webrtc.on('readyToCall', function () {
        this.readyToCall = true;
        window.onmousemove = this.showIcons_.bind(this);
    }.bind(this));

    this.webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type == 'volume') {
            //showVolume(document.getElementById('volume_' + peer.id), data.volume);
        }
        else if( data.type == 'chatmsg' ) {
            this.cb.showMsg(this.getNowString_(), data.msgText, "REMOTE", false );
        }                
    }.bind(this));

    /** remote peer video stream added */
    this.webrtc.on('videoAdded', function (video, peer) {
        this.logger('video added', peer);

        this.toggleClass_( this.confirmReadyDiv_, 'hidden', true);

        //minify local video
        //this.toggleMini_(this.remoteVideo_, true);
        //this.localVideo_.addClass('mini-video');
        this.toggleClass_(this.localVideo_, 'mini-video', true);
        
        //this.toggleClass_(this.remoteVideo_, 'mini-video', false);
        this.remoteVideo_.removeClass('mini-video');
        //this.toggleMini_(this.remoteVideo_, false);

        //this.activate_( this.chatboxDiv_ );

        //this.show_(this.hangupSvg_);
        this.toggleClass_(this.hangupSvg_, 'hidden', false);
        /** start charging */
        //TODO webrtc.emit('session_start');
        this.startSessionTimer();

    }.bind(this) );

    /** remote peer video stream removed */
    this.webrtc.on('videoRemoved', function (remoteVideoEl, peer) {
        this.logger('video removed ', peer);

        this.toggleClass_(this.localVideo_, 'mini-video', false);
        
        this.toggleClass_(this.remoteVideo_, 'mini-video', true);//.removeClass('mini-video');

//        this.toggleMini_(this.remoteVideo_, true);
//        this.toggleMini_(this.localVideo_, false);

        /** stop charging */
        //TODO webrtc.emit('session_stop');
        this.stopSessionTimer();                
    }.bind(this));

    this.webrtc.on('iceFailed', function (peer) {
        // local ice failure
        this.logger.error("ICE failed.");

        this.toggleClass_(this.confirmReadyButton_, 'hidden', true);        
    }.bind(this));
    
    this.webrtc.on('connectivityError', function (peer) {
        // remote ice failure
        this.logger.error("Remote ICE failed.");
        this.confirmJoinHint_.text("Failed to connect peer due to network failure. Please try again.");
        this.toggleClass_(this.confirmReadyButton_, 'hidden', true);
    }.bind(this));

    this.webrtc.on('localMediaError', function (err) {        
        this.logger.error(err); 
        //this.confirmJoinHint_.text("You Camera/Mic is not working.\n Please try again.");
        window.location.replace("/error/camera");
        //this.toggleClass_(this.confirmReadyButton_, 'hidden', true);
    }.bind(this));


}; //VideoRoomCtrl constructor
    
    /** Fatal error occured. Unable to continue */
    VideoRoomCtrl.prototype.handleFatalErrors_ = function(msg) {

    };

    VideoRoomCtrl.prototype.showErrorMsg_ = function(msg) {
        this.confirmJoinHint_.text("Network errors occured. Please try again later.");        
    };

    VideoRoomCtrl.prototype.sendChatMsg_ = function(msg) {                    
        //TODO find a better way to check the remote 
        if (this.webrtc.webrtc.peers && this.webrtc.webrtc.peers.length ) {

            //this.webrtc.sendToAll("chatmsg", {msg: texts});
            this.webrtc.webrtc.peers.forEach(function (p) {
                var dc = p.getDataChannel("simplewebrtc");//chatmsg");
                if (dc.readyState != 'open') 
                    return false;
                dc.send(JSON.stringify({type: 'chatmsg', msgText: msg}) );
            });
        }
    };

    VideoRoomCtrl.prototype.toggleClass_ = function(element, tgtClass, onoff) {
        if( typeof element ==='string') {
            element = $(element); //document.querySelector(element).
        }

        var existingClass = element.attr('class');
        var newClass = null;
        var idx =-1;
        /** jquery add/remove class does not support svg elements 
          attr('class') used instead.
        */
        if( existingClass ) {
            idx = existingClass.indexOf(tgtClass);
        }
        else {
            existingClass = " ";
        }

        if( onoff === undefined ) {
        //flip it
            if( idx >= 0 ) {
                newClass = existingClass.replace(tgtClass, '');
            }
            else {
                newClass = existingClass.concat(" " + tgtClass);
            }
        }
        else {
            if( onoff ) {
                newClass = existingClass + " " + tgtClass;
            }
            else {
                newClass = existingClass.replace( tgtClass, '');
            }
        }

        element.attr('class', newClass);
    };

    VideoRoomCtrl.prototype.toggleMini_ = function(element, onoff) {
        if( typeof element ==='string') {
            element = $(element); //document.querySelector(element).
        }

        if( typeof onoff ==='boolean' && onoff) {
            element.addClass('mini-video');
        }
        else {
            element.removeClass('mini-video');   
        }
    };

    VideoRoomCtrl.prototype.hide_ = function(element) {
        if( typeof element ==='string') {
            element = $(element);
        }
        if( element[0] && element[0].nodeName ==='svg') {
            element.attr('class', 'hidden');
        }
        else {            
            element.addClass('hidden');
        }
    };

    VideoRoomCtrl.prototype.show_ = function(element) {
        if( typeof element ==='string') {
            element = $(element);
        }
        /** Jquery addClass doesnt support svg. */
        if( element[0] && element[0].nodeName ==='svg') {
            element.attr('class', '');
        }
        else {            
            element.removeClass('hidden');
        }
    };

    VideoRoomCtrl.prototype.activate_ = function(element) {
        if( typeof element ==='string') {
            element = $(element); //document.querySelector(element).
        }
      //element.classList.add('active');
        element.addClass('active');
    };

    VideoRoomCtrl.prototype.deactivate_ = function(element) {
        if( typeof element ==='string') {
            element = $(element); //document.querySelector(element).
        }        
      //element.classList.remove('active');
        element.removeClass('active');
    };

    VideoRoomCtrl.prototype.showIcons_ = function() {
        this.toggleClass_( this.icons_, 'hidden', false);
        //this.show_(this.icons_);

        if (this.icons_.attr('class').indexOf('active') < 0 ) {
            this.toggleClass_(this.icons_, 'active', true);
            //this.activate_(this.icons_);
            setTimeout(function() {
                //this.deactivate_(this.icons_);
                this.toggleClass_(this.icons_, 'active', false);
            }.bind(this), 5000);
        }
    };

    VideoRoomCtrl.prototype.toggleAudioMute_ = function() {
        if( this.webrtc.webrtc.isAudioEnabled() ) {
            this.webrtc.webrtc.mute();
        }
        else {
            this.webrtc.webrtc.unmute();   
        }
      /** disable local stream audio */
      //this.call_.toggleAudioMute();
      this.muteAudioIconSet_.toggle();
    };

    VideoRoomCtrl.prototype.toggleVideoMute_ = function() {
        //this.call_.toggleVideoMute();
        if( this.webrtc.webrtc.isVideoEnabled() ) {
            this.webrtc.webrtc.pauseVideo();
        }
        else {
            this.webrtc.webrtc.resumeVideo();            
        }
        this.muteVideoIconSet_.toggle();
    };

    VideoRoomCtrl.prototype.toggleFullScreen_ = function() {
      if (isFullScreen()) {
        trace('Exiting fullscreen.');
        document.cancelFullScreen();
      } else {
        trace('Entering fullscreen.');
        document.body.requestFullScreen();
      }

      this.fullscreenIconSet_.toggle();
    };

    VideoRoomCtrl.prototype.getNowString_ = function(){
        //var d = Date();
            return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    };

    this.session_timer = null;
    VideoRoomCtrl.prototype.startSessionTimer = function ( cb ) {
        function get_elapsed_time_string (total_seconds) {
            function pretty_time_string(num) {
                return ( num < 10 ? "0" : "" ) + num;
            }

            var hours = Math.floor(total_seconds / 3600);
            total_seconds = total_seconds % 3600;

            var minutes = Math.floor(total_seconds / 60);
            total_seconds = total_seconds % 60;

            var seconds = Math.floor(total_seconds);

            // Pad the minutes and seconds with leading zeros, if required
            hours = pretty_time_string(hours);
            minutes = pretty_time_string(minutes);
            seconds = pretty_time_string(seconds);

            // Compose the string for display
            var currentTimeString = "Session Time\n" + hours + ":" + minutes + ":" + seconds;

            return currentTimeString;
        }

        var session_start_time = new Date();
        $('#session-time').addClass('active');//classactive
        var elapsed_seconds;
        session_timer = setInterval( function() {
            elapsed_seconds = Math.round((new Date - session_start_time )/1000);
            $('#session-time').text(get_elapsed_time_string(elapsed_seconds));
        }, 500);
    }

    VideoRoomCtrl.prototype.stopSessionTimer = function () {
        clearTimeout(session_timer);

        $('#session-time').addClass('shine');//classactive 

        setTimeout(function(){
            $('#session-time').removeClass('active shine');
        }, 5000);
    }

    /** SVG icons for ctrl panel */
    VideoRoomCtrl.IconSet_ = function(iconSelector) {
      //this.iconElement = document.querySelector(iconSelector);
      this.iconElement = $(iconSelector);
    };

    VideoRoomCtrl.IconSet_.prototype.includesClass = function(tgtClass) {
        if( this.iconElement.attr('class') && this.iconElement.attr('class').indexOf(tgtClass) >=0 ) {
            return true;
        }
        return false;
    };

    VideoRoomCtrl.IconSet_.prototype.flipClass = function(tgtClass, onoff) {
        if( onoff ) {
            /** Jquery addClass doesnt support svg. 
            this.iconElement.removeClass(tgtClass); */   
            this.iconElement.attr('class', '');  
        }
        else {            
            /** Jquery addClass doesnt support svg. 
            this.iconElement.addClass(tgtClass);            */
            this.iconElement.attr('class', 'on');  
        }
    };

    VideoRoomCtrl.IconSet_.prototype.toggle = function() {
        //   // turn it off: CSS hides `svg path.on` and displays `svg path.off`
        //   // turn it on: CSS displays `svg.on path.on` and hides `svg.on path.off`
        this.flipClass( 'on', this.includesClass('on'));        
    };



/** Draggable init*/
function onDragStart(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData("text/plain",
    event.target.id + ',' + (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
}

function onDragLeave(event) { 
    event.preventDefault(); 
    return false; 
}

function onDragEnter(event) { 
    event.preventDefault(); 
    return false; 
}

function onDragOver(event) { 
    event.preventDefault(); 
    return false; 
} 

function onDrop(event) {
    // var data = event.dataTransfer.getData("text/plain").split(',');
    // var dm = document.getElementById(data[0]);
    // dm.style.left = (event.clientX + parseInt(data[1],10)) + 'px';
    // dm.style.top = (event.clientY + parseInt(data[2],10)) + 'px';
    event.preventDefault();
    return false;
}

// cancel default handler of <body>, so eventually targets would be dropped to <body>
document.body.addEventListener('dragover',onDragOver,false);
document.body.addEventListener('dragenter',onDragEnter,false);
document.body.addEventListener('drop',onDrop,false);  


//document.getElementById('container-mini-video').addEventListener('dragstart',onDragStart,false); 
//document.getElementById('mini-video').addEventListener('dragstart',onDragStart,false); 
//document.getElementById('dash-box-div').addEventListener('dragstart',onDragStart,false); 

/*
    var userIsEditingSomething; // set this if something crazy happens
        oldOnBeforeUnload = window.onbeforeunload;

    window.onbeforeunload = function () {
        // attempt to handle a previous onbeforeunload
        if ('function' === typeof oldOnBeforeUnload) {
            var message = oldOnBeforeUnload();
            if ('undefined' !== typeof message) {
                if (confirm('string' === typeof message ? message : 'Are you sure you want to leave this page?')) {
                    return; // allow user to exit without further annoying pop-ups
                }
            }
        }
        // handle our own
        if (userIsEditingSomething) {
            return 'Are you sure you want to exit?';
        }
    };

*/