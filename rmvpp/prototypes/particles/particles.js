 rmvpp = (function(rmvpp){
    
    var pluginName = "particles"
		
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = "Particles";
	
	// List additional dependencies (Assume OBIEE, jQuery, jQuery.xml2json and d3)
	rmvpp[pluginName].dependencies = {
		'js' : [
			'/rmvpp/prototypes/particles/particles.js'
		]
	};
                 
    rmvpp[pluginName].columnMappingParameters = []
     
    rmvpp[pluginName].configurationParameters = [
        {
			"targetProperty":"w",
			"label":"Width",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 800
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
		}
    ]
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
		var width = config.w,
			height = config.h;

		var x1 = width / 2,
			y1 = height / 2,
			x0 = x1,
			y0 = y1,
			i = 0,
			r = 200,
			τ = 2 * Math.PI;

		var canvas = d3.select(container).append("canvas")
			.attr("width", width)
			.attr("height", height)
			.style('background', '#111')
			.on("ontouchstart" in document ? "touchmove" : "mousemove", move);

		var context = canvas.node().getContext("2d");
		context.globalCompositeOperation = "lighter";
		context.lineWidth = 2;

		d3.timer(function() {
		  context.clearRect(0, 0, width, height);

		  var z = d3.hsl(++i % 360, 1, .5).rgb(),
			  c = "rgba(" + z.r + "," + z.g + "," + z.b + ",",
			  x = x0 += (x1 - x0) * .1,
			  y = y0 += (y1 - y0) * .1;

		  d3.select({}).transition()
			  .duration(2000)
			  .ease(Math.sqrt)
			  .tween("circle", function() {
				return function(t) {
				  context.strokeStyle = c + (1 - t) + ")";
				  context.beginPath();
				  context.arc(x, y, r * t, 0, τ);
				  context.stroke();
				};
			  });
		});

		function move() {
		  var mouse = d3.mouse(this);
		  x1 = mouse[0];
		  y1 = mouse[1];
		  d3.event.preventDefault();
		}
    }
   
    return rmvpp;

}(rmvpp || {}))