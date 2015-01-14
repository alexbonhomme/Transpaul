$(function() {
    var params = {
        time: moment().format('1%7CH%7Cmm'),
        date: moment().format('YYYY%7CMM%7CDD')
    };

    var API_BASE = 'https://www.kimonolabs.com/api/4c0vvu5c';
    var API_KEY = 'XVR3AHVfhnrC71491JshKyvRTfs0W4VB';

    $.get(API_BASE + '?apikey=' + API_KEY + '&Time=' + params.time + '&Date=' + params.date, 
    	function(data) {
    		var timeTables = removesPassedTimetables(data.results.collection1);

	        $('#data').html(buildTableDOMFromData(timeTables));
	    });

    function removesPassedTimetables (data) {
    	var nextTimetable = [];
    	data.forEach(function (value) {
    		// This an hour with a date (eg. the next day)
    		if (value['Départ'].length > 5) {
    			return value;
    		}

    		// check if the timetable is in the future
    		var valueMoment = moment().hours(value['Départ'].substring(0,2)).minutes(value['Départ'].substring(3));
    		if(valueMoment.diff(moment()) > 0) {
				nextTimetable.push(value);
    		}
    	});

		return nextTimetable;
    }

    function buildTableDOMFromData (data) {
    	var tableRows = '';
        data.forEach(function (value) {
        	tableRows += '\
        		<tr>\
        			<td>' + value['Départ'] + '</td>\
        			<td>' + value['Durée'] + '</td>\
        			<td>' + value['Arrivée'] + '</td>\
        		</tr>';
        });

        var table = '\
	        <table class="table">\
	        	<thead>\
			        <tr>\
			          <th>Départ</th>\
			          <th>Durée</th>\
			          <th>Arrivée</th>\
			        </tr>\
			    </thead>\
			    <tbody>' + tableRows + '</tbody>';
        
        return table;
    }
});