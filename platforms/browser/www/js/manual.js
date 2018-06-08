function onLoad() {
        document.addEventListener("deviceready", onDeviceReady, false);
   }
function onDeviceReady() {
        // Register the event listener
        document.addEventListener("backbutton", onBackKeyDown, false);
    }
	
function onBackKeyDown() {
 if (confirm('確認終了?')){
		navigator.app.exitApp();
	}
}

var serverIPList = [];
var template = `
<a href="{linked_url}" class="ts item" onClick="redirection(this);">
            <div class="content">
                <div class="header"><i class="angle right icon"></i>{device_name}</div>
                <div class="middoted meta">
                    <div>更新： {update_date}</div>
                </div>
            </div>
        </a>
`;

$(document).ready(function(){
	if (localStorage.getItem("arozportableips") !== null) {
		serverIPList = JSON.parse(localStorage.getItem("arozportableips"));
	}
	for (var i = 0; i < serverIPList.length; i++){
		$("#storedServer").append(template.replace("{linked_url}","http://" + serverIPList[i][1] + "/AOB").replace("{device_name}",serverIPList[i][1]).replace("{update_date}",serverIPList[i][2]));
		//$("#storedServer").append(serverIPList[i]);
	}
	if (serverIPList.length == 0){
		$("#storedServer").append('<div class="ts item"><div class="content"><div class="header"><i class="circle outline icon"></i>記録なし</div></div></div>');
	}
});


function inputHandler(e) {
    if (e.keyCode == 13) {
		serverIPList.push([Date.now(),$("#enteredIP").val(),getDateTime()]);
		localStorage.setItem("arozportableips", JSON.stringify(serverIPList));
		window.location.reload();
        return false;
    }
}

function redirection(object){
	var address = $(object).attr("href");
	window.open(address, '_system');
}

function getDateTime(){
	var currentdate = new Date();
	var datetime = currentdate.getDay() + "/"+currentdate.getMonth() + "/" + currentdate.getFullYear() + "  " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	return datetime;
}

function removeAllRecords(){
	localStorage.clear();
	window.location.reload();
}

