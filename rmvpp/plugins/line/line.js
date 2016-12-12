 rmvpp = (function(rmvpp){
	
    var pluginName = "rmvpp-line"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = 'Line Chart';
	var rowLimit = 50000;
	
	// List additional dependencies (Assume OBIEE, jQuery, jQuery.categoryML2Json and d3)
	rmvpp[pluginName].dependencies = {
		'js' : [
			'/rmvpp/api-plugins/line/line.js'
		]
	};
	
     rmvpp[pluginName].testData = [
		['accurate','5', '8', '9'],
		['active','1', '3', '4'],
		['adventurous','2', '4', '1'],
		['agriculture','1', '7', '4']
	];
                 
    rmvpp[pluginName].columnMappingParameters = [
    	{
			targetProperty:"category",
			formLabel:"Category"
		},
		{
			targetProperty:"measure1",
			formLabel:"First Measure"
		},
		{
			targetProperty:"measure2",
			formLabel:"Second Measure"
		},
		{
			targetProperty:"measure3",
			formLabel:"Third Measure"
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
			"targetProperty":"pointSize",
			"label":"Point Size",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 2
			}
		},
		{
			"targetProperty":"chartTitle",
			"label":"Chart Title",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : ""
			}
		},
		{
			"targetProperty":"xTitle",
			"label":"X Axis Title",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : "default"
			}
		},
		{
			"targetProperty":"yTitle",
			"label":"Y Axis Title",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : "default"
			}
		},
		{
			"targetProperty":"brushNav",
			"label":"Mini-Chart Navigator",
			"inputType":"checkbox",
			"inputOptions": {"defaultValue" : true	}
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
		// Compile column name list for Y
		var colNames = [columnMap.measure1, columnMap.measure2, columnMap.measure3], legendTitle = 'Measures';
		
		colNames = colNames.filter(function(d) {
			return typeof(d) != "undefined";
		});
		
		// Denormalise X label onto Y values for tooltip later
		data.map(function(d) {
			d.measure = [{'name' : columnMap.measure1, 'value' : d.measure1.replace(/,/g,''), 'category' : d.category}];
			if (typeof(columnMap.measure2) != "undefined") {
				d.measure.push({'name' : columnMap.measure2, 'value' : d.measure2.replace(/,/g,''), 'category' : d.category});
				if (typeof(columnMap.measure3) != "undefined") {
					d.measure.push({'name' : columnMap.measure3, 'value' : d.measure3.replace(/,/g,''), 'category' : d.category});
				}
			}
		});
		
		var varyColour = false;	
		
		// Add chart title if necessary
		if (config.chartTitle != "")
			rmvpp.api.appendTitle(container, config.chartTitle);
		
		// Chart container
		var chartContainer = d3.select(container)
			.append('div')
			.classed('line-chart', true);
		
		// Render line chart
		renderChart(data, $(chartContainer[0]));
		if (config.brushNav)
			renderNav(data, $(chartContainer[0]));
		
		
		// Mini Chart Code
		function renderNav(data, selector) { 
			$(selector).find('.navigator').remove(); // Clear existing chart
			selector = selector.toArray(); // Convert jQuery object for D3 use
		
			var width = +config.w, height = +config.h;
			var navFrac = 0.2;
			
			// Minimum and maximum measure values
			var maxY = d3.max(data, function(d) { return d3.max(d.measure, function(d) { return +d.value; }); });
			var minY = d3.min(data, function(d) { return d3.min(d.measure, function(d) { return +d.value; }); });
			
			// Define X axis
			var x = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }))
			
			// Define Y axis
			var y = d3.scale.linear()
					.domain([d3.min([0, minY]), d3.max([0,maxY])]) // From 0 to maximum
			
			// Get standard margin
			var margin = rmvpp.api.margin(width, height, "", "", x, y);
			
			height = height - margin.top - margin.bottom; // Modify height by margin
			navHeight = navFrac*height; 
			navWidth =  width;
			
			y.range([height, 0]).nice(); // Apply range once height has been modified for margin //????
			x.rangeBands([0, width], 0.1);
		
			// Define category grouping
			var x1 = d3.scale.ordinal()
				.domain(colNames)
				.rangeRoundBands([0, x.rangeBand()]);	

			var navXScale = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }))
				.rangeRoundBands([0, navWidth], .1)
			
			var navContainer = d3.selectAll(selector).append('div').classed('navigator', true);
			var navChart = rmvpp.api.createSVG(navWidth, navHeight, margin, navContainer[0]); // Create chart SVG to standard size
			rmvpp.api.drawAxes(navChart, x, "", navWidth, navHeight, margin) // Axes		
			
			// Draw lines between points
			var line = d3.svg.line()
				.x(function(d) { return x(d.category) + x.rangeBand()/2; })
				.y(function(d) { return navFrac*y(d.value); });
				
			var flatLine = d3.svg.line()
				.x(function(d) { return x(d.category) + x.rangeBand()/2; })
				.y(function(d) { return navFrac*y(0); });
			
			// Loop through series and plot lines between points
			for (var i=0; i < colNames.length; i++) {
				var measure = data.map(function(d) { return d.measure[i];});
				navChart.append("path")
					.datum(measure)
					.attr("class", "line")
					.attr("d", flatLine)
					.attr('fill', 'none')
					.attr('stroke', 'grey')
					.attr("d", line);
			};		
					
			var navGroups = navChart.selectAll(".navGroups")
				.data(data)
			.enter().append("g")
				.attr("transform", function(d) { return "translate(" + x(d.category) + ",0)"; });
					
			// navGroups.selectAll('g')
				// .data(function(d) { return d.measure; })
				// .enter()
				// .append("circle")
				// .attr('r', config.pointSize)
				// .attr('cx', function(d, i) { return (x.rangeBand()/2); })
				// .attr('cy', function(d, i) { return navFrac*y(d.value); })
				
			// Brush function
			var viewport = d3.svg.brush()
				.x(navXScale)
				.on("brushend", function () {
			
					var maxRange = d3.max(viewport.extent());
					var minRange = d3.min(viewport.extent());	
				
					testFilter = navXScale.range().filter(function(d) { return (d) <= maxRange && (d+navXScale.rangeBand()) >= minRange; });
					var positions = [];
					
					for (i = 0; i < testFilter.length; i++) { 
						positions.push(navXScale.range().indexOf(testFilter[i])); 
					}

					selectedCategory = data.filter(function(d, i) { return $.inArray(i, positions) > -1;});
					renderChart(selectedCategory, $(chartContainer[0]));
				
				});	
				
			navChart.append("g")
				.attr("class", "viewport")
				.call(viewport)
				.selectAll("rect")
				.attr("height", navHeight); 
	};
		
			
		
		
		// Main rendering function
		function renderChart(data, selector) {
		$(selector).find('.main, .tooltip').remove(); // Clear existing chart
		selector = selector.toArray(); // Convert jQuery object for D3 use
		
			// Error if no bars selected
		if (data.length == 0) {
		 throw 'No data can not render chart'
		}
			
			// Define column names and height and width from config
			var width = +config.w, height = +config.h, xTitle = config.xTitle, yTitle = config.yTitle;
			if (config.xTitle == 'default') xTitle = columnMap.category.Name;
			if (config.yTitle == 'default') {
				if (varyColour)
					yTitle = columnMap.measure[0].Name;
				else
					yTitle = "";
			}
			
			// Minumum and maximum measure values
			var maxY = d3.max(data, function(d) { return d3.max(d.measure, function(d) { return +d.value; }); });
			var minY = d3.min(data, function(d) { return d3.min(d.measure, function(d) { return +d.value; }); });			
			
			// X Axis
			var x = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }))
				.rangeBands([0, width], .1);
			
			// Y Axis
			var y = d3.scale.linear()
					.domain([d3.min([0, minY]), d3.max([0,maxY])]); // From 0 to maximum
			
			// Define colour palette
			var colour = d3.scale.ordinal()
				.range([config.colour1, config.colour2, config.colour3, config.colour4, config.colour5, config.colour6]);
			
			// Get standard margin
			var margin = rmvpp.api.margin(width, height, xTitle, yTitle, x, y);
			
			height = config.h - margin.top - margin.bottom;
			y.range([height, 0]).nice(); // Apply range once height has been modified for margin
				
			var chart = rmvpp.api.createSVG(width, height, margin, selector, ".navigator"); // Create chart SVG
			chart.parent().classed('main', true);
			var tooltip = rmvpp.api.tooltip.create(selector); // Create tooltip object
			
			rmvpp.api.drawAxes(chart, x, y, width, height, margin, xTitle, yTitle) // Axes
			var legend = rmvpp.api.legend.create(chart, colNames, legendTitle, width);  // Legend
			rmvpp.api.legend.addColourKey(legend, colNames, colour); // Legend Colour Key
			
			// Draw lines between points
			var line = d3.svg.line()
				.x(function(d) { return x(d.category) + x.rangeBand()/2; })
				.y(function(d) { return y(d.value); });
				
			var flatLine = d3.svg.line()
				.x(function(d) { return x(d.category) + x.rangeBand()/2; })
				.y(function(d) { return y(0); });
			
			var yVals = data.map(function(d) { return d.value; });
			
			// Loop through series and plot lines between points
			for (var i=0; i < colNames.length; i++) {
				var measure = data.map(function(d) { return d.measure[i];});
				chart.append("path")
					.datum(measure)
					.attr("class", "line")
					.attr("d", flatLine)
					.attr('fill', 'none')
					.attr('stroke', colour(data[0].measure[i].name))
					.transition()
						.attr("d", line)
						.duration(500);
			};
			
			// Dashed path for trackerline
			var trackerPath = chart.append('path')
				.attr('stroke', '#666')
				.attr('stroke-dasharray', '5, 5')
				.attr('fill', 'none')
				.attr('d', 'M0,0')
				.attr('opacity', '0');
				
			var sectionPath = chart.append('path')
				.attr('stroke', '#CCC')
				.attr('fill', 'none')
				.attr('opacity', '0')
				.attr('d', 'M0,0');
			
			// Define sections
			var xGroups = chart.selectAll(".categoryGroups")
				.data(data)
			.enter().append("g")
				.attr("transform", function(d) { return "translate(" + x(d.category) + ",0)"; });
			
			xGroups.append('rect')
				.style('opacity', 0)
				.attr("x", 0)
				.attr('y', 0)
				.attr('height', y(d3.min([0,minY])))
				.attr('width', x.rangeBand())
				.attr('pointer-events', 'none') // Disable pointer events until animation complete
				.on('mouseover', function(d, i, event) {
					highlightGroup(this); // Highlight markers
					
					// Show tooltip
					var offset = getOffset(d3.event, this, container, x, d.category);
					rmvpp.api.tooltip.displayList(tooltip, container, d, 'category', 'measure', offset.X, offset.Y, colour, d.name);
					
					// Display section line
					var sectionLine = [
						{'x' : x(d.category) + x.rangeBand()/2, 'y' : y.range()[1]},
						{'x' : x(d.category) + x.rangeBand()/2, 'y' : y.range()[0]}
					];
					
					rmvpp.api.renderLine(sectionPath, sectionLine);

					
				})
				.on('mouseout', function(d, i) {
					revertColour(this); // Revert colours
					rmvpp.api.tooltip.hide(tooltip); // Hide tooltip
					sectionPath.attr('opacity', 0); // Hide section line
				})
				.transition().duration(500)
				.transition().attr('pointer-events', ''); // Enable point events when animation complete
			
			// Create Points
			xGroups.selectAll('g')
				.data(function(d) { return d.measure; })
				.enter()
				.append("circle")
				.attr('r', config.pointSize)
				.attr('cx', function(d, i) { return (x.rangeBand()/2); })
				.attr('cy', function(d, i) { return y(0); })
				.attr('fill', function(d) { return colour(d.name);} )
				.classed('marker', true)
				.on('mouseover', function(d, i) {
					highlightGroup(this); // Highlight markers
					
					// Show tooltip
					var datum = d3.selectAll($(this).parent().find('rect').toArray()).datum()
					var offset = getOffset(d3.event, this, container, x, datum.category);
					rmvpp.api.tooltip.displayList(tooltip, container, datum, 'category', 'measure', offset.X, offset.Y, colour, d.name);  // Show tooltip
					
					// Display tracklines
					var trackerLine = [
						{'x' : 0, 'y' : y(d.value)},
						{'x' : x(d.category) + x.rangeBand()/2, 'y' : y(d.value)},
						{'x' : x(d.category) + x.rangeBand()/2, 'y' : y.range()[0]}
					];
					
					trackerPath.attr('stroke', colour(d.name));
					rmvpp.api.renderLine(trackerPath, trackerLine);
				})
				.on('mouseout', function(d, i) {
					revertColour(this); // Revert colours
					rmvpp.api.tooltip.hide(tooltip); // Hide tooltip
					trackerPath.attr('opacity', 0); // Hide trackerline
				})
				.transition()
					.attr('cy', function(d, i) { return y(d.value); })
					.duration(500);
			
			
			// Get tooltip offset co-ordinates for this chart
			function getOffset(event, context, container, xScale, xValue) {
				var offset = {};
				offset.X = $(tooltip[0]).width() + parseFloat(+d3.select(context).attr("x")) + xScale(xValue) + +d3.select(context).attr('width')*0.66;
				offset.Y = 20 + event.pageY - $(container).position().top; // Use pageX as it is supported on IE as well. Subtract the position of the container
				return offset;
			}
			
			// Highlight markers in a group
			function highlightGroup(element) {
				d3.selectAll($(element).parent().find('circle.marker').toArray())
					.transition()
					.attr('fill', function(d) { return rmvpp.api.reduceBrightness(colour(d.name), 15); })
					.attr('r', d3.max([3,+config.pointSize + 2]))
					.duration(200);
			}
			
			// Revert colour of markers
			function revertColour(element) {
				d3.selectAll($(element).parent().find('circle.marker').toArray())
					.transition()
					.attr('fill', function(d) { return colour(d.name); })
					.attr('r', +config.pointSize)
					.duration(200);
			}
		}
    }
   
    return rmvpp;

}(rmvpp || {}))