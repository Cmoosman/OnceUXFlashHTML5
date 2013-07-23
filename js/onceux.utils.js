var UXUtilsManager = (function () {

    //Private Variables
					
    //Private Methods
    
    return {

        //Public Variables
        
		/**
		 * 
		 * getRawTime() Converts formated human readable time into raw time   
		 *
		 * @seconds : human readable time in seconds to be converted to raw time
		 * 
		 */
		getRawTime: function(seconds) {
		  
			var b = seconds.split(/\D/);
			var secTime = (+b[0])*60*60 + (+b[1])*60 + (+b[2]); 
			return secTime;
		},
		 
		/**
		 * 
		 * formatTime() Converts raw time into formated human readable time 
		 *
		 * @secs : raw time to be converted into human readable format
		 * 
		 */
		formatTime: function(secs) {
		   var hours = Math.floor(secs / (60 * 60));

		    var divisor_for_minutes = secs % (60 * 60);
		    var minutes = Math.floor(divisor_for_minutes / 60);
		
		    var divisor_for_seconds = divisor_for_minutes % 60;
		    var seconds = Math.ceil(divisor_for_seconds);
		
			// This line gives you 12-hour (not 24) time
			if (hours > 12) {hours = hours - 12;}
			
			// These lines ensure you have two-digits
			if (hours < 10) {hours = "0"+hours;}
			if (minutes < 10) {minutes = "0"+minutes;}
			if (seconds < 10) {seconds = "0"+seconds;}
			
			// This formats your string to HH:MM:SS
			var t = hours+":"+minutes+":"+seconds;
		
		    return t;
		},
		
		/**
		 * 
		 * handles writing json style object to console 
		 *
		 * @o : object to be parsed and written to console
		 * 
		 */
        writeToObjectsConsole: function(o){
            
           		var str='';

			    for(var p in o){
			        if(typeof o[p] == 'string'){
			            str+= p + ': ' + o[p]+'; \n';
			        }else{
			            str+= p + ': { \n' + print(o[p]) + '}';
			        }
			    }
			
			    return str;
       },
       
       /**
		 * 
		 * handles writing to the player/event console
		 *
		 * @eventInfo : event to be parsed and written to console
		 * 
		 */
		writeToEventConsole: function(eventInfo){
            
            currentEventList = $('#eventsBeacons').text();
            var recompiledEventInfo = eventInfo + "\n" + currentEventList;
            $("#eventsBeacons").text(recompiledEventInfo);
        },

        /**
         *
         * handles handles basic string split
         *
         * @resultStr : string to be split
         *
         * @splitter : character to split on
         *
         */
        stringSplit: function(resultStr, splitter) {

            var DtlStr;

            if (resultStr != null) {

                var SplitChars = splitter;

                if (resultStr.indexOf(SplitChars) >= 0) {

                    DtlStr = resultStr.split(SplitChars);

                    return DtlStr;
                }
                else{
                    return resultStr;
                }

            }
        }

    };

})();


     