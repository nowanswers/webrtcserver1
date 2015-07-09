'use strict';

var ChatMsgBox = function(ulId, scrollBody, inputArea) {
	this.ul = $(ulId); //document.getElementById("chat-area");
	this.scrollBar = $(scrollBody);
	//TODO display speech-reco interim result
	this.inputArea = $("#chat-msg-input");


	this.TEMPLATE_CHAT_L = " \
	    <div class='chat-body clearfix'> \
	        <div class='header'> \
	            <strong >{{sender}}</strong> <small class='pull-right text-muted'> \
	                <span class='glyphicon glyphicon-time'>{{time}}</span> \
	            </small> \
	        </div> \
	        <p> \
	            <small> \
	                {{msgtext}} \
	            </small> \
	        </p> \
	    </div>";

	this.TEMPLATE_CHAT_R = " \
	    <div class='chat-body clearfix'> \
	        <div class='header'>          \
	            <small class='text-muted'> \
	                <span class='glyphicon glyphicon-time'>{{time}}</span> \
	            </small> \
				<strong class='pull-right'>{{sender}}</strong> \
	        </div> \
	        <p> \
	            <small> \
	                {{msgtext}} \
	            </small> \
	        </p> \
	    </div>";
};

ChatMsgBox.prototype.showMsg = function(msgTime, msgText, msgSender, loc) {

    var li = document.createElement("li");
	var chmsg = null;
    
    if( loc ) {  //me
    	li.setAttribute("class", "left clearfix");
    	chmsg = this.TEMPLATE_CHAT_L.replace("{{time}}", msgTime).replace("{{msgtext}}", msgText).replace("{{sender}}", msgSender);
    }
    else { //remote
    	li.setAttribute("class", "right clearfix");
		chmsg = this.TEMPLATE_CHAT_R.replace("{{time}}", msgTime).replace("{{msgtext}}", msgText).replace("{{sender}}", msgSender);
    }

    li.innerHTML = chmsg;

    //scroll to bottom
    this.ul.append(li);
    this.scrollBar.scrollTop( this.ul.last().height());
}

/** speech recognition start */
ChatMsgBox.prototype.initializeSpeechRecognition = function() {
	if( this.recognition ) return;

    this.recognizing = false;
	this.recognition = null;

    if( window.SpeechRecognition ) {
    	this.recognition = new window.SpeechRecognition();
    }
    else if( window.webkitSpeechRecognition ) {
    	this.recognition = new window.webkitSpeechRecognition();
    }

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onstart = function() {
    	this.recognizing = true;
    }.bind(this);

	this.recognition.onerror = function(err) {
		 if (err.error == 'no-speech') {
		 	//this.recognition.start();
		 	this.recognizing = true;
		 }
		 else {
		// if (err.error == 'audio-capture') {
		// }

		// if (err.error == 'not-allowed') {

		// }
			alert( "Speech Recognition stopped due to " + err.error);
			this.recognizing = false;
		}
	}.bind(this);
    
    this.recognition.onend = function() {
    	this.recognizing = false;
    }.bind(this);

 	this.recognition.onresult = function (event) {
		var finalMsg = "";
		var interimMsg = "";

		for (var i = 0; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				finalMsg += event.results[i][0].transcript;
				this.inputArea.val(''); //clear input area
			} else {
				interimMsg += event.results[i][0].transcript;
				//this.showMsg( new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"), interimMsg, "RECO", true);
				this.inputArea.val( interimMsg );
			}
		}
		if( finalMsg !== "" ) {
			this.showMsg( new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"), finalMsg, "RECO", true);
		}
    }.bind(this);
}

ChatMsgBox.prototype.toggleSpeechRecognition = function (onoff) {

	if ( this.recognizing && (onoff===undefined || !onoff ) ){
		this.recognition.stop();
		this.recognizing = false;
	} else if( !this.recognizing && (onoff===undefined || onoff) ) {
		this.recognition.start();
		this.recognizing = true;
	}
}

ChatMsgBox.prototype.isSpeechRecognitionOn = function () {
	if( this.recognition ) {
		return true;
	}

	return false;
}
/** speech recognition end*/