rmvpp = (function(rmvpp){
	
	var pluginName = "map-choropleth"
	var pluginDescription = "Map (Choropleth)"

	// Do not modify these 3 lines
	rmvpp[pluginName] = {};
	rmvpp[pluginName].id = pluginName;
	rmvpp[pluginName].pluginDescription = pluginDescription;
	rmvpp[pluginName].rowLimit = 65000;
	
	rmvpp[pluginName].testData = [
		['SC8', 'SC Tayside', '9']
	];
	
	rmvpp[pluginName].columnMappingParameters = [
		{
			targetProperty: "code", 
			formLabel: "Code"						  
		},
		{
			targetProperty: "desc", 
			formLabel: "Description"						  
		},
		{
			targetProperty: "measure1",
			formLabel: "Measure 1",
			measure: true
		},
		{
			targetProperty: "measure2",
			formLabel: "Measure 2",
			measure: true
		},
		{
			targetProperty: "measure3",
			formLabel: "Measure 3",
			measure: true
		}
	]
	 
	rmvpp[pluginName].configurationParameters = [
		{
			"targetProperty":"width",
			"label":"Width",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": 400,
				"subtype": 'number'
			}
		},
		{
			"targetProperty":"height",
			"label":"Height",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": 400,
				"subtype": 'number'
			}
		},
		{
			"targetProperty":"topojson",
			"label":"TopoJSON File",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": '',
			}
		},
		{
			"targetProperty":"featureCode",
			"label":"Feature Code",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": 'ID',
			}
		},
		{
			"targetProperty":"featureDesc",
			"label":"Feature Description",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": 'NAME',
			}
		},
		{
			"targetProperty":"legend",
			"label":"Show Legend",
			"inputType":"checkbox",
			"inputOptions": {
				"defaultValue": true,
			}
		},
		{
			"targetProperty":"drillPath",
			"label":"Navigation Path",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": '',
			}
		},
		{
			"targetProperty":"drillCol",
			"label":"Navigation Column",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": '',
			}
		},
		{
			"targetProperty":"nullColour",
			"label":"Null Colour",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#CCCCCC"
			}
		},
		{
			"targetProperty":"colour1",
			"label":"Colour 1",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#5DA5DA"
			}
		},
		{
			"targetProperty":"colour2",
			"label":"Colour 2",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#60BD68"
			}
		},
		{
			"targetProperty":"colour3",
			"label":"Colour 3",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#F15854"
			}
		},
		{
			"targetProperty":"colour4",
			"label":"Colour 4",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#4D4D4D"
			}
		},
		{
			"targetProperty":"colour5",
			"label":"Colour 5",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#FAA43A"
			}
		},
		{
			"targetProperty":"colour6",
			"label":"Colour 6",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#B276B2"
			}
		}
	]
	
	rmvpp[pluginName].render = function(data, columnMap, config, container)   {
		var width = +config.width, height = +config.height;
		if (config.featureCode == '')
			rmvpp.api.displayError(container, 'Cannot render choropleth without a topojson feature code.');
		
		// Map multiple measures
		data.map(function(d) {
			d.measure = [{'name' : columnMap.measure1, 'value' : d.measure1.replace(/,/g,''), 'code' : d.code, 'desc' : d.desc}];
			if (typeof(columnMap.measure2) != "undefined") {
				d.measure.push({'name' : columnMap.measure2, 'value' : d.measure2.replace(/,/g,''), 'code' : d.code, 'desc' : d.desc});
				if (typeof(columnMap.measure3) != "undefined") {
					d.measure.push({'name' : columnMap.measure3, 'value' : d.measure3.replace(/,/g,''), 'code' : d.code, 'desc' : d.desc});
				}
			}
		});
		
		// Create container for map
		var mapContainer = d3.select(container).append('div')
			.attr('class', 'map print-as-map')
			.style({
				'width' : width + 'px',
				'height' : height + 'px',
				'display' : 'inline-block'
			})[0][0];
		
		var tooltip = d3.select(container)
			.append('div')
			.classed('tooltip', true)
			.style('display', 'none')
			.style('position', 'fixed');
			
		rmvpp.api.loadingScreen(mapContainer, '#1695f0', 'Loading TopoJSON...');
		
		// Load Topojson file if it exists
		$.ajax({
			dataType: 'json',
			url: '/rmvpp/topojson/' + config.topojson,
			error: function(jqXHR, textStatus, errorThrown) {
				rmvpp.api.displayError(container, 'Topojson file not found at: ' + 'topojson/' + config.topojson);
			},
			success: processLayer
		});	
		
		var measureNames = [columnMap.measure1, columnMap.measure2, columnMap.measure3].filter(function(n) {
			return n;
		});
		var colour = rmvpp.api.colourScale(measureNames, config, 6);
		
		// Process JSON features once map is loaded
		function processLayer(json) {
			// Create a map
			var map = L.map(mapContainer, {
				zoomAnimation: true, // Removing the zoom animation makes D3 overlay work more nicely when zooming
				fadeAnimation : true // Fade animation is ok
			});
			var tileLayer = new L.TileLayer.Main();
			
			// Create Leaflet TopoJSON layer
			var featureLayer = new L.TopoJSON();
			featureLayer.addData(json)
			
			map.fitBounds(featureLayer.getBounds());
			tileLayer.addTo(map); // Render map
			
			processFeatures(featureLayer, 0);
			featureLayer.addTo(map);
			
			// Create SVG container for the legend
			var legendContainer = d3.select(container)
				.append('svg')
				.classed('legendContainer', true)
				.classed('do-not-print', true)
					.style({
						'margin-left': '10px',
						'display': 'inline-block',
						'font': '10px sans-serif'
					})
					.attr('height', height)	
					.append('g');
			
			if (config.legend) {  // Draw legend
				var legend = rmvpp.api.legend.create(d3.select(container).select('.legendContainer>g'), measureNames, 'Measures', 0);  // Legend
				rmvpp.api.legend.addColourKey(legend, measureNames, colour);
				
				// Make legend a measure selector
				d3.select(container).selectAll('.legendContainer .key')
					.on('click', function(d, i) {
						rmvpp.api.tooltip.hide(tooltip);
						processFeatures(featureLayer, i);
					})
					.style('cursor','pointer');
			}
		}
		
		// Process each feature in layer
		function processFeatures(fLayer, i) {
			$(mapContainer).find('.loading').remove();
			
			// Define gradient colour scale
			var currColour = config['colour' + (i+1)];
			var min = d3.min(data.map(function(d) { return +d.measure[i].value; }));
			var max = d3.max(data.map(function(d) { return +d.measure[i].value; }));
			var minColour = rmvpp.api.setBrightness(currColour, 80);
			var maxColour = rmvpp.api.setBrightness(currColour, 20);
			
			var gradColour = d3.scale.linear()
				.domain([min, (min+(max-min)/2), max])
				.range([minColour, currColour, maxColour]);
			
			fLayer.eachLayer(function(layer) {
				var code = layer.feature.properties[config.featureCode];
				var datum = data.filter(function(d) { return d.code == code; })[0];
				
				var fillColour = config.nullColour, nullData = false;
				if (datum) {
					fillColour = gradColour(datum.measure[i].value);
				} else { // Cater for nulls
					datum = {'code' : layer.feature.properties[config.featureCode]};
					nullData = true;
				}
				
				var style = {
					color: '#333',
					weight : 1,
					opacity: 0.75,
					fillColor: fillColour,
					fillOpacity: 0.75
				}
				layer.setStyle(style);
				
				layer
				.off('mouseover')
				.on('mouseover', function(e) {
					layer.setStyle({
						opacity: 1,
						weight: 2,
						color: '#000000',
						fillOpacity: 1
					});
					if (!nullData) {
						var offset = getOffset(e.originalEvent, container);
						rmvpp.api.tooltip.displayList(tooltip, container, datum, 'desc', 'measure', offset.X, offset.Y, colour);
					}
				})
				.off('mouseout')
				.on('mouseout', function(e) {
					layer.setStyle({
						opacity: 0.75,
						color: '#333',
						weight: 1,
						fillOpacity: 0.75
					});
					rmvpp.api.tooltip.hide(tooltip);
				})
				.off('click')
				.on('click', function(e) {
					if(config.drillPath) {
						var url = '/analytics/saw.dll?Go&Action=Navigate&Path=' + encodeURIComponent(config.drillPath)
						url += '&P0=1&P1=eq&P2=' + encodeURIComponent(config.drillCol);
						url += '&P3=' + encodeURIComponent(datum.code);
						window.location.href = url;
					}
				})
			});
			
			// Get tooltip offset co-ordinates for this chart
			function getOffset(event, container) {
				var offset = {};
				offset.X = event.pageX + 20;
				offset.Y = event.pageY;
				return offset;
			}
		}
	}
	return rmvpp;

}(rmvpp || {}))
