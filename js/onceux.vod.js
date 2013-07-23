var UXVOD = (function () {
	//Private variables
	//Production multiple ads in every slot
	//http://oas.unicornmedia.com/now/ads/vmap/od/auto/b11dbc9b-9d90-4edb-b4ab-769e0049209b/0b4b1b29-f173-4f20-8cd6-5fe12a2e70b3/more Prod
	//http://onceux.unicornmedia.com/now/ads/vmap/od/auto/b11dbc9b-9d90-4edb-b4ab-769e0049209b/2455340c-8dcd-412e-a917-c6fadfe268c7/3a41c6e4-93a3-4108-8995-64ffca7b9106/bigbuckbunny QA
	
	//M3U8
	//http://oas.unicornmedia.com/now/ads/vmap/adaptive/m3u8/b11dbc9b-9d90-4edb-b4ab-769e0049209b/0b4b1b29-f173-4f20-8cd6-5fe12a2e70b3/more
	var VODAdServiceURL;
	
	var currentAdServiceXml;
	var currentAdBreaks;

	var currentPtsTime;

	// Event Handlers
	var onOnceUrlCallback;

	// Debug vars

	//Private methods
	var onAdServiceSuccess = function(data, textStatus, jqXHR) {
		//set namespace vars for parsing VMAP response
	   	var vmap_namespace = '*';
		var vmapVast_namespace = 'vmap:VASTData';
		
		//use the DOM parseer to parse the response data object
		var parser = new DOMParser(); 
		currentAdServiceXml = parser.parseFromString(data, "text/xml");

		$("#vmapResponse").text(data);
		
		var onceUrl = UXSDK.GetContentOnceURL(currentAdServiceXml, "uo:unicornOnce");

		var contentDuration = UXSDK.GetContentDuration(currentAdServiceXml, "uo:unicornOnce");
		
		var adBreakNodes = UXSDK.VOD_GetAdBreaksNodeName(currentAdServiceXml, "vmap:AdBreak");
		
		//calculate AdBreak Properties
		UXAdManager.getAdSlotsFromVodAdBreaks(adBreakNodes, contentDuration);

		//check to make sure we have asset url and banner ads
		if(onceUrl){
			onOnceUrlCallback(onceUrl);	
		}
		
	}

	var getAdServiceData = function() {
		$.ajax({
			type: 'GET',
			url: VODAdServiceURL,
			dataType: 'html',
			success: onAdServiceSuccess
		});
	}
	
	return {
		init: function(url) {
		
			
		},		
		setAdServiceUrl: function(url) {
			VODAdServiceURL = url;
			getAdServiceData();
		},
		onOnceUrl: function(callback) {
			onOnceUrlCallback = callback;
		}
	};
})();
