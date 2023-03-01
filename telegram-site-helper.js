function startTelegramSiteHelper(telegramSiteHelper){
	console.log("Starting Telegram Site Helper 2.0")
	/* Trying to close server side event */
	try{serverSideEvent.close();}catch(e){}
	try{longPoll.abort();}catch(e){}
	try{clearTimeout(longPollTimer);}catch(e){}
 	
 	/* Checking API URL setting for avaliable */
	if(!telegramSiteHelper.apiUrl){
		console.error("TSH > "+"Bad API URL..");
		return false;
	}
	/* Checking box type setting for avaliable */
	if(telegramSiteHelper.type!="popup" && telegramSiteHelper.type!="embed"){
		telegramSiteHelper.type="popup";
	}
	/* Checking for parent element id (for embed chat mode) */
	if(telegramSiteHelper.type=="embed"){
		if(!telegramSiteHelper.parentElementId){
			console.error("TSH > "+"Parent Element Id is not defined! It is required in embed chat mode!");
			return false;
		}
	}else{
		/* Checking chat box position  */
		var pos=telegramSiteHelper.chatPosition
		if(pos!="lt" && pos!="lb" && pos!="rt" && pos!="rb" && pos!="tl" && pos!="tr" && pos!="bl" && pos!="br"){
			telegramSiteHelper.chatPosition="br";
		}
	}
	/* Checking label text setting for avaliable */
	if(!telegramSiteHelper.type || telegramSiteHelper.type==""){
		telegramSiteHelper.type="lp"
	}
	/* Checking label text setting for avaliable */
	if(!telegramSiteHelper.label || telegramSiteHelper.label==""){
		telegramSiteHelper.label="Ask your question here!"
	}
	/* Checking yourName text setting for avaliable */
	if(!telegramSiteHelper.yourName || telegramSiteHelper.yourName==""){
		telegramSiteHelper.yourName="Ask your question here!"
	}
	/* Checking yourPhone text setting for avaliable */
	if(!telegramSiteHelper.yourPhone || telegramSiteHelper.yourPhone==""){
		telegramSiteHelper.yourPhone="Ask your question here!"
	}
	/* Checking startChat text setting for avaliable */
	if(!telegramSiteHelper.startChat || telegramSiteHelper.startChat==""){
		telegramSiteHelper.startChat="Ask your question here!"
	}
	/* Checking enterYourMessage text setting for avaliable */
	if(!telegramSiteHelper.enterYourMessage || telegramSiteHelper.enterYourMessage==""){
		telegramSiteHelper.enterYourMessage="Ask your question here!"
	}
	/* Checking you text setting for avaliable */
	if(!telegramSiteHelper.you || telegramSiteHelper.you==""){
		telegramSiteHelper.you="You"
	}
	/* Checking you text setting for avaliable */
	if(!telegramSiteHelper.attachFileTitle || telegramSiteHelper.attachFileTitle==""){
		telegramSiteHelper.attachFileTitle="Attach the file"
	}
	/* Checking you text setting for avaliable */
	if(!telegramSiteHelper.maxFileSize || telegramSiteHelper.maxFileSize==""){
		telegramSiteHelper.maxFileSize=2048
	}
	/* Checking you text setting for avaliable */
	if(!telegramSiteHelper.maxFileSizeError || telegramSiteHelper.maxFileSizeError==""){
		telegramSiteHelper.maxFileSizeError="Error: max file size is: "
	}
	/* Checking manager text setting for avaliable */
	if(!telegramSiteHelper.manager || telegramSiteHelper.manager==""){
		telegramSiteHelper.manager="Manager"
	}
	/* Checking for mainColor*/
	if(!telegramSiteHelper.mainColor || telegramSiteHelper.mainColor==""){
		telegramSiteHelper.mainColor="#E8E8E8";
	}
	/* Checking for accentColor*/
	if(!telegramSiteHelper.accentColor || telegramSiteHelper.accentColor==""){
		telegramSiteHelper.accentColor="#179CDE";
	}
	/* Checking for textColor*/
	if(!telegramSiteHelper.textColor || telegramSiteHelper.textColor==""){
		telegramSiteHelper.textColor="#000";
	}
	/* Checking for fontFamily*/
	if(!telegramSiteHelper.fontFamily || telegramSiteHelper.fontFamily==""){
		telegramSiteHelper.fontFamily="arial";
	}
	/* Checking for boxWidth*/
	if(!telegramSiteHelper.boxWidth || telegramSiteHelper.boxWidth==""){
		if(telegramSiteHelper.type=="embed"){
			telegramSiteHelper.boxWidth="100%";
		}else{
			telegramSiteHelper.boxWidth="350px";
		}
	}
	/* Checking for boxHeight*/
	if(!telegramSiteHelper.boxHeight || telegramSiteHelper.boxHeight==""){
		if(telegramSiteHelper.type=="embed"){
			telegramSiteHelper.boxHeight="100%";
		}else{
			telegramSiteHelper.boxHeight="290px";
		}
	}
	/* Checking for boxZindex*/
	if(!telegramSiteHelper.boxZindex || telegramSiteHelper.boxZindex==""){
		telegramSiteHelper.boxZindex="9999";
	}
	/* Create Audio instance (new message sound) from base64 audio */
	if(telegramSiteHelper.base64string){
		telegramSiteHelper.sound = new Audio(telegramSiteHelper.base64string);
	}
	/* Style classes for label (in depence of label position on page) */
	if(telegramSiteHelper.type=="popup" && telegramSiteHelper.showLabel==true){
		if(telegramSiteHelper.chatPosition=="lb" || telegramSiteHelper.chatPosition=="rt"){
			var labelClasses="tsh-label tsh-rotate270 tsh-label-"+telegramSiteHelper.chatPosition;
		}else if(telegramSiteHelper.chatPosition=="lt" || telegramSiteHelper.chatPosition=="rb"){
			var labelClasses="tsh-label tsh-rotate90 tsh-label-"+telegramSiteHelper.chatPosition;
		}else{
			var labelClasses="tsh-label tsh-label-"+telegramSiteHelper.chatPosition;
		}
		/* CSS for label */
		var labelStyle="font-family:"+telegramSiteHelper.fontFamily+"; background-color:"+telegramSiteHelper.accentColor+"; z-index:"+telegramSiteHelper.boxZindex;

		/* Label */
 		var chatBoxLabelNode = document.createElement("div");
		chatBoxLabelNode.id="telegramSiteHelperChatLabel";
		chatBoxLabelNode.setAttribute("class", labelClasses);
		chatBoxLabelNode.setAttribute("style", labelStyle);
		chatBoxLabelNode.innerHTML=telegramSiteHelper.label;
		console.log(chatBoxLabelNode);
 		document.body.appendChild(chatBoxLabelNode);

	}

	/* Chatbox classes and styles */	
	var chatboxStyle="background-color:"+telegramSiteHelper.mainColor+"; color:"+telegramSiteHelper.textColor+"; font-family:"+telegramSiteHelper.fontFamily+"; width:"+telegramSiteHelper.boxWidth+";height:"+telegramSiteHelper.boxHeight+";z-index:"+telegramSiteHelper.boxZindex+";"
	if(telegramSiteHelper.type=="popup"){
		var chatboxClasses="tsh-chatbox tsh-chatbox-"+telegramSiteHelper.chatPosition
		if(pos=="lt" || pos=="lb" ){
			chatboxClasses+=" slideInLeft";
		}else if(pos=="rt" || pos=="rb"){
			chatboxClasses+=" slideInRight";
		}else if(pos=="tl" || pos=="tr"){
			chatboxClasses+=" slideInDown";
		}else if(pos=="bl" || pos=="br"){
			chatboxClasses+=" slideInUp";
		}
		chatboxStyle+="display:none; position:fixed;";
	}else{
		var chatboxClasses="tsh-chatbox";
		chatboxStyle+="display:block; position:relative;";
	}
 
 	var chatBoxNode = document.createElement("div");
	chatBoxNode.id="telegramSiteHelperChatBox";
	chatBoxNode.setAttribute("class", chatboxClasses+"  animated");
	chatBoxNode.setAttribute("style", chatboxStyle);


	/* Creating chatbox */
	var	chatBox="<div id=\"telegramSiteHelperChatBox-header\" class=\"tsh-chatbox-header\" style=\"background-color:"+telegramSiteHelper.accentColor+";\">";
	chatBox+= telegramSiteHelper.label;
	if(telegramSiteHelper.type=="popup"){
		/* Adding close cross in popup mode */
		chatBox+="<div id=\"telegramSiteHelperChatBox-close\" class=\"tsh-chatbox-close\">&times;</div>";
	}
	chatBox+="</div>";
	chatBox+="<div id=\"telegramSiteHelperChatBox-greeting\" class=\"tsh-chatbox-greeting\">";

	if(telegramSiteHelper.requireName){
		if(telegramSiteHelper.overrideChatCustomerName!=null && telegramSiteHelper.overrideChatCustomerName!=""){
			var chatCustomerName=telegramSiteHelper.overrideChatCustomerName;
			var disableChatCustomerName="disabled"
		}else{
			var chatCustomerName="";	
			var disableChatCustomerName=""		
		}
		chatBox+="<input type=\"text\" "+disableChatCustomerName+" value=\""+chatCustomerName+"\" id=\"chatCustomerName\" class=\"tsh-chatbox-greeting-input\" placeholder=\""+telegramSiteHelper.yourName+"\">";
	}
	if(telegramSiteHelper.requirePhone){
		chatBox+="<input type=\"text\" id=\"chatCustomerPhone\" class=\"tsh-chatbox-greeting-input\" placeholder=\""+telegramSiteHelper.yourPhone+"\">";
	}
	chatBox+="<button id=\"telegramSiteHelperStartChat\" class=\"tsh-chatbox-greeting-button\" style=\"background-color:"+telegramSiteHelper.accentColor+"\">"+telegramSiteHelper.startChat+"</button>";
	chatBox+="</div>";
	chatBox+="<div id=\"telegramSiteHelperChatBox-container\" class=\"tsh-chatbox-container\"></div>";
	chatBox+="<div id=\"telegramSiteHelperChatBox-input\" class=\"tsh-chatbox-inputArea\">";
	if(telegramSiteHelper.attachFile){
		var paddingForAttachStyle="left:30px;"
	}else{
		var paddingForAttachStyle="left:0px;"
	}
	chatBox+="<div class=\"tsh-chatbox-message-container\" id=\"telegramSiteHelperMessageContainer\" style=\""+paddingForAttachStyle+"\">";	
	chatBox+="<textarea id=\"telegramSiteHelperMessage\" class=\"tsh-chatbox-message\" placeholder=\""+telegramSiteHelper.enterYourMessage+"\"></textarea>";
	chatBox+="</div>";

	if(telegramSiteHelper.attachFile){
		chatBox+="<div id=\"telegramSiteHelperAttach\" class=\"tsh-chatbox-attach\" title=\""+telegramSiteHelper.attachFileTitle+"\"></div>";
		chatBox+="<input type=\"file\" id=\"telegramSiteHelperAttachInput\">";
	}
	chatBox+="<div id=\"telegramSiteHelperEnter\" class=\"tsh-chatbox-enter\"></div>";
	chatBox+="</div>";
	
	/* Appending chatbox to Body */
	if(telegramSiteHelper.type=="embed"){
		if(telegramSiteHelper.parentElementId){
			var parentElement = document.getElementById(telegramSiteHelper.parentElementId);
			if(parentElement){
				parentElement.appendChild(chatBoxNode);
			}else{
				console.error("TSH > "+"Unknown parentElementId for chat box");
			}
		}
	}else{
		document.body.appendChild(chatBoxNode);
	}

	document.getElementById("telegramSiteHelperChatBox").innerHTML=chatBox;

 	if(telegramSiteHelper.attachFile){
	 	var photoShowNode=document.createElement("div");
	 	photoShowNode.id="tsh-photo-show";
	 	document.body.appendChild(photoShowNode);

	 	document.getElementById("tsh-photo-show").onclick=function(){
	 		document.getElementById("tsh-photo-show").style.display="none"
	 		document.getElementById("tsh-big-image").remove()
	 	} 
	 	bindAttachFile();
	}

	/* Bind click on label (open chat-box) and click on close (close chat-box)*/
	if(telegramSiteHelper.type=="popup"){
		if(telegramSiteHelper.popupbyelement==null || telegramSiteHelper.popupbyelement==""){
			document.getElementById('telegramSiteHelperChatLabel').onclick=function(){
				document.getElementById('telegramSiteHelperChatBox').style.display="block";
				document.getElementById('telegramSiteHelperChatLabel').style.display="none";
				tshScrollDown();
			};
			document.getElementById('telegramSiteHelperChatBox-close').onclick=function(){
				document.getElementById('telegramSiteHelperChatLabel').style.display="block";
				document.getElementById('telegramSiteHelperChatBox').style.display="none";
			};
		}else{
			document.getElementById(telegramSiteHelper.popupbyelement).onclick=function(){
				document.getElementById('telegramSiteHelperChatBox').style.display="block";
				tshScrollDown();
			};
			document.getElementById('telegramSiteHelperChatBox-close').onclick=function(){
				document.getElementById('telegramSiteHelperChatBox').style.display="none";
			};
		}
	}
 
	/* Bind click on send btn */
	document.getElementById('telegramSiteHelperEnter').onclick=function(){
		sendMessage();
	};

	/* Bind ctrl+enter press for textarea to send message */
	document.getElementById('telegramSiteHelperMessage').onkeypress=function(e){
		if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
			document.getElementById('telegramSiteHelperMessage').value+="\r"
		}else if(e.keyCode == 13 || e.keyCode == 10){
			sendMessage();
		}
	};

	/* Checking for chatId in cookies */
	var chatId = telegramSiteHelperGetCookie("chatId");
	telegramSiteHelper.chatId=chatId;

	/* If chatId isset -> getting all messages and updates */
	if(telegramSiteHelper.chatId){
		if(telegramSiteHelper.translationType=="sse"){
			startTranslation();
		}else{
			startLongPoll();
		}
	/* If chatId is not set and personal fields is not required -> start new chat */
	}else if(telegramSiteHelper.requireName==false && telegramSiteHelper.requirePhone==false && telegramSiteHelper.type=="embed"){
		newChat();
	}else{
		document.getElementById("telegramSiteHelperStartChat").onclick=function(){
			newChat();
		};
	}
}

