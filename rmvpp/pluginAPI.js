// Javascript library of functions to aid with plugin development
// Can be used with rmvpp.js and rmvpp-ext.js
rmvpp.api = {}
rmvpp.api = (function(api) {
	
	// Draw x and y axes
	rmvpp.api.drawAxes = function(chart, x, y, width, height, margin, xTitle, yTitle) {		
		
		if ( x != "") { 
			var xLabelDisplay = xLabelDisplay = rmvpp.api.axisLabelDisplay(x.domain(), width);
		// D3 axes functions
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
			
		// Format numbers appropriately (scientific suffixes and 3 sig figs).
		if (typeof (x.rangePoints) === 'undefined') // rangePoints only exists on ordinal scale
			xAxis.tickFormat(scienceFormat);

		// Draw axes from functions above
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)	
			
		// If chart is too narrow, rotate X labels
		if (xLabelDisplay == 'R') {
			chart.selectAll(".x.axis text")  
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", "-.7em")
				.attr("transform", function(d) {
					return "rotate(-90)" 
			});
		}
		
		// If elements are too narrow, remove X Labels
		if (xLabelDisplay == 'N')
			chart.selectAll(".x.axis .tick").remove();	
		}
		
		if ( y != "") { 
		var yLabelDisplay = yLabelDisplay = rmvpp.api.axisLabelDisplay(y.domain(), width);
		
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
		
		if (typeof (y.rangePoints) === 'undefined') // rangePoints only exists on ordinal scale
			yAxis.tickFormat(scienceFormat);
		
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis);
		
		// If elements are too narrow, remove Y Labels
		if (yLabelDisplay == 'N')
			chart.selectAll(".y.axis .tick").remove();
		}
		
		// Add X title conditionally
		if (xTitle != "" && x != "") {
			chart.select('.x.axis')
				.append("text")
				.attr("x", width / 2)
				.attr("y", margin.bottom - 5)
				.style("text-anchor", "middle")
				.text(xTitle)
				.classed("label", true);
		}
		
		// Add Y title conditionally
		if (yTitle != "" && y != "") {
			var titleMargin = yLabelDisplay != 'N' ? (35+longestString(y.domain()))*-1 : -35;
			chart.select('.y.axis')
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", 0 - (height / 2))
				.attr("y", titleMargin)
				.style("text-anchor", "middle")
				.text(yTitle)
				.classed("label", true);
		}
		
		// Add 0 line
		if (x != "" && y != "") {
		chart.append('line')
			.attr('class', 'zero-line')
			.attr('x1', 0)
			.attr('x2', width)
			.attr('y1', y(0))
			.attr('y2', y(0))
			.style('stroke', '#666')
			.style('shape-rendering', 'crispEdges'); 
			}
	}
	
	// Returns standard plot margin
	rmvpp.api.margin = function(width, height, xTitle, yTitle, xScale, yScale) {
		var maxStringX = longestString(xScale.domain());
		var maxStringY = longestString(yScale.domain());
		var xAxisDisplay = rmvpp.api.axisLabelDisplay(xScale.domain(), width);
		var yAxisDisplay = rmvpp.api.axisLabelDisplay(yScale.domain(), width);
		
		var marginBottom = xAxisDisplay == 'R' ? 10 + maxStringX : 20;
		var marginLeft = yAxisDisplay != 'N' ? 35 + maxStringY : 35;
		
		if (xTitle != "") marginBottom += 30;
		if (yTitle != "") marginLeft += 30;
		
		var margin = {
			top: 10,
			right: 0,
			bottom: marginBottom,
			left: marginLeft
		}; 
	
		return margin;
	}
	
	// Basic linear scale function
	rmvpp.api.linearScale = function(range, series) {
		var max = d3.max(series);
		var min = d3.min(series);
		
		var linearScale = d3.scale.linear()
			.range(range)
			.domain([min, max]);
		
		return linearScale;
	}
	
	// Basic colour scale. Expects config properties of colour1, colour2 etc.
	rmvpp.api.colourScale = function(series, config, numColours) {
		var colourArray = [];
		// Build array of colours from config object
		for (var i=0; i < numColours; i++) {
			colourArray.push(config['colour' + (+i+1)]);
		}
		
		var colourScale = d3.scale.ordinal()
			.range(colourArray)
			.domain(d3.set(series).values()); // Set the domain to unique values
			
		return colourScale;
	}
	
	// Determines whether the array would need to be rotated to display on an axis, or can't display at all
	rmvpp.api.axisLabelDisplay = function(labelArray, width) {
		var axisDisplay = 'Y';
		var maxString = longestString(labelArray); // Assumes 6px per letter
		var elementWidth = width / (labelArray.length); // Define element width dynamically
		if (maxString > elementWidth)
			axisDisplay = 'R';
		
		if (elementWidth < 13)
			axisDisplay = 'N';
		
		return axisDisplay;
	}
	
	// Create SVG html
	rmvpp.api.createSVG = function(width, height, margin, selector, before) {
		return d3.selectAll(selector)
			.insert("svg", before)
				.attr("width", width + margin.left + margin.right) // Pad additionally for margin and legend
				.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	}
	
	/* ------ COLOUR FUNCTIONS ------ */
	
	// Increase colour brightness by a percentage
	rmvpp.api.increaseBrightness = function(hexColour, percent){
		var hsl = rgbToHSL(hexToRGB(hexColour));
		hsl[2] = d3.min([1, hsl[2] * (1+(percent/100))]);
		return rgbToHex(hslToRGB(hsl));
	}
	
	// Reduce colour brightness by a percentage
	rmvpp.api.reduceBrightness = function(hexColour, percent){
		var hsl = rgbToHSL(hexToRGB(hexColour));
		hsl[2] = hsl[2] * (1-(percent/100));
		return rgbToHex(hslToRGB(hsl));
	}
	
	// Increase colour brightness by a percentage
	rmvpp.api.increaseSaturation = function(hexColour, percent){
		var hsl = rgbToHSL(hexToRGB(hexColour));
		hsl[1] = d3.min([1, hsl[1] * (1+(percent/100))]);
		return rgbToHex(hslToRGB(hsl));
	}
	
	// Increase colour brightness by a percentage
	rmvpp.api.reduceSaturation = function(hexColour, percent){
		var hsl = rgbToHSL(hexToRGB(hexColour));
		hsl[1] = hsl[1] * (1-(percent/100));
		return rgbToHex(hslToRGB(hsl));
	}
	
	// Increase colour brightness on a scale of 0-100
	rmvpp.api.setBrightness = function(hexColour, brightness){
		var hsl = rgbToHSL(hexToRGB(hexColour));
		hsl[2] = (brightness/100);
		return rgbToHex(hslToRGB(hsl));
	}
	
	// Increase colour brightness on a scale of 0-100
	rmvpp.api.setSaturation = function(hexColour, saturation){
		var hsl = rgbToHSL(hexToRGB(hexColour));
		hsl[1] = (saturation/100);
		return rgbToHex(hslToRGB(hsl));
	}
	
	// Convert RGB value to Hex. Expects input in 'rgb(r, g, b)' format or as a three dimensional array
	function rgbToHex (rgb) {
		if (typeof(rbg) == 'string') {
			re = new RegExp('rgb\\((\\d*?), (\\d*?), (\\d*?)\\)')
			var splitRGB = re.exec(rgb);
			if(splitRGB) {
				splitRGB.pop(0);
				rgb = splitRBG;
			}
		}
			
		return "#" + componentToHex(+rgb[0]) + componentToHex(+rgb[1]) + componentToHex(+rgb[2]);
	}
	
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
	
	// Convert Hex colour to RGB
	function hexToRGB(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	}
	
	// Convert RGB colour to HSL
	function rgbToHSL(rgb){
		var r = rgb[0], g = rgb[1], b = rgb[2];
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}else{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	}
	
	// Convert HSL colour to RGB
	function hslToRGB(hsl){
		var r, g, b;
		var h = hsl[0], s = hsl[1], l = hsl[2];

		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			var hue2rgb = function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	/* ------ END OF COLOUR FUNCTIONS ------ */
	
	/* ------ TOOLTIP FUNCTIONS ------ */
	rmvpp.api.tooltip = {};
	
	// Create tooltip HTML
	rmvpp.api.tooltip.create = function(selector) {
		return d3.selectAll(selector)
			.append('div')
			.classed('tooltip', true)
			.style('display', 'none');
	}
	
	// Hide tooltip
	rmvpp.api.tooltip.hide = function(tooltip) {
		$(tooltip[0]).stop().fadeOut(200);
	}
	
	// Display (and move) tooltip - list format for an XY plot space. Expects measure to be an array of objects with properties `name` and `value`
	rmvpp.api.tooltip.displayList = function(tooltip, container, datum, category, measure, offsetX, offsetY, colourScale, highlight) {		
		highlight = highlight || false;
		$(tooltip[0]).empty().stop().fadeIn(200);
		var list = tooltip.append('ul');

		var elements = list.selectAll('li')
			.data(datum[measure])
			.enter()
			.append('li');
		var header = list.insert('li', ':first-child');
		header.append('b').text(datum[category]);
		
		// Generate mini legend and values
		elements.append('div').classed('legend', true).style('background', function(d) { return colourScale(d.name); });
		elements.append('span')
			.text(function(d) { return d.value; })
			.style('font-weight', function(d) {
				if (d.name == highlight) return 'bold';
				else return 'normal'; 
			});

		if (highlight) // Colour border
			tooltip.style('border', '1px solid ' + colourScale(highlight));
		else
			tooltip.style('border', '1px solid #CCC');
			
		positionTooltip(tooltip, offsetX, offsetY);
	}
	
	// Display tooltip with a full set of information
	rmvpp.api.tooltip.displayFull = function(tooltip, tooltipCols, columnMap, datum, offsetX, offsetY, highlightBorder) {
		$(tooltip[0]).empty().stop().fadeIn(200); // Display tooltip
		
		// Populate tooltip with content
		var list = tooltip.append('ul');
		tooltipCols.forEach(function(col) {
			var info = '<b>' +  + ': </b>' + datum[col];
			var listItem = list.append('li');
			listItem.append('b').text(columnMap[col].Name + ': ');
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
	
	/* ------ END OF TOOLTIP FUNCTIONS ------ */
	
	/* ------ LEGEND FUNCTIONS ------ */
	
	// Legend functions
	rmvpp.api.legend = {};
	
	// Create legend
	rmvpp.api.legend.create = function(chart, elements, title, chartWidth, colourScale) {
		var maxString = d3.max(elements.map(function(d) { return String(d).length; }))*6;
		var chartContainer = d3.selectAll($(chart[0]).parent().toArray()); // Get parent element
		
		// Make chart parent container wider to match the widest legend element
		chartContainer.attr('width', +chartContainer.attr('width') + maxString + 20)
		
		var legendContainer = chart.append('g')
			.attr('transform', 'translate(' + ((chartWidth + maxString) + 20) + ', 0)')
			.classed('legend', true);
		
			
		legendContainer.append('g')
			.attr('transform', 'translate(0,0)')
			.append('text')
				.classed('title', true)
				.text(title);
			
		return legendContainer;
	}
	
	// Add colour key to legend
	rmvpp.api.legend.addColourKey = function(legendContainer, elements, colourScale) {
		var yMargin = getLegendKeyOffset(legendContainer);
		
		// Legend elements
		var key = legendContainer.selectAll(".element")
			.data(elements.slice())
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(" + 0 + "," + (yMargin + (+i * 20)) + ")"; })
			.classed('key', true)
			
		key.append("rect")
			.attr("x", 0 - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", colourScale);

		key.append("text")
			.attr("x", 0 - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d; });
	}
	
	// Add size key to legend
	rmvpp.api.legend.addSizeKey = function(legendContainer, sizeName, sizeScale) {
		// Position elements in legend
		var yMargin = getLegendKeyOffset(legendContainer);
		
		// Legend elements
		var key = legendContainer.append("g")
			.classed('key', true)
			.attr("transform", "translate(0, " + yMargin + ")");
		
		// Heading
		key.append("text")
			.attr("x", 0 )
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(sizeName);
		
		// Use scales for displaying the key
		var sizeScale = sizeScale.copy();
		sizeScale.domain([1,4]);
		
		var posRange = d3.scale.linear()
			.domain([1,4])
			.range([10 + (legendContainer.node().getBBox().width * -1), sizeScale.range()[1] * -1])
		
		// Draw 4 circles of increasing size
		key.selectAll('g')
			.data([1,2,3,4]).enter()
			.append('circle')
				.attr('r', function(d) {return sizeScale(d);})
				.attr('cx', function(d) {return posRange(d);})
				.attr('cy', 20 + (+sizeScale.range()[1]));
	}
	
	// Get y offset of lowest key group (g) elements
	function getLegendKeyOffset(legendContainer) {
		var lastGroup = legendContainer.selectAll('g.key').last(), yMargin = 5;
		if (lastGroup[0][0]) {
			var translate = d3.transform(lastGroup.attr('transform')).translate;
			yMargin = yMargin + lastGroup.node().getBBox().height + translate[1];
		}
		return yMargin;
	}
	
	/* ------ END OF LEGEND FUNCTIONS ------ */
	
	// Render standard title
	rmvpp.api.appendTitle = function(container, title) {
		d3.select(container)
			.append('div')
			.classed('chartTitle', true)
			.text(title);
	}
	
	// Render lines from co-ordinate arrays
	rmvpp.api.renderLine = function(path, coords) {
		var line = d3.svg.line()
			.x(function(d) { return d.x;})
			.y(function(d) { return d.y;});
		
		path.datum(coords)
			.attr('opacity', 1)
			.attr('d', line);
	}
	
	// Pivot data - compress rows for an additional column. Expects measures in a list (multiple) format
	rmvpp.api.pivotData = function(data, columnMap, pivotCol, keyCol, valueCol, denormCols) {
		var colNames = [], output = {};
		denormCols = denormCols || [];
		denormCols = denormCols.concat([keyCol, pivotCol]);
				
		var nester = d3.nest() // Pivot data frame
			.key(function(d) { return d[keyCol];})
			.key(function(d) { return d[pivotCol];});
		
		var nest = nester.entries(data), newFrame = [];
		
		// Loop over vary by colour keys
		nest.forEach(function(n) {
			var element = {};
			element[keyCol] = n.key;
			element[valueCol] = [];
			n.values.forEach(function(v) {
				var yVal = {};
				colNames.push(v.key);
				yVal['name'] = v.key;
				yVal['value'] = v.values[0][valueCol][0].value;
				denormCols.forEach(function(c) {
					yVal[c] = v.values[0][c];
				});
				element[valueCol].push(yVal);
			});
			newFrame.push(element);
		});
		data = newFrame;
		
		colNames = d3.set(colNames).values();
		
		output.colNames = colNames;
		output.data = data;
		return output; // Return object with data and new column array
	}
	
	// Returns an interaction column object based on chosen input properties, the column map and data
	rmvpp.api.actionColumnMap = function(properties, columnMap, data) {
		var obj = [];
		
		// Accept single objects or arrays
		if (Object.prototype.toString.call( data ) === '[object Object]')
			data = [data];
		
		properties.forEach(function(prop) { // Loop through properties
			data.forEach(function(d) {
				if (Object.prototype.toString.call( columnMap[prop] ) === '[object Object]') // Single properties
					obj.push({'id' : prop, 'col' : columnMap[prop], 'value' : d[prop]});
				else {
					columnMap[prop].forEach(function(col, i) { // Multiple properties
						obj.push({'id' : prop + i, 'col' : col, 'value' : d[prop][i].value});
					});
				} 				
			});
		})
		return [obj];
	}
	
	// Get Date from string
	rmvpp.api.toDate = function (str, format) {
		format = format || 'uk';
		var date;
		
		switch(format) {
			case 'uk':
				var re = new RegExp('(\\d*?)\/(\\d*?)\/(\\d\\d\\d\\d)');
				day = +re.exec(str)[1], month = +re.exec(str)[2], year = +re.exec(str)[3]
				date = new Date(year, month-1, day);
				break;
		}
		
		return date;
	}
	
	// Convert OBIEE measure to d3 aggregation
	rmvpp.api.convertMeasure = function(measure) {
		var outMeasure;
		switch(measure) {
			case 'avg':
				outMeasure = 'mean';
				break;
			default:
				outMeasure = 'sum';
				break;
		}
		return outMeasure;
	}
	
	// Returns the longest string in an array in px
	function longestString(array) {
		return (d3.max(array, function(d) {
			if (isNaN(d))
				return String(d).length;
			else
				return scienceFormat(d).length;
		})*6)
	}
	
	// Render loading screen in a given container
	rmvpp.api.loadingScreen = function(container, colour, text) {
		colour = colour || '#2CC75A';
		text = text || '';
		$(container).append($('<div class="loading"></div>')
			.append('<i style="color: ' + colour + ';" class="fa fa-circle-o-notch fa-spin fa-3x"></i>')
			.append('<div style="margin-top: 5px;">' + text + '</div>')
		);
	}
	
	// Display error message
	rmvpp.api.displayError = function(container, errorMsg) {
		console.log(errorMsg);
		$(container).empty();
		var errorBox = d3.select(container).append('div').classed('error', true);
		errorBox.append('span').attr('class', 'fa fa-times-circle').style('margin-right', '5px');
		errorBox.append('span').html(errorMsg.replace(/\n/g, '<br/>'));
		throw errorMsg;
	}
	
	// Universal label format
	var scienceFormat = d3.format('.3s');
	
	return api;
}(rmvpp.api || {}))

/* ------ D3 EXTENSIONS ------ */

// Get first element
d3.selection.prototype.first = function() {
  return d3.select(this[0][0]);
};

// Get last element
d3.selection.prototype.last = function() {
  var last = this.size() - 1;
  return d3.select(this[0][last]);
};

// Get parent element
d3.selection.prototype.parent = function() {
	return d3.selectAll($(this[0]).parent().toArray())
};

/* ------ END OF D3 EXTENSIONS ------ */

/* ------ LEAFLET EXTENSIONS ------ */

// Tile Layer helper extension for free tile layer maps
L.TileLayer.Common = L.TileLayer.extend({
	initialize: function (options) {
		L.TileLayer.prototype.initialize.call(this, this.url, options);
	}
});

// Map to be used across plugins. Change tile set as desired
(function () {
	var attr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
	// var attr = 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
	
	L.TileLayer.Main = L.TileLayer.Common.extend({
		//url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Open Street Default
		url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', // CartoDB
		//url: 'http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', // Road Map
		options: {attribution: attr},
		crossOriginKeyword: null
	});
}());

// Extension to handle topojson
L.TopoJSON = L.GeoJSON.extend({  
	addData: function(jsonData) {    
		if (jsonData.type === "Topology") {
			for (key in jsonData.objects) {
				geojson = topojson.feature(jsonData, jsonData.objects[key]);
				L.GeoJSON.prototype.addData.call(this, geojson);
			}
		}    
		else {
			L.GeoJSON.prototype.addData.call(this, jsonData);
		}
	}  
});

/* ------ END OF LEAFLET EXTENSIONS ------ */