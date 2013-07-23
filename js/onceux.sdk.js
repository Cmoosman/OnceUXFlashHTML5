var UXSDK = (function () {

    //Private Variables
    var _contentOnceURL = [];
    var _adBreakNodes = [];
    var _adDefinitions = [];
    var _adBreakTracking = [];
   	var _adBreakCompanionBanners = [];
   	var _adBreakID;
   	var onceURL;
	var adBreak;
	var adTracking;
	var adBreakBanners;
	var vmap_namespace = "*";
	var type;
    var companionResource;
    var companionClickThrough;

    //Private Methods
   	var formatTime;
   	var clearDataProviders;
	
    return {

     //Public Variables
        adBreakNodesArray: _adBreakNodes,
        adBreakTracking: _adBreakTracking,
		adBreakCompanionBanners: _adBreakCompanionBanners,
        
     //Public Methods for VOD
        
        /**
		 * Gets the companion banner ad for the current ad break inside the <StaticResource> node
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @xml : current vmap:AdBreak xml node and all its children
		 * 
		 * @nodeName : the current node we are looking for to parse <StaticResource>
		 * 
		 */
		GetContentOnceURL: function(xml, nodeName){
        	   
		    var colonIndex = nodeName.indexOf(":");
		    var tag = nodeName.substr(colonIndex + 1);
		    var nodes = xml.getElementsByTagNameNS("*", tag);
		    
		    for (var i = 0; i < nodes.length; i++)
		    { 
				var propertyValue = nodes[i].getAttribute('contenturi');
                return propertyValue;
                break;
            }
		},

		GetContentDuration: function(xml, nodeName){
        	   
		    var colonIndex = nodeName.indexOf(":");
		    var tag = nodeName.substr(colonIndex + 1);
		    var nodes = xml.getElementsByTagNameNS("*", tag);

		    for (var i = 0; i < nodes.length; i++)
		    {
                var propertyValue = nodes[i].getAttribute('payloadlength');
                return propertyValue;

                return propertyValue;
                break;
            }
		},
		
		 
        /**
		 * Gets all ad breaks for each ad break inside the <vmap:VMAP> node
		 * 
		 * @xml : current vmap:VMAP xml node and all its children
		 * 
		 * @nodeName : the current node we are looking for to parse <vmap:AdBreak>
		 * 
		 */
        VOD_GetAdBreaksNodeName: function(xml, nodeName){
        	   
        	type = "VOD";
		    var colonIndex = nodeName.indexOf(":");
		    var tag = nodeName.substr(colonIndex + 1);
		    var nodes = xml.getElementsByTagNameNS("*", tag);
		    for (var j = 0; j < nodes.length; j++)
		    {
		      
		      var adBreakXML = nodes[j];
		      
		      var currentAdTimeOffset = nodes[j].getAttribute('timeOffset');
		     
		      var adBreakIDNode = xml.getElementsByTagNameNS(vmap_namespace, 'AdSource')[j];
			  _adBreakID = adBreakIDNode.getAttribute('id');
			  
			  UXSDK.VOD_GetAdTrackingNodeName(j, adBreakXML, "Tracking");
		      UXSDK.VOD_GetCompanionBannerAd(j, adBreakXML, "Companion");
		      UXSDK.VOD_GetAdDefinitionsInAdBreak(xml, "AdBreak");

                adBreak = {
                    adType: type,
                    breakId: _adBreakID,
                    offsetFromStartMs: currentAdTimeOffset,
                    adDefinitions: _adDefinitions
                }

                _adBreakNodes.push(adBreak);
   
		    }

		    return _adBreakNodes;
		},
		
		/**
		 * Gets all tracking beacons for each ad break inside the <TrackingEvents> node
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @xml : current vmap:AdBreak xml node and all its children
		 * 
		 * @nodeName : the current node we are looking for to parse <Tracking>
		 * 
		 */
		VOD_GetAdDefinitionsInAdBreak: function(xml, nodeName){
			
			var colonIndex = nodeName.indexOf(":");
		    var tag = nodeName.substr(colonIndex + 1);
		    var nodes = xml.getElementsByTagNameNS("*", tag);
		    for (var k = 0; k < nodes.length; k++)
		    {
		    	var currentAdID = Number(_adBreakID);
				var adBreakDuration = xml.getElementsByTagNameNS(vmap_namespace, 'Duration')[k];
				var formatedAdDuration = adBreakDuration.textContent;
                var rawCurrentAdDuration = UXUtilsManager.stringSplit( formatedAdDuration, '+');
                var durationStr = rawCurrentAdDuration[0];
                var rawAdDurationMS = durationStr.slice(6, durationStr.length);
                var durNum = Number(rawAdDurationMS);
				//var formatedAdDurationToSlice = formatedAdDuration;

				
				adDuration = durNum;//formatedAdDurationToSlice.slice(0,8);

                var offset = nodes[k].getAttribute('timeOffset');
				
				if(currentAdID == k){
					var adDefinition = {
						adType: type,  // Vod or Live, figured out through once url
						adId: _adBreakID, // adBreakID + loop index
						mediaItemGuid: "", // don't need leave empty
						adPlacement: k, //loop index
						duration: adDuration, // duration of the ad
						assetUrl: "", // don't need leave empty
						trackingUrls: UXSDK.VOD_GetAdTrackingByAdSlot(currentAdID, _adBreakTracking),
						companionAds: UXSDK.VOD_GetCompanionBannerAdByAdSlot(currentAdID, _adBreakCompanionBanners)
					}
					
					_adDefinitions.push(adDefinition);	
					break;
				}
				
			}

		},
		
		/**
		 * Gets all tracking beacons for each ad break inside the <TrackingEvents> node
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @xml : current vmap:AdBreak xml node and all its children
		 * 
		 * @nodeName : the current node we are looking for to parse <Tracking>
		 * 
		 */
		VOD_GetAdTrackingNodeName: function(id, xml, nodeName){
        	   
		    var colonIndex = nodeName.indexOf(":");
		    var tag = nodeName.substr(colonIndex + 1);
		    var nodes = xml.getElementsByTagNameNS("*", tag);
		        
		    for (var m = 0; m < nodes.length; m++)
		    {	
	    		
				var propertyValue = nodes[m].firstChild.nodeValue;
				adTracking = {};
				adTracking["adId"] = id;
				adTracking["timePosition"] = nodes[m].getAttribute('offset');
                adTracking["url"] = propertyValue;
				_adBreakTracking.push(adTracking);
           	}
           	
    	},
    	
    	/**
		 * Filters all tracking beacons for each ad slot 
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @arrayTrackingURLs : all tracking beacon urls
		 * 
		 * 
		 */
		VOD_GetAdTrackingByAdSlot: function(id, arrayTrackingURLs){
        	     
        	var adSlotTrackingURLs = [];
        	var filterResult = [];     
		    for (var n = 0; n < arrayTrackingURLs.length; n++)
		    {	
	    		if(_adBreakTracking[n].adId === id){
	    					    
				  	filterResult.push(_adBreakTracking[n]);
	    		}
           	}
           	
           	adSlotTrackingURLs.push(filterResult);
           	
           	return adSlotTrackingURLs[0];
    	},
		
		/**
		 * Gets the companion banner ad for the current ad break inside the <StaticResource> & <CompanionClickThrough> node
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @currentAdTimeOffset : is the ad slot type preroll/midroll/postroll
		 * 
		 * @xml : top level xml node and all its children
		 * 
		 * 
		 */
		VOD_GetCompanionBannerAd: function(id, xml, nodeName){
        	
        	var colonIndex = nodeName.indexOf(":");
		    var tag = nodeName.substr(colonIndex + 1);
		    var nodes = xml.getElementsByTagNameNS("*", tag);


		    for (var x = 0; x < nodes.length; x++)
		    {	
				var adBreakID = id;
                var staticResourceNode = xml.getElementsByTagNameNS(vmap_namespace, 'StaticResource')[x];
                var htmlResourceNode = xml.getElementsByTagNameNS(vmap_namespace, 'HTMLResource')[x];
                var iFrameResourceNode = xml.getElementsByTagNameNS(vmap_namespace, 'IFrameResource')[x];

                if(staticResourceNode !== undefined){

                    companionResource = staticResourceNode.textContent;
                    var companionClickThroughNode = xml.getElementsByTagNameNS(vmap_namespace, 'CompanionClickThrough')[x];
                    companionClickThrough = companionClickThroughNode.textContent;
                }
                else if(htmlResourceNode !== undefined){

                    companionResource = htmlResourceNode.textContent;
                    companionClickThrough = "";
                }
                else if(iFrameResourceNode !== undefined){

                    companionResource = iFrameResourceNode.textContent;
                    companionClickThrough = "";
                }

				adBreakBanners = {};
				adBreakBanners["adBreakID"] = adBreakID;
				adBreakBanners["staticResource"] = companionResource;
				adBreakBanners["companionClickThrough"] = companionClickThrough;
				
				_adBreakCompanionBanners.push(adBreakBanners);
           	}
		},
		
		/**
		 * Filters all companion banners for each ad slot 
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @arrayCompanionBanners : all banners
		 * 
		 * 
		 */
		VOD_GetCompanionBannerAdByAdSlot: function(id, arrayCompanionBanners){
        	     
        	var adSlotBanners = [];
        	var bannerFilterResult = [];     
		    for (var p = 0; p < arrayCompanionBanners.length; p++)
		    {	
	    		if(arrayCompanionBanners[p].adBreakID === id){
	    					    
				  	bannerFilterResult.push(_adBreakCompanionBanners[p]);
	    		}
           	}
           	
           	adSlotBanners.push(bannerFilterResult);
           	
           	return adSlotBanners[0];
    	},
    	
    	
    //Public Methods for LIVE
    	 
	   /**
	    * Gets all ad breaks for each ad break inside the <vmap:VMAP> node
	    * 
	    * @xml : current vmap:VMAP xml node and all its children
	    * 
	    * @nodeName : the current node we are looking for to parse <vmap:AdBreak>
	    * 
	    */
        LIVE_GetAdBreaksNodeName: function (xml, nodeName) {

            var colonIndex = nodeName.indexOf(":");
            var tag = nodeName.substr(colonIndex + 1);
            var nodes = xml.getElementsByTagNameNS("*", tag);
            for (var i = 0; i < nodes.length; i++) {
                var adBreakXML = nodes[i];
                var adBreakID = adBreakXML.getAttribute('breakId');
                var offsetFromStartMs = adBreakXML.getAttribute('offsetFromStartMs');

                var adDefinitions = UXSDK.getAdDefinitionsInAdBreak(adBreakXML, 'AdDefinition');

				var adBreak = {
                    breakId: adBreakID,
                    offsetFromStartMs: offsetFromStartMs,
                    adDefinitions: adDefinitions
                }

                _adBreakNodes.push(adBreak);
            }

            return _adBreakNodes;
        },
    	
		/**
		 * Gets all tracking beacons for each ad break inside the <TrackingEvents> node
		 * 
		 * @id : the id of the current vmap:AdBreak
		 * 
		 * @xml : current vmap:AdBreak xml node and all its children
		 * 
		 * @nodeName : the current node we are looking for to parse <Tracking>
		 * 
		 */
		 LIVE_GetAdDefinitionsInAdBreak: function(xml, nodeName) {
			var colonIndex = nodeName.indexOf(":");
            var tag = nodeName.substr(colonIndex + 1);
            var nodes = xml.getElementsByTagNameNS("*", tag);
            var adDefinitions = [];
            
            for (var i = 0; i < nodes.length; i++) {
        		var adDefinitionXML = nodes[i];
				var mediaItemGuid = adDefinitionXML.getElementsByTagName('MediaItemGuid')[0].textContent; //getAttribute('mediaItemGuid');
                var adPlacement = adDefinitionXML.getElementsByTagName('AdPlacement')[0].textContent;//getAttribute('adPlacement');
                var duration = adDefinitionXML.getElementsByTagName('Duration')[0].textContent;//getAttribute('duration');
                var assetUrl = adDefinitionXML.getElementsByTagName('AssetUrl')[0].textContent;//getAttribute('assetUrl');
                var adId = mediaItemGuid + "_" + adPlacement;
        	
        		var trackingUrls = UXSDK.getAdTrackingNodeName(adId, adDefinitionXML, "TrackingUrl");
            
        		var adDefinition = {
        			adId: adId,
                    mediaItemGuid: mediaItemGuid,
                    adPlacement: adPlacement,
                    duration: duration,
                    assetUrl: assetUrl,
                    trackingUrls: trackingUrls
                }

                adDefinitions.push(adDefinition);
        	}

        	return adDefinitions;
        },
        
        /**
         * Gets all tracking beacons for each ad break inside the <TrackingEvents> node
         * 
         * @id : the id of the current vmap:AdBreak
         * 
         * @xml : current vmap:AdBreak xml node and all its children
         * 
         * @nodeName : the current node we are looking for to parse <Tracking>
         * 
         */
        LIVE_GetAdTrackingNodeName: function (id, xml, nodeName) {

            var colonIndex = nodeName.indexOf(":");
            var tag = nodeName.substr(colonIndex + 1);
            var nodes = xml.getElementsByTagNameNS("*", tag);
            var trackingUrls = [];

            for (var i = 0; i < nodes.length; i++) {

                trackingUrl = {};
                trackingUrl["adId"] = id;
                trackingUrl["timePosition"] = nodes[i].getElementsByTagName('TimePosition')[0].textContent;//getAttribute('timePosition');
                trackingUrl["url"] = nodes[i].getElementsByTagName('Url')[0].textContent;//getAttribute('url');

                trackingUrls.push(trackingUrl);
            }

            return trackingUrls;
        }
    };

})();

// Usage:

/*
* Adds a object to our path dataprovider
*  beaconTemplateData.addPath(id, path);
*
* Updates a object to our path dataprovider
*  beaconTemplateData.createUpdatePath(id, path);
*
* Removes a object to our path dataprovider
*  beaconTemplateData.removePath(id, path);
*
* Updates a object to our querystring dataprovider
*   beaconTemplateData.createUpdateQueryStringKVP(keyid, keyname, keyvalue);
*
* Removes a object to our querystring dataprovider
*  beaconTemplateData.removeQueryStringKVP(keyid, keyname, keyvalue);
*
*
*
*/
     