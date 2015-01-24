(function($) {
	// Kimonolabs
	var API_BASE = 'https://www.kimonolabs.com/api/4c0vvu5c';
    var API_KEY = 'XVR3AHVfhnrC71491JshKyvRTfs0W4VB';

    // Transpole
	var API_USERID = '20150122212655462'

    var API_MOBI_BASE = 'http://www.transpole.mobi'
 
    $.fn.transpole = function (action) {
 		var thisObject = this;
    	switch (action) {
    		case 'favoris':
				$.ajax({
					url: 'https://www.transpole.fr/favoris.aspx',
					method: 'POST',
					data: 'id=' + API_USERID,
					success: function(data){
						console.log('succes: '+data);
						// $('#data').html(data);

						if (data != 0) {
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
                // http://transpole.prod.navitia.com/navitia/ITI_2_AnswersList.asp?DPoint=StopArea|5034&APoint=StopArea|4987&Date=2015|01|24&Time=1|16|35&Criteria=1|50|&Mode=Bus&DateFinBases=2015|07|04&DateMajBases=2015|01|24
    			
                var parameters = {
			        Time: moment().format('1|H|mm'),
			        Date: moment().format('YYYY|MM|DD'),
			        DPoint: 'StopArea|5034|Euratechnologies|Lomme',
			        APoint: 'StopArea|4987|République Beaux Arts|Lille',
                    Mode: 'Bus'
                };

			    $.ajax({
			    	url: encodeURI(API_BASE + '?apikey=' + API_KEY + 
						    				  '&Time=' + parameters.Time + 
						    				  '&Date=' + parameters.Date +
						    				  '&DPoint=' + parameters.DPoint +
						    				  '&APoint=' + parameters.APoint +
                                              '&Mode=' + parameters.Mode), 
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

            case 'itinerary-mobi':
// http://www.transpole.mobi/index.php
// ?id=691
// &tx_icsnavitiajourney_pi1[startName]=République Beaux Arts
// &tx_icsnavitiajourney_pi1[startCity]=Lille
// &tx_icsnavitiajourney_pi1[entryPointStart]=2
// &tx_icsnavitiajourney_pi1[arrivalName]=Euratechnologie
// &tx_icsnavitiajourney_pi1[arrivalCity]=Lomme
// &tx_icsnavitiajourney_pi1[entryPointArrival]=0
// &tx_icsnavitiajourney_pi1[isStartTime]=1
// &tx_icsnavitiajourney_pi1[date]=24/01/2015
// &tx_icsnavitiajourney_pi1[hour]=17h37
// &tx_icsnavitiajourney_pi1[mode][]=Bus
// &tx_icsnavitiajourney_pi1[criteria]=1
                var params = {
                    'id': '691',
                    'tx_icsnavitiajourney_pi1[startName]': 'République Beaux Arts',
                    'tx_icsnavitiajourney_pi1[startCity]': 'Lille',
                    'tx_icsnavitiajourney_pi1[entryPointStart]': '2',
                    'tx_icsnavitiajourney_pi1[arrivalName]': 'Euratechnologie',
                    'tx_icsnavitiajourney_pi1[arrivalCity]': 'Lomme',
                    'tx_icsnavitiajourney_pi1[entryPointArrival]': '0',
                    'tx_icsnavitiajourney_pi1[isStartTime]': '1',
                    'tx_icsnavitiajourney_pi1[date]': moment().format('DD/MM/YYYY'),
                    'tx_icsnavitiajourney_pi1[hour]': moment().format('H:mm').replace(':', 'h'),
                    'tx_icsnavitiajourney_pi1[mode][]': 'Bus',
                    'tx_icsnavitiajourney_pi1[criteria]': '1'                    
                };
                $.ajax({
                    url: API_MOBI_BASE + '/index.php' + buildUrlParamsFromObject(params), 
                    method: 'GET',
                    success: function(data){
                        dom = $(data);
                        // console.log(html);
                        // $('#data').html(data);
                        $('#data').html(dom.find('.tx_icsnavitiajourney_pi1_resultsList').html());
                    }
                });
                break;

    		default:
    			break;
    	}

        return this;
    };

    function buildUrlParamsFromObject (paramsObj) {
        var urlParams = [];

        Object.keys(paramsObj).forEach(function (key) {
            urlParams.push(key + '=' + paramsObj[key]);
        });

        return '?' + urlParams.join('&');
    }

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