serverSideEvent=null
/* Getting data with Server Side Event */
function startTranslation(){
	console.log("TSH > Start getting data by ServerSideEvent");
	document.getElementById('telegramSiteHelperChatBox-greeting').style.display="none";
	document.getElementById('telegramSiteHelperChatBox-container').style.display="block";
	document.getElementById('telegramSiteHelperChatBox-input').style.display="block";
	tshScrollDown();
	try{serverSideEvent.close();}catch(e){}
	serverSideEvent = new EventSource(telegramSiteHelper.apiUrl+"?act=pollMessages&type=sse&chatId="+telegramSiteHelper.chatId);
	serverSideEvent.onmessage = function(e) {
		var data=JSON.parse(e.data);
		if(data.command=="allMessages"){
			addMessages(data.messages)
		}else if(data.command=="newMessages"){
			addMessages(data.messages)
			if(telegramSiteHelper.sound){
				telegramSiteHelper.sound.play();
			}
		}else if(data.command=="loadComplete"){
		}else if(data.command=="error"){
			if(data.error=="BAD_CHAT_ID"){
				try{
					serverSideEvent.close();
					newChat();
				}catch(e){}
			}
		}
	};
}


/* Getting data with Long-poll query*/
lastMessageId=0;
longPoll=null;
longPollTimer=null;
function startLongPoll(){
	console.log("TSH > Start getting data by LongPoll");
	document.getElementById('telegramSiteHelperChatBox-greeting').style.display="none";
	document.getElementById('telegramSiteHelperChatBox-container').style.display="block";
	document.getElementById('telegramSiteHelperChatBox-input').style.display="block";
	try{longPoll.abort();}catch(e){}
	try{clearTimeout(longPollTimer);}catch(e){}
	longPoll = new XMLHttpRequest();
	longPoll.timeout=15000;
	var longPollURL=telegramSiteHelper.apiUrl+"?act=pollMessages&type=lp&chatId="+telegramSiteHelper.chatId+"&lastMessageId="+lastMessageId;
 	longPoll.open('POST', longPollURL, true);
	longPoll.send();
 	longPoll.onreadystatechange = function(){
		if(this.readyState==4){
			console.log(this.status)
			if(this.status == 200){
				if(this.responseText){
					try{
						var data = JSON.parse(this.responseText);
						if(data.command=="allMessages"){
							addMessages(data.messages)

							lastMessageId=data.lastMessageId;
							if(lastMessageId==0){
								longPollTimer=setTimeout(function(){
									startLongPoll();
								}, 2000);
							}else{
								startLongPoll();
							}
						}else if(data.command=="newMessages"){
							addMessages(data.messages)
							if(telegramSiteHelper.sound){
								telegramSiteHelper.sound.play();
							}
							lastMessageId=data.lastMessageId;
							if(lastMessageId==0){
								longPollTimer=setTimeout(function(){
									startLongPoll();
								}, 2000);
							}else{
								startLongPoll();
							}
						}else if(data.command=="timeout"){
							startLongPoll();
						}else if(data.command=="error"){
							if(data.error=="BAD_CHAT_ID"){
								try{
									longPoll.abort();
									clearTimeout(longPollTimer);
									newChat()
								}catch(e){}
							}else{
								console.error("TSH > "+data.error)
								longPollTimer=setTimeout(function(){
									startLongPoll();
								}, 2000);
							}
						}
					}catch(e){
						console.log(this.responseText);
						longPollTimer=setTimeout(function(){
							startLongPoll();
						}, 2000);
					}
				}else{
					console.log(this.responseText);
					longPollTimer=setTimeout(function(){
						startLongPoll();
					}, 2000);
				}
			}else{
				console.log(this);
				longPollTimer=setTimeout(function(){
					startLongPoll();
				}, 2000);
			}
		}
	}

}



