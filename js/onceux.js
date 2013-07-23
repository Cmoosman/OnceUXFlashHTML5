var UX = (function () {
	
	//Global
	var onceUXURL;
	var streamType;
	
	// Event Handlers
	var onAdSlotRegisteredCallback;
	var onAdSlotStartCallback;
	var onAdSlotEndCallback;
	var onTrackingUrlFiredCallback;
    var onCompanionAdCallback;
	var onOnceUrlCallback;
	
	// Debug vars

	//Private methods
	// Internal event handlers
	var onAdSlotRegistered = function(adSlot) {
		if (onAdSlotRegisteredCallback)
			onAdSlotRegisteredCallback(adSlot);
	}

	var onAdSlotStart = function(adSlot) {
		if (onAdSlotStartCallback)
			onAdSlotStartCallback(adSlot);
	}

	var onAdSlotEnd = function (adSlot) {
		if (onAdSlotEndCallback)
			onAdSlotEndCallback(adSlot);
	}

	var onTrackingUrlFired = function (trackingUrl) {
		if (onTrackingUrlFiredCallback)
			onTrackingUrlFiredCallback(trackingUrl);
	}

	var onOnceUrl = function (onceUrl) {
		if (onOnceUrlCallback)
			onOnceUrlCallback(onceUrl);
	}

    var onCompanionAd = function (companionAd){
        if(onCompanionAdCallback)
            onCompanionAdCallback(companionAd);

    }

	return {
		// Responsible for initializing OnceUX SDK, starting OAS timer to get VMAP every timespan
		init: function(url) {
			onceUXURL = url;
			
			streamType = onceUXURL.search('live'); 
			if(streamType == -1){	
				
				//Load VOD libs
				/*$.getScript('js/onceux.utils.js', function() {
		        	$.getScript('js/onceux.sdk.js', function() {
			            $.getScript('js/onceux.admanager.js', function() {
							$.getScript('js/onceux.beaconmanager.js', function() {
								$.getScript('js/onceux.vod.js', function() {
						            UXVOD.setAdServiceUrl(onceUXURL);
						            
						            UXVOD.onOnceUrl(onOnceUrl);
						            UXAdManager.onAdSlotRegistered(onAdSlotRegistered);
									UXAdManager.onAdSlotStart(onAdSlotStart);
									UXAdManager.onAdSlotEnd(onAdSlotEnd);
									UXBeaconManager.onTrackingUrlFired(onTrackingUrlFired);
						        });
					        });            
				        });
			        });    
		        });*/

				UXVOD.setAdServiceUrl(onceUXURL);
	            
	            UXVOD.onOnceUrl(onOnceUrl);
	            UXAdManager.onAdSlotRegistered(onAdSlotRegistered);
				UXAdManager.onAdSlotStart(onAdSlotStart);
				UXAdManager.onAdSlotEnd(onAdSlotEnd);
				UXBeaconManager.onTrackingUrlFired(onTrackingUrlFired);
                UXAdManager.onCompanionAd(onCompanionAd);
			}
			else{
				UXLive.init();
			}
		},
		
		updateCurrentTime: function(time) {
			UXAdManager.updateCurrentTime(time);
			UXBeaconManager.updateCurrentTime(time);
		},
		
		addEventListener: function (eventName, callback) {
			switch (eventName)
			{
				case "onAdSlotRegistered":
					onAdSlotRegisteredCallback = callback;
					break;
				case "onAdSlotStart":
					onAdSlotStartCallback = callback;
					break;
				case "onAdSlotEnd":
					onAdSlotEndCallback = callback;
					break;
				case "onTrackingUrlFired":
					onTrackingUrlFiredCallback = callback;
					break;
				case "onOnceUrl":
					onOnceUrlCallback = callback;
					break;
                case "onCompanionAd":
                    onCompanionAdCallback = callback;
                    break;
			}
		}
	};
})();
