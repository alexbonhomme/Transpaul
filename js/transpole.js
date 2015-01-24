(function($) {
	// Kimonolabs
	var API_BASE = 'https://www.kimonolabs.com/api/4c0vvu5c';
    var API_KEY = 'XVR3AHVfhnrC71491JshKyvRTfs0W4VB';

    // Transpole
	var API_USERID = '20150122212655462'
 
    $.fn.transpole = function (action) {
 		var thisObject = this;
    	switch (action) {
    		case 'favoris':
				$.ajax({
					url: 'https://www.transpole.fr/favoris.aspx',
					method: 'POST',
					data: 'id=' + API_USERID,
					success: function(data){
						// console.log('succes: '+data);
						// $('#data').html(data);

						if (data != "0") {
							xmlDoc = $.parseXML(data);
							$xml = $(xmlDoc);
							
							dom = buildFavoris($xml);
							// console.log(dom)

							thisObject.each(function () {
					        	// console.log(dom)
					        	$(this).html(dom);
					        });
						}
					}
				});
    			break;

    		case 'itinerary':
    			var parameters = {
			        Time: moment().format('1|H|mm'),
			        Date: moment().format('YYYY|MM|DD'),
			        DPoint: 'StopArea|4930|Euratechnologies|Lomme|||648347|2626790|7673!0!14;7672!0!14;',
			        // DPoint: 'StopArea%7C4930%7CEuratechnologies%7CLomme%7C%7C%7C648347%7C2626790%7C7673%210%2114%3B7672%210%2114%3B',
			        APoint: 'StopArea|4883|République Beaux Arts|Lille|||651349|2626621|7565!0!14;7567!0!14;7564!0!14;7566!0!14;7563!0!14;',
			        // APoint: 'StopArea%7C4883%7CR%E9publique%20Beaux%20Arts%7CLille%7C%7C%7C651349%7C2626621%7C7565%210%2114%3B7567%210%2114%3B7564%210%2114%3B7566%210%2114%3B7563%210%2114%3B'
			    };

			    $.ajax({
			    	url: encodeURI(API_BASE + '?apikey=' + API_KEY + 
						    				  '&Time=' + parameters.Time + 
						    				  '&Date=' + parameters.Date +
						    				  '&DPoint=' + parameters.DPoint +
						    				  '&APoint=' + parameters.APoint), 
			    	method: 'GET',
					success: function(data){
			    		var timeTables = removesPassedTimetables(data.results.collection1);

			    		if (timeTables.length == 0) {
			    			dom = '<img src="assets/dawson-crying.jpg"/><p class="bus-not-found">Aucun bus trouvé...</p>';
			    			return;
			    		}

				        dom = buildTableDOMFromData(timeTables);

			        	thisObject.each(function () {
				        	// console.log(dom)
				        	$(this).html(dom);
				        });
				    }
				});
    			break;
    		default:
    			break;
    	}

        return this;
    };

    function buildFavoris (docXml) {
		var string_html = "";
        // on regarde s'il y a des passages
        if (docXml.find('Passages').text().length > 0) {

            //si il y a des passages, on regarde s'il y a un message reseau, si oui, on met a jour le div reseau                        
            if (docXml.find('Reseau').text().length > 0) {
                var classe = "";
                var bloquant_reseau;
                var titre_reseau;
                var texte_reseau;
                docXml.find('Reseau').each(
                         function() {
                             bloquant_reseau = $(this).find('Bloquant').text();
                             titre_reseau = $(this).find('Titre').text();
                             texte_reseau = $(this).find('Texte').text();
                         }
                 );
                if (bloquant_reseau == "true")
                    classe = "color_f29500"
                else
                    classe = "color_78a000"
                $("#DivMessageReseau").html("<span class='" + classe + "'>" + titre_reseau + "<br>" + texte_reseau + "</span>");
            }

	        docXml.find('Passage').each(function() {
                 string_html = string_html.concat("<div class='blocFavoris_ligne'>");
                 string_html = string_html.concat("<p>");
                 if ($(this).find('Ligne').text() != "") {
                     string_html = string_html.concat("<strong>" + $(this).find('Ligne').text() + " : " + $(this).find('Arret').text() + "</strong><br>");
                 }
                 if ($(this).find('Direction1').text() != "") {
                     string_html = string_html.concat($(this).find('Direction1').text());
                     if ($(this).find('Temps1').text()!="")
                     {
                       string_html = string_html.concat(" : <strong>" + $(this).find('Temps1').text() + " min</strong><br>");
                     }
                 }
                 if ($(this).find('Direction2').text() != "") {
                     string_html = string_html.concat($(this).find('Direction2').text() + " : <strong>" + $(this).find('Temps2').text() + " min</strong><br>");
                 }
                 string_html = string_html.concat("</p>");

                 //messages..... 
                 $(this).find('Message').each(
                   function() {
                       string_html = string_html.concat("<p class='favoris_txtmessage'>");
                       if ($(this).find('Bloquant').text() == "true") {
                           string_html = string_html.concat("<span class='color_f29500'>");
                       }
                       else {
                           string_html = string_html.concat("<span class='color_78a000'>");
                       }
                       string_html = string_html.concat($(this).find('Titre').text() + " <br/> " + $(this).find('Texte').text() + "<br>");
                       string_html = string_html.concat("</p>");

                   }
                 );
                 string_html = string_html.concat("</div>");
             });
        }
        
        return string_html;
	}

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
}(jQuery));