function newChat(){
	console.log("TSH > "+"Starting new chat")
	
	try{serverSideEvent.close();}catch(e){}
	try{longPoll.abort();}catch(e){}
	try{clearTimeout(longPollTimer);}catch(e){}

	var xhr = new XMLHttpRequest();
	xhr.open('POST', telegramSiteHelper.apiUrl+"?act=newChat", true);
	var formData = new FormData();
	if(telegramSiteHelper.requireName || telegramSiteHelper.overrideChatCustomerName!=null){
		if(telegramSiteHelper.overrideChatCustomerName!=null && telegramSiteHelper.overrideChatCustomerName!=""){
			var chatCustomerName=telegramSiteHelper.overrideChatCustomerName;
		}else{
			var chatCustomerName= document.getElementById("chatCustomerName").value			
		}
		formData.append("chatCustomerName",chatCustomerName);
	}
	if(telegramSiteHelper.requirePhone){
		formData.append("chatCustomerPhone", document.getElementById("chatCustomerPhone").value)
	}
	xhr.send(formData);
	xhr.onreadystatechange = function(){
		if(this.readyState==4){
			if(this.status == 200){
				if(this.responseText){
					try{
						var answer = JSON.parse(this.responseText);
						if(answer.status=="ok"){
							telegramSiteHelper.chatId=answer.chatId;
							telegramSiteHelper.manager=answer.manager;
							telegramSiteHelperSetCookie("chatId",telegramSiteHelper.chatId,{"expires":360000,"path":"/"});
							if(telegramSiteHelper.translationType=="sse"){
								startTranslation();
							}else{
								startLongPoll();
							}
						}else{
							document.getElementById('telegramSiteHelperChatBox-greeting').style.display="none";
							document.getElementById('telegramSiteHelperChatBox-container').style.display="block";
 							if(answer.error=="NO_MANAGERS_AVALIABLE"){
								addSystemMessage(telegramSiteHelper.noManagersAvailable, "tsh-danger");
							}else{
								addSystemMessage(answer.error, "tsh-danger");
							}
						}
					}catch(e){
						console.error("TSH > "+"Can`t create new chat");
						console.log(this.responseText);
					}
				}else{
					console.error("TSH > "+"Can`t create new chat");
					console.log(this.responseText);
				}
			}else{
				console.error("TSH > "+"Can`t create new chat");
				console.log(this);
			}
		}
	}
}


