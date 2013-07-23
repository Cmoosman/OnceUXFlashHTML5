var UXBeaconManager = (function () {

    //Private Variables
	var _currentAdSlot;
	var _currentSlotStartMSec;
	var _currentTrackingUrls = [];

    //Private Methods
   	var onTrackingUrlFiredCallback;
	
    return {

        //Public Variables
	    currentAdSlot: _currentAdSlot,
        
        //Public Methods
        handleAdSlot: function(time, adSlot) {
        	if (_currentAdSlot && _currentTrackingUrls && _currentTrackingUrls.length > 0) {
        		// Leftover tracking, fire all of them
        		for(var i = 0; i < _currentTrackingUrls.length; i++) {
        			var trackingUrl = _currentTrackingUrls[i];
        			UXBeaconManager.fireTrackingUrl(trackingUrl);
        			_currentTrackingUrls.splice(i, 1);
        		}
        	}
        	// Responsible for duration of entire ad slot
        	_currentAdSlot = adSlot;
        	_currentSlotStartMSec = adSlot.offsetFromStartMs;
        	_currentTrackingUrls = [];
        	var trackingUrls = adSlot["adDefinition"]["trackingUrls"];
        	UXBeaconManager.processTrackingUrls(trackingUrls);        	
        },

        updateCurrentTime: function(time) {
        	for(var i = 0; i < _currentTrackingUrls.length; i++) {
        		var trackingUrl = _currentTrackingUrls[i];
        		if (trackingUrl["offsetFromStartMs"] <= time) {
        			UXBeaconManager.fireTrackingUrl(trackingUrl);
        			_currentTrackingUrls.splice(i, 1);
        		}
        	}
        },

        processTrackingUrls: function(trackingUrls) {
        	
			if (trackingUrls && trackingUrls.length > 0) {
        		for(var i = 0; i < trackingUrls.length; i++) {
        			var trackingUrl = trackingUrls[i];
        			var offsetFromStartMs = _currentSlotStartMSec + (parseInt(trackingUrl["timePosition"]) * 1000);
                    trackingUrl["offsetFromStartMs"] = offsetFromStartMs;
                    
                    if (offsetFromStartMs > 0) {
            			_currentTrackingUrls.push(trackingUrl);
                    }
        		}
        	}
        },

        fireTrackingUrl: function(trackingUrl) {
			
			UXUtilsManager.writeToEventConsole("Firing beacon for adId: " + _currentAdSlot.adId + ", URL: " + trackingUrl.url);
            UXBeaconManager.onTrackingUrlFiredCallback(trackingUrl);

			$.ajax({
            type: 'POST',
            url: trackingUrl.url,
            success: function (data){}
    		});	
        },

        onTrackingUrlFired: function (callback) {
            UXBeaconManager.onTrackingUrlFiredCallback = callback;
        }

    };

})();


     

