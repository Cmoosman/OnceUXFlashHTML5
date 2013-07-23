var UXLive = (function () {
	//Private variables
	//var liveAdServiceURL = "http://onceux.unicornmedia.com/now/ads/vmap/od/auto/b11dbc9b-9d90-4edb-b4ab-769e0049209b/2455340c-8dcd-412e-a917-c6fadfe268c7/3a41c6e4-93a3-4108-8995-64ffca7b9106/bigbuckbunny?umtp=0"; 
	//var liveAdServiceURL = "http://192.168.111.167/liveux/onceux.live.response.xml"; 
	//liveAdServiceURL = "http://192.168.111.167:85/now/ads/vmap/live/auto/b9805fca-b3a0-4ce0-9c21-ac7f482c1d05/5657a92a-aeb1-49b6-a777-47d51799cb90/3a41c6e4-93a3-4108-8995-64ffca7b9106/bb37d800-9baa-4ef5-bd8f-32d2c5e5da33?visitguid=nicksGuid";
	var liveAdServiceURL;

	var adServiceTimerId;
	var adServiceTimeout = 5000;
	
	var currentAdServiceXml;
	var currentAdBreaks;

	var currentPtsTime;

	// Event Handlers

	// Debug vars

	//Private methods
	var onAdServiceSuccess = function(data, textStatus, jqXHR) {
		//set namespace vars for parsing VMAP response
	   	var vmap_namespace = '*';
		var vmapVast_namespace = 'vmap:VASTData';
		
		//use the DOM parseer to parse the response data object
		var parser = new DOMParser(); 
		currentAdServiceXml = parser.parseFromString(data, "text/xml");

		// Populate AdBreaks
		currentAdBreaks = UXSDK.LIVE_GetAdBreaksNodeName(currentAdServiceXml, "vmap:LiveAdBreak");

		// Generate AdBreak Properties
		UXAdManager.getAdSlotsFromLiveAdBreaks(currentAdBreaks);

		for (var i = 0; i < UXLiveAdManager.adSlots.length; i++) {
			log.debug("adSlot: offsetFromStartMs: ", UXLiveAdManager.adSlots[i].offsetFromStartMs + "ms");
		}
		
	}

	var getAdServiceData = function() {
		$.ajax({
			type: 'GET',
			url: liveAdServiceURL,
			dataType: 'html',
			success: onAdServiceSuccess
		});
	}

	var getAdServiceReadyFlag = function() {
		$.ajax({
			type: 'GET',
			url: liveAdServiceURL,
			dataType: 'html',
			success: onAdServiceSuccess
		});
	}

	var startAdServiceTimer = function() {
		adServiceTimerId = setInterval(getAdServiceData, adServiceTimeout);
		getAdServiceData();
	}

	var stopAdServiceTimer = function() {
		clearInterval(adServiceTimerId);
	}

	return {
		// Responsible for initializing OnceUX SDK, starting OAS timer to get VMAP every timespan
		init: function() {
			startAdServiceTimer();
		},
		setAdServiceUrl: function(url) {
			liveAdServiceURL = url;
		}
	};
})();