function addMessages(messages){
	messages.forEach(function(message, i) {
		addMessage(message)
	});
}



function addMessage(message){
	try{
		document.getElementById("tsh_"+message.msgId).remove();
	}catch(e){}
	var msg="";
	if(message.msgFrom=="client"){
		var c="tsh-right";
		var n=telegramSiteHelper.you;
	}else{
		var c="";
		if(message.managerName!=null){
			var n=message.managerName;
		}else{
			var n=telegramSiteHelper.manager;	
		}
	}
	msg+="<div class=\"tsh-msg "+c+"\" id=\"tsh_"+message.msgId+"\">";
	msg+="<div class=\"tsh-msg-header\">"+n+" <span class=\"tsh-time\">"+message.msgTime+"<span></div>";
	if(message.msgText==null){
		message.msgText=""
	}
 	try{
		console.log('!');
		var msgJSON = JSON.parse(message.msgText);
		if(msgJSON.file && msgJSON.filename){
			console.log('!!');
			message.msgText="<a href=\""+telegramSiteHelper.apiUrl+"?act=getDocument&fileId="+msgJSON.file+"&filename="+encodeURIComponent(msgJSON.filename)+"\" target=\"_blank\" class=\"tsh-file\" id=\"file_"+message.msgId+"\">"+msgJSON.filename+"</a>";
		}else if(msgJSON.photo){
			console.log('photo!');
			message.msgText="<div onclick=\"bigImg('img_"+message.msgId+"')\" class=\"tsh-img\" id=\"image_"+message.msgId+"\"><img  id=\"img_"+message.msgId+"\" src=\""+telegramSiteHelper.apiUrl+"?act=getPhoto&fileId="+msgJSON.photo+"\"></div>";
		}else if(msgJSON.text){
			/* looking for links here */
			var pattern = '(?:(?:ht|f)tps?://)?(?:[\\-\\w]+:[\\-\\w]+@)?(?:[0-9a-z][\\-0-9a-z]*[0-9a-z]\\.)+[a-z]{2,6}(?::\\d{1,5})?(?:[?/\\\\#][?!^$.(){}:|=[\\]+\\-/\\\\*;&~#@,%\\wА-Яа-я]*)?';
			var reg = new RegExp(pattern);
			message.msgText = msgJSON.text.replace(reg, function(s){
				var str = (/:\/\//.exec(s) === null ? "http://" + s : s );
				return "<a target=\"_blank\" href=\""+ str + "\">" + str /*s*/ + "</a>"; 
			});
		}
	}catch(e){}
 	msg+="<div class=\"tsh-msg-body\">"+message.msgText+"</div>";
	msg+="</div>";
	document.getElementById("telegramSiteHelperChatBox-container").innerHTML+=msg;
	setTimeout(function(){tshScrollDown();},100);
}


/* Adding system message */
function addSystemMessage(message, msgclass){
	var msg="";
	msg+="<div class=\"tsh-msg tsh-system "+msgclass+"\">";
	msg+="<div class=\"tsh-msg-header\"></div>";
	msg+="<div class=\"tsh-msg-body\">"+message+"</div>";
	msg+="</div>";
	document.getElementById("telegramSiteHelperChatBox-container").innerHTML+=msg;
	tshScrollDown();
}


/* Sending message function */
function sendMessage(){
	var message=document.getElementById("telegramSiteHelperMessage").value;
	if(message!=null && message!=""){
		var xhr = new XMLHttpRequest();
		xhr.open('POST', telegramSiteHelper.apiUrl+"?act=sendMessage", true);
		var formData = new FormData();
		formData.append("message", message)
		formData.append("chatId", telegramSiteHelper.chatId);
		xhr.send(formData);
		setTimeout(function(){
			document.getElementById("telegramSiteHelperMessage").value="";
		},20);
		xhr.onreadystatechange = function(){
			if(this.readyState==4){
				if(this.status == 200){
					if(this.responseText){
						try{
							var answer = JSON.parse(this.responseText);
							if(answer.status=="ok"){
								
							}else{
								console.error("Can`t send message...");
								console.log(answer.error);
								if(answer.error=="NO_MANAGER"){
									addSystemMessage("Error: no manager", "danger");
									newChat();
								}
							}
						}catch(e){
							console.error("Can`t send message...");
							console.log(this.responseText);
						}
					}else{
						console.error("Can`t send message...");
						console.log(this.responseText);
					}
				}else{
					console.error("Can`t send message...");
					console.log(this);
				}
			}
		}
	}
}


/* Bind attach file button */
function bindAttachFile(){
	document.getElementById("telegramSiteHelperAttach").onclick=function(){
		document.getElementById("telegramSiteHelperAttachInput").click()
	};
	document.getElementById("telegramSiteHelperAttachInput").onchange=function(event){
		var file=event.target.files[0];
		if(file.size>(telegramSiteHelper.maxFileSize*1000)){
			addSystemMessage("Error: Max file size is "+telegramSiteHelper.maxFileSize+" kb", "tsh-danger")
			return false;
		}
		var reader=new FileReader();
		reader.onload=function(event){
			var xhr = new XMLHttpRequest();
			xhr.open('POST', telegramSiteHelper.apiUrl+"?act=sendMessage", true);
			var formData = new FormData();
			formData.append("file", event.target.result);
			formData.append("filename", file.name);
			formData.append("chatId", telegramSiteHelper.chatId);
			xhr.send(formData);
			document.getElementById("telegramSiteHelperAttachInput").value="";
			xhr.onreadystatechange = function(){
				if(this.readyState==4){
					if(this.status == 200){
						if(this.responseText){
							try{
								var answer = JSON.parse(this.responseText);
								if(answer.status=="ok"){
									// nothing to do here :)
								}else{
									console.error("Can`t send message...");
									console.log(answer.error);
								}
							}catch(e){
								console.error("Can`t send message...");
								console.log(this.responseText);
							}
						}else{
							console.error("Can`t send message...");
							console.log(this.responseText);
						}
					}else{
						console.error("Can`t send message...");
						console.log(this);
					}
				}
			}
		};
		reader.readAsDataURL(file);
	};
}

/* Open big-size image */
function bigImg(msgId){
	el=document.getElementById(msgId).cloneNode(true);
	newEl=document.getElementById("tsh-photo-show").appendChild(el);
	newEl.id="tsh-big-image";
	document.getElementById("tsh-photo-show").style.display="block";
}

/* Scroll down chat-box inner */
function tshScrollDown(){
	var h = document.getElementById("telegramSiteHelperChatBox-container").scrollHeight;
	document.getElementById("telegramSiteHelperChatBox-container").scrollTop=h+200;
}

/* Getting cookie function */
function telegramSiteHelperGetCookie(name){
	var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

/* Setting cookies function */
function telegramSiteHelperSetCookie(name, value, options){
	options = options || {};
	var expires = options.expires;
	if(typeof expires == "number" && expires){
		var d = new Date();
		d.setTime(d.getTime() + expires * 1000);
		expires = options.expires = d;
	}
	if(expires && expires.toUTCString){
		options.expires = expires.toUTCString();
	}
	value = encodeURIComponent(value);
	var updatedCookie = name + "=" + value;
	for (var propName in options) {
		updatedCookie += "; " + propName;
		var propValue = options[propName];
		if (propValue !== true) {
			updatedCookie += "=" + propValue;
		}
	}
	document.cookie = updatedCookie;
} 