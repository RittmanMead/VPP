 rmvpp = (function(rmvpp){
    
    var pluginName = "map-bubbles"
    var pluginDescription = "Map (Bubbles)"

    // Do not modify these 3 lines
    rmvpp[pluginName] = {};
	rmvpp[pluginName].id = pluginName;
    rmvpp[pluginName].pluginDescription = pluginDescription;
	rmvpp[pluginName].rowLimit = 65000;
	
	rmvpp[pluginName].testData = [
		['London', '0.1275', '51.5072', '1', '3'],
		['Birmingham', '1.8936', '52.4831', '4', '5']
	];
                 
    rmvpp[pluginName].columnMappingParameters = [
        {
            targetProperty: "desc", 
            formLabel: "Description"                          
        },
		{
            targetProperty: "lng", 
            formLabel: "Longitude",
			measure: true
        },
        {
            targetProperty: "lat", 
            formLabel: "Latitude",
			measure: true			
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
				"subType": 'number'
            }
        },
        {
            "targetProperty":"height",
            "label":"Height",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": 400,
				"subType": 'number'
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
			"targetProperty":"highlight",
			"label":"Highlight Colour",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#FAE505"
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
    ];
	
    rmvpp[pluginName].render = function(data, columnMap, config, container)   {
		
		// Map multiple measures
		data.map(function(d) {
			d.measure = [{'name' : columnMap.measure1, 'value' : d.measure1.replace(/,/g,''), 'lng' : d.lng, 'lat' : d.lat, 'desc' : d.desc}];
			if (typeof(columnMap.measure2) != "undefined") {
				d.measure.push({'name' : columnMap.measure2, 'value' : d.measure2.replace(/,/g,''), 'lng' : d.lng, 'lat' : d.lat, 'desc' : d.desc});
				if (typeof(columnMap.measure3) != "undefined") {
					d.measure.push({'name' : columnMap.measure3, 'value' : d.measure3.replace(/,/g,''), 'lng' : d.lng, 'lat' : d.lat, 'desc' : d.desc});
				}
			}
		});
		
		// Set colour scale
		var colourNames = data.map(function(d) { return d.category; });
		var colour = rmvpp.api.colourScale(colourNames, config, 6); 
		
		// Set width, height
		var width = +config.width, height = +config.height;
		
		// Create HTML elements
		var panel = d3.select(container)
			.append('div')
			.attr('class', 'panel do-not-print')
			.style('font-size', '24px');
		
		panel.append('i').attr('class', 'drawBtn fa fa-pencil');
		panel.append('i').attr('class', 'clearBtn fa fa-minus-circle').style('margin-left', '5px');
		
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
		
		var measureNames = [columnMap.measure1, columnMap.measure2, columnMap.measure3].filter(function(n) {
			return n;
		});
		var colour = rmvpp.api.colourScale(measureNames, config, 6);
		
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
		
		// Create a map
		var map = L.map(mapContainer, {
			zoomAnimation: false, // Removing the zoom animation makes D3 overlay work more nicely when zooming
			fadeAnimation : true // Fade animation is ok
		});
		var tileLayer = new L.TileLayer.Main();
		
		// Loop through properties, adding markers
		var markers = [];
		for (var i=0; i < data.length; i++) {
			var marker = L.marker([data[i].lat, data[i].lng]);
			markers.push(marker); // Maintain a global array for manipulation
		}
		
		var group = new L.featureGroup(markers);
		map.fitBounds(group.getBounds());
		tileLayer.addTo(map);
		
		$(mapContainer).css('cursor', 'grab');
		
		renderMapObjs(map, markers, 0);
		
		// Make legend a measure selector
		d3.select(container).selectAll('.legendContainer .key')
			.on('click', function(d, i) {
				rmvpp.api.tooltip.hide(tooltip);
				renderMapObjs(map, markers, i);
			})
			.style('cursor','pointer');
		
		function renderMapObjs(map, markers, measureIdx) {
			var poly, mapEnabled = true;
			
			$(container).find('.drawBtn').off().click(function() {
				disableMap(map);
			});
			$(container).find('.clearBtn').off().click(function() {
				enableMap(map);
			});
			
			// Deselect any selected markers
			function deselectMarkers() {
				d3.select(container).selectAll('circle.measure-marker')
					.attr('fill', function(d) { return colour(d.measure[measureIdx].name); })
					.classed('selected', false);
			}
			
			// Disable the map
			function disableMap(map) {
				map.dragging.disable();
				map.touchZoom.disable();
				map.scrollWheelZoom.disable();
				map.doubleClickZoom.disable();
				map.boxZoom.disable();
				map.zoomControl.removeFrom(map)
				map.on('mousedown', draw); // Initiate draw function
				mapEnabled = false;
			}
			
			// Clear map
			function clear(map) {
				map.off('mousedown')
					.off('mousemove')
					.off('mouseup');
				$(poly._container).parent().hide(); // Prevents from blocking hover overs
				map.removeLayer(poly);
				deselectMarkers();
			}
			
			// Enable the map
			function enableMap(map) {
				if (!mapEnabled) {
					map.dragging.enable();
					map.touchZoom.enable();
					map.scrollWheelZoom.enable();
					map.doubleClickZoom.enable();
					map.boxZoom.enable();
					map.zoomControl.addTo(map);
				}
				if (d3.select(container).selectAll('circle.selected')[0].length > 0)
					clear(map);
				mapEnabled = true;
			}
			
			// Freehand draw function
			function draw(event) {
				if (poly)
					event.target.removeLayer(poly);
				
				var lineOptions = {
					'color' : '#333333',
					'weight' : 2,
					'opacity' : 0.8
				};
				
				var polyOptions = {
					'color' : '#333333',
					'weight' : 2,
					'opacity' : 0.8,
					'fill': true,
					'fillColor' : '#999999',
					'fillOpacity' : 0.4
				};
					
				var polyPoints = [event.latlng]; // Build array of co-ordinates for polygon
				
				poly = new L.Polyline([event.latlng], polyOptions).addTo(event.target);
				$(poly._container).parent().show();
				event.target.on('mousemove', function(event) {
						polyPoints.push(event.latlng);
						poly.addLatLng(event.latlng); // Draw line with mouse
					})
					.on('mouseup', function() {
						map.off('mousemove');
						polyPoints.push(polyPoints[0]);
						event.target.removeLayer(poly);
						poly = new L.Polygon(polyPoints, polyOptions).addTo(event.target); // Create polygon
						enableMap(event.target);
						clear(event.target);
						for (var i=0; i < markers.length; i++) {
							// Convert polygon to GeoJSON for Pip
							var geoFeature = poly.toGeoJSON();
							var geoLayer = L.geoJson(geoFeature);
							if(leafletPip.pointInLayer(markers[i].getLatLng(), geoLayer, true).length > 0) // Check if point is in layer
								highlightMarker(i);
						}
						var selectedData = d3.select(container).selectAll('circle.selected').data();
						rmvpp.api.createTrigger(pluginName, columnMap, container, 'freehandSelect', selectedData); // Trigger event
					});
			}
			
			// Highlight D3 circles
			function highlightMarker(idx) {
				circles.filter(function(d, i) { return i == idx;})
					.attr('fill', config.highlight)
					.classed('selected', true);
			}
			
			// Custom layer for D3
			var svg = d3.select(map.getPanes().overlayPane).append('svg');
			var g = svg.append('g');
			var topBnd, bottomBnd, leftBnd, rightBnd;
			
			map.on('viewreset', reset);
				
			var latArr = data.map(function (d) { return +d.lat; });
			var lngArr = data.map(function (d) { return +d.lng; });
			
			topBnd = d3.max(latArr);
			bottomBnd = d3.min(latArr);
			leftBnd = d3.min(lngArr);
			rightBnd = d3.max(lngArr);
			
			// Scales
			var min = d3.min(data.map(function(d) { return +d.measure[measureIdx].value; }));
			var max = d3.max(data.map(function(d) { return +d.measure[measureIdx].value; }));
			
			
			var size = d3.scale.linear()
				.domain([min, max])
				.range([3, 20]);
			
			// Render circles
			d3.select(container).selectAll('circle.measure-marker').remove();
			var circles = g.selectAll("circle")
				.data(data)
				.enter().append('circle')
				.classed('measure-marker', true)
				.attr('stroke', '#333333')
				.attr('fill-opacity', 0.75)
				.attr('fill', function(d) { return colour(d.measure[measureIdx].name); })
				.attr('r', 0)
				.style('cursor', 'pointer')
				.on('mouseover', function(d) {
					
					var offset = {}, parentContainer = $(container).parents('map-bubbles');
					offset.X = event.pageX - parentContainer.position().left;
					offset.Y = 20 + event.pageY - parentContainer.position().top;
					
					rmvpp.api.tooltip.displayList(tooltip, container, d, 'desc', 'measure', offset.X, offset.Y, colour);
					
				})
				.on('mouseout', function() {
					rmvpp.api.tooltip.hide(tooltip);
				});

			circles.transition()
				.duration(500)
				.attr('r', function(d) {return size(+d.measure[measureIdx].value); })
			reset();
			
			// Function to return DOM X and Y based on longitude and latitude
			function project(d) {
				var point = map.latLngToLayerPoint(new L.LatLng(d[1], d[0]));
				return [point.x, point.y];
			}
			
			// Redraw D3 circles
			function reset() {
				bottomLeft = project([leftBnd, bottomBnd]);
				topRight = project([rightBnd, topBnd]);
				
				svg.attr('width', topRight[0] - bottomLeft[0])
					.attr('height', bottomLeft[1] - topRight[1])
					.style('margin-left', bottomLeft[0] + 'px' )
					.style('margin-top', topRight[1] + 'px')
					.attr('overflow', 'visible');
					
				g.attr('transform', 'translate(' + -bottomLeft[0] + ',' + -topRight[1] + ')');
				
				circles.attr('cx', function(d) { return project([+d.lng, +d.lat])[0];})
					.attr('cy', function(d) { return project([+d.lng, +d.lat])[1];})
			}
		}
	}
    return rmvpp;

}(rmvpp || {}))