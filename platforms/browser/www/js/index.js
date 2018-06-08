//Standard IMUS Application Offline / Online Mode Detector
    $( document ).ready(function() {
        if (Offline.check() == true){
			//Offline Mode
			//alert("Offline");
			$("#status").html("系統オフライン <br> OFFLINE MODE");
			setTimeout(function(){ window.location = "manual.html"; }, 500);
		}else{
			//Online Mode
			//alert("Online!");
			$("#status").html("系統オンライン<br>読み込み中...");
			setTimeout(function(){ window.location = "scan.html"; }, 500);
		}
    });
 
		
  