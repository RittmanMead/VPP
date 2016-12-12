 rmvpp = (function(rmvpp){
	
    var pluginName = "wordCloud"
    var pluginDescription = "Word Cloud"

    // Do not modify these 3 lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
	
	// List additional dependencies (Assume OBIEE, jQuery, jQuery.XML2Json and d3)
	rmvpp[pluginName].dependencies = {
		'js' : [
			'/web-api/js/lib/d3.layout.cloud.js',
			'/web-api/api-plugins/wordCloud/wordCloud.js'
		]
	};
	
    rmvpp[pluginName].testData = [['accurate','5,000'],	['active','1,000'],	['adventurous','2,000'], ['agriculture','1,000'], ['aim','1,000'], ['analytical','9,000'], ['Application','1,000']];
                 
    rmvpp[pluginName].columnMappingParameters = [
    	{
			targetProperty:"word",
			formLabel:"Word"
		},
		{
			targetProperty:"freq",
			formLabel:"Frequency",
			measure:true
		},
    ];
     
    rmvpp[pluginName].configurationParameters = [
		{
			"targetProperty":"spiral",
			"label":"Layout Algorithm",
			"inputType":"radio",
			"inputOptions": {
				"values":["Archimedean", "Rectangular"] ,  
				"defaultValue": "Archimedean"
			}
		},
		{
			"targetProperty":"scale",
			"label":"Sizing Scale",
			"inputType":"radio",
			"inputOptions": {
				"values":["Linear", "Log"] ,  
				"defaultValue": "Linear"
			}
		},
		{
			"targetProperty":"sizeRange",
			"label":"Size Range",
			"inputType":"range",
			"inputOptions": {
				"min" : 8,
				"max" : 100,
				"defaultValue": [14, 50]
			}
		},
		{
			"targetProperty":"font",
			"label":"Font",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue": "Calibri"
			}
		},
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
			"targetProperty":"orientations",
			"label":"Word Orientations",
			"inputType":"angles",
			"inputOptions": {
				"defaultValue": {'count' : 5, 'from' : -60, 'to' : 60 }
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
	
	rmvpp[pluginName].actions = [
		{
			'trigger' : 'wordClick',
			'type' : 'click',
			'output' : ['word'],
			'name' : 'Click - Word',
			'description' : 'Click on a word to pass the column map and value.'
		},
		{
			'trigger' : 'wordHover',
			'type' : 'hover',
			'output' : ['word'],
			'name' : 'Hover - Word',
			'description' : 'Hover over a word to pass the column map and value.'
		}
	];
	
	rmvpp[pluginName].reactions = [
		{
			id : 'filter',
			name : 'Filter',
			description : 'Accepts a column map and value and filters the report if the subject area matches.',
			type : 'general'
		}
	];
     
    rmvpp[pluginName].render = function(data, columnMap, config, container)   {       
		var d3Scale = d3.scale.linear();//, fill = d3.scale.category20();
		var fill = d3.scale.ordinal()
				.range([config.colour1, config.colour2, config.colour3, config.colour4, config.colour5, config.colour6]);
        d3Scale.domain([0, config.orientations.count - 1]).range([config.orientations.from, config.orientations.to]);
		
        var layout = d3.layout.cloud()
			.size([config.w, config.h])
			.fontSize(function(d) { return fontSize(+d.freq); })
			.text(function(d) { return d.word; })
			.rotate(function() {
			  return d3Scale(~~(Math.random() * config.orientations.count));
			})
    		.on("end", draw);
		
		var wordContainer = d3.select(container).append('div')
			.classed('word-cloud', true);
		
    	var svg = wordContainer.append("svg")
			.attr("width", config.w)
			.attr("height", config.h);
		
		var vis = svg.append("g").attr("transform", "translate(" + [config.w >> 1, config.h >> 1] + ")");
			
		// Draw cloud function
		function draw(data, bounds) {
			scale = bounds ? Math.min(
				config.w / Math.abs(bounds[1].x - config.w / 2),
				config.w / Math.abs(bounds[0].x - config.w / 2),
				config.h / Math.abs(bounds[1].y - config.h / 2),
				config.h / Math.abs(bounds[0].y - config.h / 2)
			) / 2 : 1;
			
			words = data;
			
			var text = vis.selectAll("text")
					.data(words, function(d) { return d.text.toLowerCase(); });
				text.transition()
					.duration(1000)
					.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
					.style("font-size", function(d) { return d.size + "px"; });
				text.enter().append("text")
					.attr("text-anchor", "middle")
					.attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
					.style("font-size", "1px")
				.transition()
					.duration(1000)
					.style("font-size", function(d) { return d.size + "px"; });
				text.style("font-family", function(d) { return d.font; })
					.style("fill", function(d) {
						Math.floor(Math.random() * 5)
						return fill(d.text.toLowerCase());		
					})
				.text(function(d) { return d.text; });
			
			vis.transition()
				.delay(1000)
				.duration(750)
				.attr("transform", "translate(" + [config.w >> 1, config.h >> 1] + ")scale(" + scale + ")");
		}
		
		// Generate/regenerate function
		function generate() {
			layout
				.font(config.font)
				.spiral(config.spiral.toLowerCase())
			min = d3.min(data, function(d) { return +d.freq;} );
			max = d3.max(data, function(d) { return +d.freq;} );
			fontSize = d3.scale[config.scale.toLowerCase()]().domain([min, max]).range([config.sizeRange[0], config.sizeRange[1]]); // Scale fonts based on config parameters
			complete = 0;
			words = [];
			layout.stop().words(data).start();
		}

		generate();
    }
   
    return rmvpp;

}(rmvpp || {}))