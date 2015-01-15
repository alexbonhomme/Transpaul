$(function() {
    var parameters = {
        Time: moment().format('1|H|mm'),
        Date: moment().format('YYYY|MM|DD'),
        DPoint: 'StopArea|4930|Euratechnologies|Lomme|||648347|2626790|7673!0!14;7672!0!14;',
        // DPoint: 'StopArea%7C4930%7CEuratechnologies%7CLomme%7C%7C%7C648347%7C2626790%7C7673%210%2114%3B7672%210%2114%3B',
        APoint: 'StopArea|4883|République Beaux Arts|Lille|||651349|2626621|7565!0!14;7567!0!14;7564!0!14;7566!0!14;7563!0!14;',
        // APoint: 'StopArea%7C4883%7CR%E9publique%20Beaux%20Arts%7CLille%7C%7C%7C651349%7C2626621%7C7565%210%2114%3B7567%210%2114%3B7564%210%2114%3B7566%210%2114%3B7563%210%2114%3B'
    };

    var API_BASE = 'https://www.kimonolabs.com/api/4c0vvu5c';
    var API_KEY = 'XVR3AHVfhnrC71491JshKyvRTfs0W4VB';

    $.get(encodeURI(API_BASE + '?apikey=' + API_KEY + 
    				 '&Time=' + parameters.Time + 
    				 '&Date=' + parameters.Date +
    				 '&DPoint=' + parameters.DPoint +
    				 '&APoint=' + parameters.APoint), 
    	function (data) {
    		var timeTables = removesPassedTimetables(data.results.collection1);

    		if (timeTables.length == 0) {
    			$('#data').html('<img src="assets/dawson-crying.jpg"/><p class="bus-not-found">Aucun bus trouvé...</p>');
    			return;
    		}

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