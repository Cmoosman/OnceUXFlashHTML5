var UXAdManager = (function () {

    //Private Variables
	var _currentAdSlots = [];
	var _processedAdSlots = [];
	var _completedAdSlots = [];
	var _activeAdSlot;

    //Private Methods
   	var getRawTime;
   	var formatTime;
   	var clearDataProviders;
	var onAdSlotRegisteredCallback;
	var onAdSlotStartCallback;
	var onAdSlotEndCallback;
    var onCompanionAdCallback;

    return {

        //Public Variables
	    adSlots: _currentAdSlots,
		
        //Public Methods
        tryAppendAdSlots: function (adSlots) {
	        for (var i = 0; i < adSlots.length; i++) {
	        	var adSlot = adSlots[i];
				var currentAdSlotExists = _currentAdSlots.filter(function(adSlotMember) { return adSlotMember.adId == adSlot.adId });
				var processedAdSlotExists = _processedAdSlots.filter(function(adSlotMember) { return adSlotMember.adId == adSlot.adId });
				var completedAdSlotExists = _completedAdSlots.filter(function(adSlotMember) { return adSlotMember.adId == adSlot.adId });
				if (currentAdSlotExists.length == 0 && processedAdSlotExists.length == 0 && completedAdSlotExists.length == 0) {
					_currentAdSlots.push(adSlot); 
					UXAdManager.onAdSlotRegisteredCallback(adSlot);
				}
			}
        },

		getAdSlotsFromLiveAdBreaks: function(adBreaks){
        	for (var i = 0; i < adBreaks.length; i++) {

        		var adBreak = adBreaks[i];
        		var adMSecondsOffset = 0;

				for (var j = 0; j < adBreak["adDefinitions"].length; j++) {
					var adDefinition = adBreak["adDefinitions"][j];
					var adId = adDefinition.adId;
					var adDurationSeconds = parseInt(adDefinition.duration);

					var offsetFromStartMs = parseInt(adBreak.offsetFromStartMs) + adMSecondsOffset;
					var offsetFromStartMsEnd = offsetFromStartMs + (adDurationSeconds * 1000);

					var adSlot = {
						adId: adId,
						adDefinition: adDefinition,
						offsetFromStartMs: offsetFromStartMs,
						offsetFromStartMsEnd: offsetFromStartMsEnd
					};

					adMSecondsOffset += adDurationSeconds * 1000;

					UXAdManager.tryAppendAdSlots(adSlot);
				}				
            }          
		},

		getAdSlotsFromVodAdBreaks: function (adBreaks, contentDuration) {

			var prerolls = adBreaks.filter(function(adBreakMember) { return adBreakMember.offsetFromStartMs == "start" });
			var midrolls = adBreaks.filter(function(adBreakMember) { return adBreakMember.offsetFromStartMs != "start" && adBreakMember.offsetFromStartMs != "end"});
			var postrolls = adBreaks.filter(function(adBreakMember) { return adBreakMember.offsetFromStartMs == "end" });

			var sortedMidrolls = {};

			for(var i = 0; i < midrolls.length; i++) {
				var midroll = midrolls[i];
				//var rawMidrollStartMs = UXUtilsManager.getRawTime(adDuration);
                var rawMidrollStartMs = adDuration;
				if (!sortedMidrolls[rawMidrollStartMs])
					sortedMidrolls[rawMidrollStartMs] = [];
				sortedMidrolls[rawMidrollStartMs].push(midroll);
			}

			var adSlots = [];

			var adMSecondsOffset = 0;
			for(var i = 0; i < prerolls.length; i++) {
				var preroll = prerolls[i];
                var durNumMs = parseFloat(preroll.adDefinitions[i].duration).toFixed(3);
				var adDurationSeconds = durNumMs;
				var offsetFromStartMs = adMSecondsOffset;
				var offsetFromStartMsEnd = offsetFromStartMs + (adDurationSeconds * 1000);

				var adSlot = {
					adId: preroll.breakId,
					adDefinition: preroll.adDefinitions[i],
					offsetFromStartMs: offsetFromStartMs,
					offsetFromStartMsEnd: offsetFromStartMsEnd
				}
				adSlots.push(adSlot);

				adMSecondsOffset += adDurationSeconds * 1000;
			}

			for(var midrollOffset in sortedMidrolls) {

                var midrollEntity = sortedMidrolls[midrollOffset];
                var prerollLength = prerolls.length;
                var midrollEntityLength = midrollEntity.length;
                var loopEnd = Number(prerollLength) + Number(midrollEntityLength);
                var counter = 0;

				for (var j = Number(prerollLength); j < Number(loopEnd); j++) {
					var midroll = midrollEntity[j];

                    var durationStr = midrolls[counter].offsetFromStartMs;
                    var rawOffsetMS = durationStr.slice(6, durationStr.length);
                    var durNum = Number(rawOffsetMS);
                    var offSetNum = durNum;
					var midrollOffsetMs = parseFloat(offSetNum) * 1000;

					var adDurationSeconds = parseFloat(midrolls[counter].adDefinitions[j].duration);
					var offsetFromStartMs = adMSecondsOffset + midrollOffsetMs;
					var offsetFromStartMsEnd = offsetFromStartMs + (adDurationSeconds * 1000);

					var adSlot = {
						adId: midrolls[counter].breakId,
						adDefinition: midrolls[counter].adDefinitions[j],
						offsetFromStartMs: offsetFromStartMs,
						offsetFromStartMsEnd: offsetFromStartMsEnd
					}
					adSlots.push(adSlot);

					adMSecondsOffset += adDurationSeconds * 1000;
                    counter++;
				}
			}

            var postCounter = 0;
			for(var k = 0; k < postrolls.length; k++) {
				var postroll = postrolls[k];

				var contentDurationMs = parseFloat(contentDuration) * 1000;
				var adDurationSeconds = parseFloat(postroll.adDefinitions[postCounter].duration);
				var offsetFromStartMs = adMSecondsOffset + contentDurationMs;
				var offsetFromStartMsEnd = offsetFromStartMs + (adDurationSeconds * 1000);

				var adSlot = {
					adId: postroll.breakId,
					adDefinition: postroll.adDefinitions[postCounter],
					offsetFromStartMs: offsetFromStartMs,
					offsetFromStartMsEnd: offsetFromStartMsEnd
				}
				adSlots.push(adSlot);

				adMSecondsOffset += adDurationSeconds * 1000;
                postCounter++;
			}

			UXAdManager.tryAppendAdSlots(adSlots);		
        },

		updateCurrentTime: function(time) {
			for (var i = 0; i < _currentAdSlots.length; i++) {
				var adSlot = _currentAdSlots[i];
				if (adSlot.offsetFromStartMsEnd > 0) {
					if (adSlot.offsetFromStartMs <= time) {
						UXAdManager.handleAdSlot(time, adSlot);
						UXAdManager.onAdSlotStartCallback(adSlot);
                        UXAdManager.onCompanionAdCallback(adSlot);
						UXBeaconManager.handleAdSlot(time, adSlot);
						_processedAdSlots.push(adSlot);
						_currentAdSlots.splice(i, 1);
					
					}
				}
			}

			for (var i = 0; i < _processedAdSlots.length; i++) {
				var adSlot = _processedAdSlots[i];
				if (adSlot.offsetFromStartMsEnd <= time) {
					UXAdManager.onAdSlotEndCallback(adSlot)
					_completedAdSlots.push(adSlot);
					_processedAdSlots.splice(i, 1);
				}
			}
		},

		handleAdSlot: function(time, adSlot) {
			_activeAdSlot = adSlot;
		},

		onAdSlotRegistered: function (callback) {
			UXAdManager.onAdSlotRegisteredCallback = callback;
		},

		onAdSlotStart: function(callback) {
			UXAdManager.onAdSlotStartCallback = callback;
		},

		onAdSlotEnd: function (callback) {
			UXAdManager.onAdSlotEndCallback = callback;
		},

        onCompanionAd: function(callback){
            UXAdManager.onCompanionAdCallback = callback;
        }

    };

})();