// windows.insight.versioncode = v20160113
window.insight = window.insight || {};

window.insight.debugConsoleLogEnabled = false;
window.insight.debugLogMsgs = [];
window.insight.debugLog = function(inMsg) {
	window.insight.debugLogMsgs.push(inMsg);
	if (window.insight.debugConsoleLogEnabled) {
		console.log(inMsg);
	}
};

window.insight.enableWEDCS = function() {
    //WEDCS base settings
    window.varClickTracking = 1;
    window.varCustomerTracking = 0;
    window.varAutoFirePV = 1;
    window.route = "";
    window.ctrl = "";
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = window.location.protocol + "//c.microsoft.com/ms.js";
    document.getElementsByTagName("head")[0].appendChild(script);
}

jQuery(document).ready(function () {
    window.insight.enableWEDCS();
});