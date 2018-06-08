//ArOZ Portable Scanning, requiring web worker and RTCPeerConnection.
var hr = (new Date()).getHours();

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

$(document).ready(function(){
	GrapIP();
	setTimeout(function() {
		StartWebWorker();
    }, 2000);
});

var template = `
<a href="{linked_url}" class="ts item" onClick="redirection(this);">
            <div class="content">
                <div class="header"><i class="angle right icon"></i>{device_name}</div>
                <div class="middoted meta">
                    <div>押して接続する</div>
                </div>
            </div>
        </a>
`;


function StartWebWorker(){
var ip = $("#list").html();
var webWorkers = [];
if (ip.includes("ifconfig")){
	alert("Scanning is not supported on this device / environment.");
	return;
}
if (typeof(Worker) !== "undefined") {
	//The browser support everything and ready to start scanning
	var ipg = ip.split(".");
	var header = ipg[0] + "." + ipg[1] + "." + ipg[2] + "."; //a.b.c.
	
	for (var i=1; i < 255;i++){
		GetWorkingOrNot(header + i)
	}
	$("#loading").hide();
	$("#debug").append("<br>DONE<br><br>");
	
} else {
    $("#debug").html("Error. Web Worker not supported.");
} 
}

function redirection(object){
	var address = $(object).attr("href");
	window.open(address, '_system');
}

function GetWorkingOrNot(ip){
	$.ajax({url: "http://" + ip + "/AOB/hb.php",
			type: "HEAD",
			timeout:5000,
			statusCode: {
				200: function (response) {
					$("#debug").append("[OK]" +ip + "<br>");
					$("#debug").append("<a href='http://" +ip + "/AOB/'>Click here to redirect</a><br>");
					$("#discoverDeviceList").append(template.replace("{linked_url}","http://" + ip + "/AOB/").replace("{device_name}",ip));
				},
				400: function (response) {
					$("#debug").append("[NOT FIND]" +ip + "<br>");
				},
				0: function (response) {
					$("#debug").append("[DROPPED]" +ip + "<br>");
				}              
			}
		});
}


function GrapIP(){
	// NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
	var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

	if (RTCPeerConnection) (function () {
		var rtc = new RTCPeerConnection({iceServers:[]});
		if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
			rtc.createDataChannel('', {reliable:false});
		};
		
		rtc.onicecandidate = function (evt) {
			// convert the candidate to SDP so we can run it through our general parser
			// see https://twitter.com/lancestout/status/525796175425720320 for details
			if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
		};
		rtc.createOffer(function (offerDesc) {
			grepSDP(offerDesc.sdp);
			rtc.setLocalDescription(offerDesc);
		}, function (e) { console.warn("offer failed", e); });
		
		
		var addrs = Object.create(null);
		addrs["0.0.0.0"] = false;
		function updateDisplay(newAddr) {
			if (newAddr in addrs) return;
			else addrs[newAddr] = true;
			var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
			document.getElementById('list').textContent = displayAddrs.join(" or perhaps ") || "n/a";
		}
		
		function grepSDP(sdp) {
			var hosts = [];
			sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
				if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
					var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
						addr = parts[4],
						type = parts[7];
					if (type === 'host') updateDisplay(addr);
				} else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
					var parts = line.split(' '),
						addr = parts[2];
					updateDisplay(addr);
					
				}
			});
		}
	})(); else {
		document.getElementById('list').innerHTML = "<code>ifconfig | grep inet | grep -v inet6 | cut -d\" \" -f2 | tail -n1</code>";
		document.getElementById('list').nextSibling.textContent = "In Chrome and Firefox your IP should display automatically, by the power of WebRTCskull.";
		
		//Callback to next function
		
	}
	
}