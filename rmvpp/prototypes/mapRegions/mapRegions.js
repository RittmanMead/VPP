 rmvpp = (function(rmvpp){
    
    var pluginName = "rmvpp-mapRegions"
    var pluginDescription = "Maps - Region Selector"
    
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;

    rmvpp[pluginName].testData = []
                 
    rmvpp[pluginName].columnMappingParameters = []
     
    rmvpp[pluginName].configurationParameters = [
		{ 
            "targetProperty":"geoJsonfile", 
            "label":"GeoJson File Name",
            "inputType":"dropdown",
            "inputOptions": {    
                "multiSelect": false,
                "values":["lad.json", "nuts1.json", "nuts2.json", "nuts3.json"] ,  
                "defaultSelection": 1
            }
        },
		{
			"targetProperty":"geoSearchField", 
            "label":"GeoJson Search Field",
            "inputType":"textbox",
            "inputOptions": {    
                "defaultValue": "LAD13CD"
            }
		},
		{
			"targetProperty":"mapCentre", 
            "label":"Map Centre",
            "inputType":"dropdown",
            "inputOptions": {    
                "multiSelect": false,
                "values":["England", "None"] ,  
                "defaultSelection": 1
            }
		},
		{
			"targetProperty":"mapBound", 
            "label":"Map Bound",
            "inputType":"dropdown",
            "inputOptions": {    
                "multiSelect": false,
                "values":["England", "None"] ,  
                "defaultSelection": 1
            }
		},
		{
			"targetProperty":"regionColour", 
            "label":"Highlight Colour",
            "inputType":"colorpicker",
            "inputOptions": {    
                "defaultValue": "#FF0000"
            }
		}		
	]
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
		
		// Create HTML Objects
		
		// Map div
		d3.select(container).append('div')
			.attr('id', 'map')
			.attr('style', 'visibility: hidden');
		
		// Map loading text
		d3.select(container).append('div')
			.attr('id', 'mapLoadText')
			.text('Loading GeoJSON file: ' + config.geoJsonfile + '...');
		
		// Create results table
		d3.select(container).append('div')
			.attr('id', 'resultsContainer')
			.append('div')
				.attr('id', 'location')
		
		d3.select('#resultsContainer')
			.append('table')
				.attr('id', 'results')
				.classed('table', true)
				.style('display', 'none')
				.append('thead').append('tr');
		
		var thead = d3.select('#results thead');
		thead.append('th').attr('scope', 'col').text('Total Population');
		thead.append('th').attr('scope', 'col').text('Births');
		thead.append('th').attr('scope', 'col').text('Deaths');
		thead.append('th').attr('scope', 'col').text('Net Domestic Migration');
		thead.append('th').attr('scope', 'col').text('Net International Migration');
		
		d3.select('#results').append('tbody');
		
		// Hard coded points to establish map starting point
		var mapBounds = {
			'None' : {
				'centre' : new google.maps.LatLng(0, 0),
				'ne' : new google.maps.LatLng(90, 180),
				'sw' : new google.maps.LatLng(-90, -180),
				'minZoom' : 1
			},
			'England' : {
				'centre' : new google.maps.LatLng(53.488045, -1.845702),
				'ne' : new google.maps.LatLng(55.924586, 2.460938),
				'sw' : new google.maps.LatLng(49.61071, -6.679687),
				'minZoom' : 6
			}
		}
		
		var mapCentre, minZoom, ne, sw;
		
		// Create new map
		map = new google.maps.Map($("#map")[0], {
			zoom: mapBounds[config.mapCentre].minZoom,
			center: mapBounds[config.mapCentre].centre,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		
		// Limit the zoom to a minimum of 6
		google.maps.event.addListener(map, 'zoom_changed', function()
		{
			if (map.getZoom() < mapBounds[config.mapBound].minZoom){
			   map.setZoom(mapBounds[config.mapBound].minZoom);
			}
		});

		// Bind map to specific location bounds
		google.maps.event.addListener(map,'center_changed',function() { checkBounds(); });
		function checkBounds() {    
			allowedBounds = new google.maps.LatLngBounds(mapBounds[config.mapBound].sw, mapBounds[config.mapBound].ne); // Limit to England
			if(! allowedBounds.contains(map.getCenter())) {
				var C = map.getCenter();
				var X = C.lng();
				var Y = C.lat();

				var AmaxX = allowedBounds.getNorthEast().lng();
				var AmaxY = allowedBounds.getNorthEast().lat();
				var AminX = allowedBounds.getSouthWest().lng();
				var AminY = allowedBounds.getSouthWest().lat();

				if (X < AminX) {X = AminX;}
				if (X > AmaxX) {X = AmaxX;}
				if (Y < AminY) {Y = AminY;}
				if (Y > AmaxY) {Y = AmaxY;}

				map.setCenter(new google.maps.LatLng(Y,X));
			}
		}
		
		// Setup main data layer
		mapLayer = new google.maps.Data();
		
		// Styling for data layer
		mapLayer.setStyle(function(feature) {
			var opacity = 0;

			if (feature.getProperty('isVisible')) {
				opacity = 0.5;
			}
			return {
				visible: true,
				fillColor: config.regionColour,
				fillOpacity: opacity,
				strokeOpacity: opacity,
				strokeWeight: 1
			};
		});
		
		mapLayer.loadGeoJson('/rmvpp/plugins/mapRegions/' + config.geoJsonfile); // GeoJSON data file
				
		// Display map only when GeoJSON has loaded
		mapLayer.addListener('addfeature', function(event) {
			$('#map').css('visibility', 'visible');
			$('#mapLoadText').css('display', 'none');
		});
		
		// Show on hover over
		mapLayer.addListener('mouseover', function(event) {
			map.data.revertStyle();
			event.feature.setProperty('isVisible', true);
		});
		
		// Mouse out event
		mapLayer.addListener('mouseout', function(event) {
			map.data.revertStyle();
			event.feature.setProperty('isVisible', false);
		});
		
		// Click event
		mapLayer.addListener('click', function(event) {
			//renderHist(data, '#chartContainer', 'Age', 'Population', 21000)
			runQuery([event.feature.getProperty(config.geoSearchField)]);
		});
		
		mapLayer.setMap(map); // Display layer on map
		
		// Array to comma separated
		function arrayToComma(inpArray) {
			var arrString = '';
			for (var i=0; i < inpArray.length; i++) {
				arrString = arrString + "'" + inpArray[i] + "',";
			}
			arrString = arrString.substr(0,arrString.length-1);
			return arrString;
		}
		
		// Run OBIEE Query
		function runQuery(codes) {
			if (sessionStorage.sessionId) {
			
				// Convert array to comma separated list
				var codeString;
				for (var i=0; i<codes.length; i++) {
					codeString = "'" + codes[i] + "',";
				}
				codeString = codeString.substr(0,codeString.length-1);
				
				var lsql = 'SELECT "Demographics"."Measures"."Population" s_1, "Demographics"."Measures"."Births" s_2, "Demographics"."Measures"."Deaths" s_3, "Demographics"."Measures"."Domestic Net Migration" s_4, ';
				lsql = lsql + '"Demographics"."Measures"."International Net Migration" s_5 FROM "Demographics" WHERE "Council"."Council Code" IN (' + codeString;
				lsql = lsql + ') ORDER BY 1, 2 ASC NULLS LAST FETCH FIRST 65001 ROWS ONLY';
				
				console.log(lsql);
				
				executeLSQL(lsql, function(x){
					writeOutput(x);
					$('#results').css('display', 'block');
					//$('#mask').css('display', 'none');
				});
			}
		}
		
		// Update table
		function writeOutput(results) {
			// Update results table
			outTable = $('#results tbody');
			outTable.empty();

			trow = outTable.append('<tr/>');
			if (Object.prototype.toString.call( results.Row ) === '[object Array]') {
				for (var i=0; i < results.Row.length; i++) {
					trow = outTable.append('<tr/>');
					for (key in results.Row[i]) {
						var valueTag;
						if (results.Row[key] < 0) // Conditional format if less than 0
							valueTag = '<td style="color : red;">'; 
						else
							valueTag = '<td>';
						valueTag = valueTag + results.Row[i][key] + '</td>';
						trow.append(valueTag);
					}
				}
			} else {
				for (key in results.Row) {
					var valueTag;
					if (results.Row[key] < 0) // Conditional format if less than 0
						valueTag = '<td style="color : red;">'; 
					else
						valueTag = '<td>';
					valueTag = valueTag + results.Row[key] + '</td>';
					trow.append(valueTag);
				}
			}
		}
		
    }
   
    return rmvpp;

}(rmvpp || {}))