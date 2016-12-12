 rmvpp = (function(rmvpp){
	
    var pluginName = "rmvpp-bar"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = 'Bar Chart';
	rmvpp[pluginName].rowLimit = 50000;
	
	// List additional dependencies (Assume OBIEE, jQuery, jQuery.categoryML2Json and d3)
	rmvpp[pluginName].dependencies = {
		'js' : [
			'/rmvpp/api-plugins/bar/bar.js'
		]
	};
	
    rmvpp[pluginName].testData = [
		['3e', '8.59487344508915'],
		['4FM', '0.26547871645063'],
		['4Music', '1.28124144610785'],
		['98FM', '0.217209858914152'],
		['Alibi', '2.18114899992961'],
		['Animal Planet', '1.75604825974354'],
		['At the Races', '1.72762301812899'],
		['BBC 1', '0.011061613185443'],
		['BBC 2', '8.07698882777068'],
		['BBC 5Live Extra', '0.075420089900747'],
		['BBC 6 Music', '0.0774312922981'],
		['BBC FOUR', '5.43628008004586'],
		['BBC News 24', '4.08475206902447'],
		['BBC Radio 1', '0.093520911476927'],
		['BBC Radio 2', '0.139778566616051'],
		['BBC Radio 3', '0.078436893496777'],
		['BBC Radio 4', '0.068380881510011'],
		['BBC Radio 4 Extra', '0.048268857536478'],
		['BBC Radio 5Live', '0.151845781000171'],
		['BBC Radio Ulster', '0.044246452741772'],
		['BBC THREE', '6.86624498456402'],
		['BBC TWO HD', '4.68811278823044'],
		['BBC World', '2.44035963194576'],
		['BBC World Svce', '0.060336071920598'],
		['BBC1 HD', '8.88146978671199']
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
	
	
	
	rmvpp[pluginName].highlightBars = function(output, container) {
		var bars = container.selectAll('rect.bar');
		var data = bars.data();
		var config = output[0].config;
		var colour = rmvpp.api.colourScale(data.map(function(d) { return d.name; }), config, 6); // Set colour scale
		
		bars.each(function(d, i) {
			var filter = [];
			rmvpp[pluginName].revertColour(d3.select(this), colour); // Revert any highlighted points
			output.forEach(function(criteria) {	filter.push($.inArray(d[criteria.targetId], criteria.values) > -1);	}); // Find matching points
			
			// Highlight points
			if (d3.set(filter).values().length == 1 && d3.set(filter).values()[0] == 'true') {
				rmvpp[pluginName].highlight(d3.select(this), colour, 50);
			}
		});
	}; 
	
	// Highlight selected elements
	rmvpp[pluginName].highlight = function(element, colourScale, reduceColour) {;
		element
			.transition()
			.attr('fill', function(d) { return  rmvpp.api.reduceBrightness(colourScale(d.name), reduceColour); })
			.duration(100);
	};
	
	// Revert colour of bars
	rmvpp[pluginName].revertColour = function(element, colourScale) {
		element
			.transition()
			.attr('fill', function(d) { return colourScale(d.name); })
			.duration(100);
	};
	
    rmvpp[pluginName].render = function(data, columnMap, config, container)   {		
	// Compile column name list for Y
		var colNames = [columnMap.measure1, columnMap.measure2, columnMap.measure3], legendTitle = 'Measures';
		
		colNames = colNames.filter(function(d) {
			return typeof(d) != "undefined";
		});
		
		// Denormalise X label onto Y values for tooltip later
		data.map(function(d) {
			d.measure = [{'name' : columnMap.measure1, 'value' : d.measure1.replace(/,/g,''), 'x' : d.category}];
			if (typeof(columnMap.measure2) != "undefined") {
				d.measure.push({'name' : columnMap.measure2, 'value' : d.measure2.replace(/,/g,''), 'x' : d.category});
				if (typeof(columnMap.measure3) != "undefined") {
					d.measure.push({'name' : columnMap.measure3, 'value' : d.measure3.replace(/,/g,''), 'x' : d.category});
				}
			}
		});
		
		var varyColour = false;
		
		var xTitle = config.xTitle, yTitle = config.yTitle;
		if (config.xTitle == 'default') xTitle = columnMap.category.Name;
		if (config.yTitle == 'default') {
			if (varyColour)
				yTitle = columnMap.measure[0].Name;
			else
				yTitle = "";
		} 
		
		// Add chart title if necessary
		if (config.chartTitle != "")
			rmvpp.api.appendTitle(container, config.chartTitle);
		
		// Create Sort radio buttons
		var sortControl = d3.select(container)
			.append('div')
			.classed('sortBar', true);

		var sortHeader = sortControl.append('span');
		sortHeader.append('b').text('Sort by');
		sortHeader
			.append('select')
				.classed('sortColumn', true)
				.style('margin', '0 10px')
				.selectAll('.sortOptions')
				.data([columnMap.category.Name].concat(colNames))
				.enter()
				.append('option')
					.text(function(d, i) {return d})
					.attr('value', function(d, i) {return i});
		
		$(sortControl[0]).append('<span>Ascending<input type="radio" name="sortBar" value="asc"></span>');
		$(sortControl[0]).append('<span>Descending<input type="radio" name="sortBar" value="desc" checked></span>');
		$(sortControl[0]).find('.sortColumn').val('1'); // Set first Y column by default
		
		
		// Render container div
		var chartContainer = d3.select(container)
			.append('div')
			.classed('bar-chart', true);
		
		var selector = $(chartContainer[0]).toArray();
		
		// Render bar chart and navigation bar
		
		if (config.brushNav)
			renderNav(data, $(chartContainer[0]), {'col' : 1, 'dir' : 'desc'});
		renderBar(data, $(chartContainer[0]), {'col' : 1, 'dir' : 'desc'}); // Sort by first Y column descending by default
		
		
		// Render chart on sort change
		$('.sortBar input, .sortBar select').change(function() {
			sortBar = $(this).parents('.sortBar');
			barContainer = sortBar.next('.bar-chart')
			
			sortObj = {}; // Use object to define sort column and direction
			sortObj.dir = sortBar.find('input[name="sortBar"]:checked').val()
			sortObj.col = sortBar.find('.sortColumn').val();
			renderBar(data, barContainer, sortObj);
			if (config.brushNav)
				renderNav(data, barContainer, sortObj);
				renderBar(data, barContainer, sortObj);
		});
		
		// Mini Chart Code
		//	add in new variables and navigation chart details
		function renderNav(data, selector,  sort) { 
		
			// Sort data based on input
			switch(sort.dir) {
				case ('asc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.ascending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.ascending(a.category, b.category); });
					break;
				case ('desc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.descending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.descending(a.category, b.category); });
					break;
			}
			
			$(selector).find('.navigator').remove(); // Clear existing chart
			selector = selector.toArray(); // Convert jQuery object for D3 use
		
			// Define column names and height and width from config
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
			var margin = rmvpp.api.margin(width, height, xTitle, yTitle, x, y);
			
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
				.rangeBands([0, navWidth], .1)
			
			var navContainer = d3.selectAll(selector).append('div').classed('navigator', true);
			var navChart = rmvpp.api.createSVG(navWidth, navHeight, margin, navContainer[0]); // Create chart SVG to standard size
			
			rmvpp.api.drawAxes(navChart, x, "", navWidth, navHeight, margin) // Axes		
			navChart.selectAll('.x.axis .tick').remove(); // Remove X Labels
			
			var navGroups = navChart.selectAll(".navGroups")
				.data(data)
			.enter().append("g")
				.attr("transform", function(d) { return "translate(" + x(d.category) + ",0)"; });
			
			// Create bars
			navGroups.selectAll('g')
				.data(function(d) { return d.measure; })
				.enter()
				.append("rect")
				.classed('bar', true)
				.attr("x", function(d, i) { return x1(d.name); })
				.attr("width", x1.rangeBand())
				.attr("y", function(d, i) { return navFrac*y(Math.max(0, d.value)); })
				.attr("height", function(d, i) { return navFrac*Math.abs(y(d.value) - y(0)); });
					
		
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
				
					// Render chart on sort change
					$('.sortBar input, .sortBar select').change(function() {
						sortBar = $(this).parents('.sortBar');
						barContainer = sortBar.next('.bar-chart')
						
						sortObj = {}; // Use object to define sort column and direction
						sortObj.dir = sortBar.find('input[name="sortBar"]:checked').val()
						sortObj.col = sortBar.find('.sortColumn').val();
					}); 
					
					if (typeof sortObj != 'undefined') { //typeof sortObj != 'undefined' 
						renderBar(selectedCategory, $(selector[0]), sortObj);
					} else {
						renderBar(selectedCategory, $(selector[0]), {'col' : 1, 'dir' : 'desc'});
					}
			
				});
		
			navChart.append("g")
				.attr("class", "viewport")
				.call(viewport)
				.selectAll("rect")
				.attr("height", navHeight); 
		};
		
		
		
		// Main rendering function
		function renderBar(data, selector, sort) {
		
		// Error if no bars selected
		if (data.length == 0) {
		 throw 'No data can not render chart'
		}
			// Sort data based on input
			switch(sort.dir) {
				case ('asc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.ascending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.ascending(a.category, b.category); });
					break;
				case ('desc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.descending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.descending(a.category, b.category); });
					break;
			}
			
			$(selector).find('.main, .tooltip').remove(); // Clear existing chart
			selector = selector.toArray(); // Convert jQuery object for D3 use
		
			// Define column names and height and width from config
			var width = +config.w, height = +config.h
			
			
			// Minimum and maximum measure values
			var maxY = d3.max(data, function(d) { return d3.max(d.measure, function(d) { return +d.value; }); });
			var minY = d3.min(data, function(d) { return d3.min(d.measure, function(d) { return +d.value; }); });
			
			// Define colour palette
			var colour = rmvpp.api.colourScale(data[0].measure.map(function(d) { return d.name; }), config, 6); // Set colour scale
			
			// Define X axis
			var x = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }))
				.rangeBands([0, width], 0.1);

			// Define category grouping
			var x1 = d3.scale.ordinal()
				.domain(colNames)
				.rangeRoundBands([0, x.rangeBand()]);			
			
			// Define Y axis
			var y = d3.scale.linear()
					.domain([d3.min([0, minY]), d3.max([0,maxY])]) // From 0 to maximum
			
			// Get standard margin
			var margin = rmvpp.api.margin(width, height, xTitle, yTitle, x, y);
			
			height = height - margin.top - margin.bottom; // Modify height by margin
			y.range([height, 0]).nice(); // Apply range once height has been modified for margin
			
			var chart = rmvpp.api.createSVG(width, height, margin, selector, ".navigator"); // Create chart SVG to standard size
			chart.parent().classed('main', true); //needs.parent to be assigned to the right part when using SVG function
			
			var tooltip = rmvpp.api.tooltip.create(selector); // Create tooltip object
			
			rmvpp.api.drawAxes(chart, x, y, width, height, margin, xTitle, yTitle) // Axes
			var legend = rmvpp.api.legend.create(chart, colNames, legendTitle, width);  // Legend
			rmvpp.api.legend.addColourKey(legend, colNames, colour); // Legend Colour Key

			// Create x partitions
			var xGroups = chart.selectAll(".categoryGroups")
				.data(data)
			.enter().append("g")
				.attr("transform", function(d) { return "translate(" + x(d.category) + ",0)"; });
			
			// Generate invisible rectangles for section hovering
			xGroups.append('rect')
				.classed('section', true)
				.style('opacity', 0)
				.attr("x", 0)
				.attr('y', 0)
				.attr('height', y(d3.min([0,minY])))
				.attr('width', x.rangeBand())
				.attr('pointer-events', 'none') // Disable pointer events until animation complete
				.on('mouseover', function(d, i, event) {
					var offset = getOffset(d3.event, this, container, x, d.category);
					rmvpp.api.tooltip.displayList(tooltip, container, d, 'category', 'measure', offset.X, offset.Y, colour);
					rmvpp[pluginName].revertColour(chart.selectAll('rect.bar:not(.selected)'), colour);
					rmvpp[pluginName].highlight(d3.select(this).parent().selectAll('rect.bar:not(.selected)'), colour, 15); // Highlight group of bars
				})
				.on('mouseout', function(d, i) {
					rmvpp[pluginName].revertColour(d3.select(this).parent().selectAll('rect.bar:not(.selected)'), colour);
					rmvpp.api.tooltip.hide(tooltip);
				})
				.transition().duration(500)
				.transition().attr('pointer-events', ''); // Enable point events when animation complete
			
			
			// Create bars
			xGroups.selectAll('g')
				.data(function(d) { return d.measure; })
				.enter()
				.append("rect")
				.classed('bar', true)
				.attr("x", function(d, i) { return x1(d.name); })
				.attr("y", function(d, i) {return y(0);}) // Set bar height to 0 for animations
				.attr("height", function(d, i) {return 0;})
				.attr("width", x1.rangeBand())
				.attr('fill', function(d) { return colour(d.name); })
				.attr('pointer-events', 'none') // Disable pointer events until animation complete
				.on('mouseover', function(d, i, event) {
					var datum = d3.selectAll($(this).parent().find('rect.section').toArray()).datum();
					var offset = getOffset(d3.event, this, container, x, datum.category);
					rmvpp.api.tooltip.displayList(tooltip, container, datum, 'category', 'measure', offset.X, offset.Y, colour, d.name);
					
					rmvpp[pluginName].highlight(d3.select(this).parent().selectAll('rect.bar:not(.selected)'), colour, 15); // Highlight group of bars
					//if (!d3.select(this).classed('selected'))
						//rmvpp[pluginName].highlight(d3.select(this), colour, 50); // Highlight this specific bar
				})
				.on('mouseout', function(d, i, event) {
					rmvpp[pluginName].revertColour(d3.select(this).parent().selectAll('rect.bar:not(.selected)'), colour);
					rmvpp.api.tooltip.hide(tooltip);
				})
				.on("click", function(d, i) {
					if (event.ctrlKey) {
						d3.select(this)
							.classed('selected', true)
							.attr('fill', function(d) { return rmvpp.api.increaseBrightness(colour(d.name), 30); });
					} else {
						selectedBars = chart.selectAll('rect.bar.selected')
						selectedBars.classed('selected', false);
						rmvpp[pluginName].revertColour(selectedBars, colour);
						d3.select(this)
							.classed('selected', true)
							.attr('fill', function(d) { return rmvpp.api.increaseBrightness(colour(d.name), 30); });
					}
				})
				.transition() // Animate bars on render
					.attr("y", function(d, i) { return y(Math.max(0, d.value)); })
					.attr("height", function(d, i) { return Math.abs(y(d.value) - y(0)); })
					.duration(500)
					.transition().attr('pointer-events', ''); // Enable point events when animation complete
			
			
			// Get tooltip offset co-ordinates for this chart
			function getOffset(event, context, container, xScale, xValue) {
				var offset = {};
				offset.X = $(tooltip[0]).width() + parseFloat(+d3.select(context).attr("x")) + xScale(xValue) + +d3.select(context).attr('width')*0.66;
				offset.Y = 20 + event.pageY - $(container).position().top; // Use pageX as it is supported on IE as well. Subtract the position of the container
				return offset;
			}
		};
    }
   
    return rmvpp;

}(rmvpp || {}))