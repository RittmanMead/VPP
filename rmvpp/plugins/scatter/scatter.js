 rmvpp = (function(rmvpp){
	
    var pluginName = "rmvpp-scatter"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = 'Scatter Chart';
	rmvpp[pluginName].rowLimit = 50000;
	
	// List additional dependencies (Assume OBIEE, jQuery, jQuery.XML2Json and d3)
	rmvpp[pluginName].dependencies = {
		'js' : [
			'/web-api/api-plugins/scatter/scatter.js'
		],
		'css' : [
			'/web-api/api-plugins/scatter/scatter.css'
		]
	};
	
    rmvpp[pluginName].testData = [['10','5', 'Jan 2014', 'Winter', '5'],
									['3','1', 'Feb 2014', 'Winter', '10'],
									['5','2', 'Mar 2014', 'Spring', '15'],
									['5','1', 'Apr 2014', 'Spring', '20']
	];
                 
    rmvpp[pluginName].columnMappingParameters = [
    	{
			targetProperty:"measureX",
			formLabel:"Measure (X)",
			measure: true
		},
		{
			targetProperty:"measureY",
			formLabel:"Measure (Y)",
			measure: true
		},
		{
			targetProperty:"group",
			formLabel:"Group By"
		},
		{
			targetProperty:"varyColour",
			formLabel:"Vary By Colour"
		},
		{
			targetProperty:"varySize",
			formLabel:"Vary By Size",
			measure: true
		}
    ];
    
    rmvpp[pluginName].configurationParameters = [
		{
			"targetProperty":"w",
			"label":"Width",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 600
			}
		},
		{
			"targetProperty":"h",
			"label":"Height",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 600
			}
		},
		{
			"targetProperty":"minPointSize",
			"label":"Minimum Point Size",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 2
			}
		},
		{
			"targetProperty":"maxPointSize",
			"label":"Maximum Point Size",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 6
			}
		},
		{
			"targetProperty":"selectBox",
			"label":"Drag to Select",
			"inputType":"checkbox",
			"inputOptions" : {"defaultValue" : true}
		},
		{
			"targetProperty":"chartTitle",
			"label":"Chart Title",
			"inputType":"textbox",
			"inputOptions": {"defaultValue" : ""}
		},
		{
			"targetProperty":"xTitle",
			"label":"X Axis Title",
			"inputType":"textbox",
			"inputOptions": {"defaultValue" : "default"}
		},
		{
			"targetProperty":"yTitle",
			"label":"Y Axis Title",
			"inputType":"textbox",
			"inputOptions": {"defaultValue" : "default"}
		},
		{
			"targetProperty":"colour1",
			"label":"Colour 1",
			"inputType":"colourpicker",
			"inputOptions": {"defaultValue": "#5DA5DA"}
		},
		{
			"targetProperty":"colour2",
			"label":"Colour 2",
			"inputType":"colourpicker",
			"inputOptions": {"defaultValue": "#60BD68"}
		},
		{
			"targetProperty":"colour3",
			"label":"Colour 3",
			"inputType":"colourpicker",
			"inputOptions": {"defaultValue": "#F15854"}
		},
		{
			"targetProperty":"colour4",
			"label":"Colour 4",
			"inputType":"colourpicker",
			"inputOptions": {"defaultValue": "#4D4D4D"}
		},
		{
			"targetProperty":"colour5",
			"label":"Colour 5",
			"inputType":"colourpicker",
			"inputOptions": {"defaultValue": "#FAA43A"}
		},
		{
			"targetProperty":"colour6",
			"label":"Colour 6",
			"inputType":"colourpicker",
			"inputOptions": {"defaultValue": "#B276B2"}
		}
    ];
	
	rmvpp[pluginName].actions = [
		{
			'trigger' : 'selection',
			'type' : 'selection',
			'name' : 'Selection Box',
			'output' : ['group'],
			'description' : 'Drag a box selecting points to pass data.'
		},
		{
			'trigger' : 'pointHover',
			'type' : 'mouseover',
			'name' : 'Hover - Point',
			'output' : ['group', 'varyColour'],
			'description' : 'Hover over a point to pass columns and values.'
		},
		{
			'trigger' : 'pointClick',
			'type' : 'click',
			'name' : 'Click - Point',
			'output' : ['group', 'varyColour'],
			'description' : 'Click on a point to pass columns and values.'
		}
	];
	
	rmvpp[pluginName].reactions = [
		{
			id : 'filter',
			name : 'Filter',
			description : 'Accepts a column map and value and filters the report if the subject area matches.',
			type : 'general'
		},
		{
			id : 'highlight',
			name : 'Highlight Points',
			description : 'Highlights points based on input value',
			type : 'private'
		}
	];
	
	rmvpp[pluginName].highlight = function(output, container) {
		var points = container.selectAll('.marker');
		var data = points.data();
		var config = output[0].config;
		
		var colour = rmvpp.api.colourScale(data.map(function(d) { return d.varyColour; }), config, 6); // Set colour scale
		var pointSize = rmvpp.api.linearScale([config.minPointSize, config.maxPointSize], data.map(function(d) { return +d.varySize; })); // Set point size scale
		
		points.each(function(d, i) {
			var filter = [];
			rmvpp[pluginName].revertPoint(d3.select(this), pointSize, colour); // Revert any highlighted points
			
			// Find matching points
			output.forEach(function(criteria) {	filter.push($.inArray(d[criteria.targetId], criteria.values) > -1);	});
			
			// Highlight points
			if (d3.set(filter).values().length == 1 && d3.set(filter).values()[0] == 'true')
				rmvpp[pluginName].highlightPoint(d3.select(this), pointSize, colour);
		});
		rmvpp.api.tooltip.hide(container.select('.tooltip'));
	};
	
	// Highlight points
	rmvpp[pluginName].highlightPoint = function(point, sizeScale, colourScale) {
		point.classed('selected', true)
			.transition()
				.attr("r", function(d) { return +sizeScale(d.varySize) + 3; }) // Enlarge point
				.style('fill', function(d) { return rmvpp.api.reduceBrightness(colourScale(d.varyColour), 15); }) // Darken colour
				.style('opacity', 1)
				.duration(200);
	}

	// Revert point style
	rmvpp[pluginName].revertPoint = function(point, sizeScale, colourScale) {
		point.classed('selected', false)
			.transition()
				.attr("r", function(d) { return sizeScale(d.varySize); })
				.style('fill', function(d) { return colourScale(d.varyColour); })
				.style('opacity', 0.7)
				.duration(200);
	}
	
    rmvpp[pluginName].render = function(data, columnMap, config, container)   {			
		
		console.log(data);
		
		// Vary by colour flag
		var varyColour = false, varySize = false
		if (typeof(columnMap.varyColour) != "undefined") varyColour = true;
		if (typeof(columnMap.varySize) != "undefined") varySize = true;
		
		// Stamp a static value if not varying by colour
		if (!varyColour) { data.map(function(d) {d.varyColour = 'single';}); }
		
		// Check if the two measures are indeed measures. Will be required to be numeric for axis scaling
		if (columnMap.measureX.measure == 'none' || columnMap.measureY.measure == 'none')
			throw 'Cannot produce a scatter plot without at least two measures.';
		
		// Check varySize is a measure
		if (varySize && columnMap.varySize.measure == 'none')
			throw 'Vary by Size input must be a measure.';
		
		// Add chart title if necessary
		if (config.chartTitle != "")
			rmvpp.api.appendTitle(container, config.chartTitle);
		
		// Store visualisation number (if it exists), so that unique IDs can be created
		var visNum = d3.select(container).attr('vis-number') || '0';
		
		var chartContainer = d3.select(container)
			.append('div')
			.classed('scatter-chart', true);
		
		renderScatter(data, $(chartContainer[0]));
		
		// Render scatter chart
		function renderScatter(data, selector) {
			var legendTitle = columnMap.varyColour;
			var colNames = d3.set(data.map(function(d) { return d.varyColour; })).values();
			
			// Set varySize to 0 if undefined
			if (typeof(columnMap.varySize) == "undefined") {
				data.map(function(d) {
					d.varySize = '1';
				});
			}
			
			$(selector).empty(); // Clear existing chart
			selector = selector.toArray(); // Convert jQuery object for D3 use
			
			// Define column names and height and width from config
			var width = +config.w, height = +config.h, xTitle = config.xTitle, yTitle = config.yTitle;
			if (config.xTitle == 'default') xTitle = columnMap.measureX;
			if (config.yTitle == 'default') yTitle = columnMap.measureY;
			
			// Minimum and maximum measure and size values
			var minX = d3.min(data, function(d) { return +d.measureX; });
			var maxX = d3.max(data, function(d) { return +d.measureX; });
			var minY = d3.min(data, function(d) { return +d.measureY; });
			var maxY = d3.max(data, function(d) { return +d.measureY; });
							
			// Define X axis
			var x = d3.scale.linear()
				.domain([d3.min([0, minX]), d3.max([0,maxX])]) // From 0 to maximum
				.range([0, width])
				.nice();
					
			// Define Y axis
			var y = d3.scale.linear().domain([d3.min([0, minY]), d3.max([0,maxY])]) // From 0 to maximum
			
			// Define colour and point size scales
			var colour = rmvpp.api.colourScale(data.map(function(d) { return d.varyColour; }), config, 6);
			var pointSize = rmvpp.api.linearScale([config.minPointSize, config.maxPointSize], data.map(function(d) { return +d.varySize; }));
			
			// Get standard margin
			var margin = rmvpp.api.margin(width, height, xTitle, yTitle, x, y);
			
			height = height - margin.top - margin.bottom; // Modify height by margin
			y.range([height, 0]).nice(); // Apply range once height has been modified for margin
			
			var chart = rmvpp.api.createSVG(width, height, margin, selector); // Create chart SVG to standard size
			var svg = chart.parent();
			var tooltip = rmvpp.api.tooltip.create(selector); // Create tooltip object
			rmvpp.api.drawAxes(chart, x, y, width, height, margin, xTitle, yTitle) // Axes
			
			// Legend
			if (varyColour || varySize) 
				var legend = rmvpp.api.legend.create(chart, colNames.concat(columnMap.varySize), legendTitle, width); 

			if (varyColour)
				rmvpp.api.legend.addColourKey(legend, colNames, colour);
				
			if (varySize)
				rmvpp.api.legend.addSizeKey(legend, columnMap.varySize.Name, pointSize);
			
			// Add tracker line for identifying points
			var trackerPath = chart.append('path')
				.attr('stroke', '#666')
				.attr('stroke-dasharray', '5, 5')
				.attr('fill', 'none')
				.attr('d', 'M0,0')
				.attr('opacity', '0');
			
			// Create array of x/y co-ordinates for Voronoi geometry
			var vertices = data.map(function(d) { return [x(d.measureX), y(d.measureY)]; });
			
			// Containers for Voronoi clip path mask
			var points = chart.append('g').classed('points', true);
			var paths = chart.append('g').classed('paths', true);
			var clips = chart.append('g').classed('clips', true);
			
			// Add clip paths
			clips.selectAll("clipPath")
			.data(vertices)
				.enter().append("clipPath")
				.attr("id", function(d, i) { return visNum+"-clip-"+i;})
			.append("circle")
				.attr('cx', function(d) { return d[0]; })
				.attr('cy', function(d) { return d[1]; })
				.attr('opacity', '0') // Force opacity to 0 to hide on print function
				.attr('r', 20);
			
			// Set clip extent, very important in IE
			var voronoi = d3.geom.voronoi().clipExtent([[0, 0], [width, height]]);
			
			// Add paths around clips based on Voronoi geometry (handles overlaps nicely)
			paths.selectAll("path")
			.data(voronoi(vertices))
			.enter().append("path")
				.attr("d", function(d) { return "M" + d.join(",") + "Z"; })
				.attr("id", function(d,i) { return "path-"+i; })
				.attr("clip-path", function(d,i) { return "url(#" + visNum + "-clip-"+i+")"; })
				.style('opacity', 0)
				.on("mouseover", function(d, i) {
					if (svg.select( "rect.selectionBox").empty()) {
						// Fetch element and data for associated circle
						var marker = chart.selectAll('.marker[index="'+i+'"]');
						var datum = marker.datum();
						chart.selectAll('.marker').each(function() { rmvpp[pluginName].revertPoint(d3.select(this), pointSize, colour); }); // Revert all selected points
						rmvpp[pluginName].highlightPoint(marker, pointSize, colour); // Highlight point
						displayTrackerLine(datum); // Display line to axes
						
						// Display tooltip with all information
						var tooltipCols = ['group', 'measureX', 'measureY'];
						if (varyColour) tooltipCols.push('varyColour');
						if (varySize) tooltipCols.push('varySize');
						
						var offset = getOffset(event, container, tooltip, x(datum.measureX))
						displayTooltip(tooltip, tooltipCols, columnMap, datum, offset.X, offset.Y, colour(datum.varyColour))
					}
				})
				.on("mouseout", function(d, i) {
					rmvpp[pluginName].revertPoint(chart.select('.marker[index="'+i+'"]'), pointSize, colour);
					trackerPath.attr('opacity', 0); // Hide trackerline
					rmvpp.api.tooltip.hide(tooltip);
				})
				.on('click', function (d, i) {
					var marker = chart.selectAll('.marker[index="'+i+'"]');
					var datum = marker.datum();
				});
			
			// Add points
			points.selectAll(".point")
				.data(data)
			.enter().append("circle")
				.attr("class", function(d, i) { return "marker"; })
				.attr('index', function(d, i) { return i; })
				.attr("r", 0)
				.attr("cx", function(d) { return x(d.measureX); })
				.attr("cy", function(d) { return y(d.measureY); })
				.style('opacity', 0.7)
				.style('fill', function(d) {return colour(d.varyColour); })
				.transition()
					.attr('r', function(d) { return pointSize(d.varySize); })
					.duration(200);
				
			paths.selectAll("path")
			
			// Drag selection box
			if (config.selectBox) {
				svg.on('mousedown', function() {
					var mouseX = d3.mouse(this)[0] - margin.left - margin.right;
					var mouseY = d3.mouse(this)[1];
					
					d3.event.preventDefault();
					chart.append( "rect")
					.attr({
						class   : "selectionBox",
						x       : mouseX,
						y       : mouseY,
						width   : 0,
						height  : 0
					})
					
					chart.selectAll('.marker').each(function() { rmvpp[pluginName].revertPoint(d3.select(this), pointSize, colour); });
					rmvpp.api.tooltip.hide(tooltip);
					trackerPath.attr('opacity', 0); // Hide trackerline
				})
				.on( "mousemove", function() {
					var selectBox = svg.select( "rect.selectionBox");
					
					if(!selectBox.empty()) {
						var mouseX = d3.mouse(this)[0] - margin.left - margin.right,
							mouseY = d3.mouse(this)[1],
							attrs = { // Rectangle attributes
								x       : parseInt( selectBox.attr( "x"), 10),
								y       : parseInt( selectBox.attr( "y"), 10),
								width   : parseInt( selectBox.attr( "width"), 10),
								height  : parseInt( selectBox.attr( "height"), 10)
							},
							move = { // Move position
								x : mouseX - attrs.x,
								y : mouseY - attrs.y
							};
						
						// Handle attributes for certain positions;
						if( move.x < 1 || (move.x * 2 < attrs.width)) {
							attrs.x = mouseX;
							attrs.width -= move.x;
						} else
							attrs.width = move.x;       

						if( move.y < 1 || (move.y * 2 < attrs.height)) {
							attrs.y = mouseY;
							attrs.height -= move.y;
						} else
							attrs.height = move.y;       
					   
						selectBox.attr(attrs); // Alter selection box
						
						// Highlight points inside box
						var markerData = [];
						svg.selectAll('.marker').each(function(d, i) {
							var marker = d3.select(this);
							// Check that not selected and point is within box					
							if (
								marker.attr('cx') >= attrs.x && marker.attr('cx') <= attrs.x + attrs.width &&
								marker.attr('cy') >= attrs.y && marker.attr('cy') <= attrs.y + attrs.height
							) {
								markerData.push(marker.datum());
								rmvpp[pluginName].highlightPoint(marker, pointSize, colour);
							} else
								rmvpp[pluginName].revertPoint(marker, pointSize, colour);
						});
						
						// Display tooltip
						if (markerData.length > 0) {
							var summary = {}; // Data object for tooltip
							summary.count = markerData.length;
							summary.measureX = d3[rmvpp.api.convertMeasure(columnMap.measureX.Measure)](markerData.map(function(d) { return +d.measureX; }));
							summary.measureY = d3[rmvpp.api.convertMeasure(columnMap.measureY.Measure)](markerData.map(function(d) { return +d.measureY; }));
							summary.varySize = d3[rmvpp.api.convertMeasure(columnMap.measureSize)](markerData.map(function(d) { return +d.varySize; }));
							
							var tooltipCols = ['count', 'measureX', 'measureY'];
							if (varySize)
								tooltipCols.push('varySize');
							
							// Add summary to column map
							columnMap['count'] = 'Count';
							
							var offset = getOffset(event, container, tooltip, attrs.x + attrs.width)
							displayTooltip(tooltip, tooltipCols, columnMap, summary, offset.X, offset.Y, '#666')
						} else
							rmvpp.api.tooltip.hide(tooltip)
					}
				})
				.on('mouseup', function() {
					svg.selectAll( "rect.selectionBox").remove();
				})
			}
			
			// Display tooltip with a full set of information
			function displayTooltip (tooltip, tooltipCols, columnMap, datum, offsetX, offsetY, highlightBorder) {
				$(tooltip[0]).empty().stop().fadeIn(200); // Display tooltip
				
				// Populate tooltip with content
				var list = tooltip.append('ul');
				tooltipCols.forEach(function(col) {
					var info = '<b>' +  + ': </b>' + datum[col];
					var listItem = list.append('li');
					listItem.append('b').text(columnMap[col] + ': ');
					listItem.append('span').text(datum[col]);
				});
				
				if (highlightBorder) // Colour border
					tooltip.style('border', '1px solid ' + highlightBorder);
					
				positionTooltip(tooltip, offsetX, offsetY);
			}
			
			// Move tooltip and animate
			function positionTooltip(tooltip, offsetX, offsetY) {
				tooltip.transition()
					.style("top",(offsetY)+"px").style("left",(offsetX)+"px") // Position tooltip
					.duration(100);
			}
			
			// Create triggers for events
			function createTrigger(event, datum) {
				var intMap = rmvpp.api.actionColumnMap(['group', 'varyColour'], columnMap, datum);
				$($(chart[0]).parents('.visualisation')).trigger(event, intMap);
			}
			
			// Display tracklines
			function displayTrackerLine(datum) {
				var trackerLine = [
					{'x' : 0, 'y' : y(datum.measureY)},
					{'x' : x(datum.measureX), 'y' : y(datum.measureY)},
					{'x' : x(datum.measureX), 'y' : y.range()[0]}
				];
				
				trackerPath.attr('stroke', colour(datum.varyColour));
				rmvpp.api.renderLine(trackerPath, trackerLine);
			}
			
			// Get tooltip offset co-ordinates for this chart
			function getOffset(event, container, tooltip, xPos) {
				var offset = {};
				offset.X = xPos + $(tooltip[0]).width()/2 + 10;
				offset.Y = event.pageY - $(container).position().top; // Use pageX as it is supported on IE as well. Subtract the position of the container
				return offset;
			}

		}
    }
   
    return rmvpp;

}(rmvpp || {}))