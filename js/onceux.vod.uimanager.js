var UXVODUIManager = (function () {

    //Private Variables
    var _currentAdId;
    var _currentRunningAdTime;
    var _currentBannerURL;
    var _currentAdClickURL;
    var _adCountDownTimer;

    //Private Methods

    return {

        //Public Variables
        /**
         *
         * Set the count down time for currently playing ad slot
         *
         * @adId : current ad ID
         *
         * @currentRunningAdTime : duration of the current ad
         *
         */
        SetAdSlotCountdown: function(adId, currentRunningAdTime) {

            _currentAdId = adId;
            _currentRunningAdTime = currentRunningAdTime;

            var adFlag = true;
            UXVODUIManager.SetAdCountDisplay(adFlag);
            _adCountDownTimer = setInterval(UXVODUIManager.AdSlotCountdown,1000);

        },

        /**
         *
         * Set the current ui display state for currently playing ad slot
         *
         * @adFlag : boolean flag to switch ui display state
         *
         *
         */
        SetAdCountDisplay: function(adFlag) {

           if(adFlag == true){
               $("#adOverlay").css({ visibility: "visible" });
               $('#adOverlay').css({ display: "block" });
               $('#adOverlay').css({ "z-index": 100 });
               $('#adOverlay').css({ width: 520 });
               $('#adOverlay').css({ height: "30px" });
               $('#adOverlay').css({ backgroundColor: "#333" });
               $('#adOverlay').css({ position: "relative" });
               $('#adOverlay').css({ bottom: "35px" });
               $('#adOverlay').css({ color: "#909090" });

           }
           else{

               $("#adOverlay").css({ visibility: "hidden" });
               $('#adOverlay').css({ display: "none" });
           }
        },

        /**
         *
         * Handles the ad count down timer display
         *
         *
         */
        AdSlotCountdown: function() {

            _currentRunningAdTime --;

            //handles UI for ad messaging overlay
            var adOverlayMessage = 	"Ad slot: " + _currentAdId + " has " + _currentRunningAdTime + " seconds left.";
            $("#adOverlay").html(adOverlayMessage);

            if(_currentRunningAdTime == 0 || _currentRunningAdTime == -1){
                _currentRunningAdTime = 0;
                clearInterval(UXVODUIManager._adCountDownTimer);
                var adFlag = false;
                UXVODUIManager.SetAdCountDisplay(adFlag);
            }
        }
    };

})();



