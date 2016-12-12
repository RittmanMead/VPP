 rmvpp = (function(rmvpp){
    
    var pluginName = "rmvpp-scatterplotmatrix"
    var pluginDescription = "Scatterplot Matrix"
    
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = 50000;

    rmvpp[pluginName].testData = [
        [7000000.1, 3.5, 1.4, 0.2, "setosa"],
        [5.6, 1, 1.9, 0.2, "setosa"],
        [5.1, 3.5, 1.4, 0.2, "berlin"],
        [3.4, 3.2, 1.2, 2.3, "berlin"],
        [5.1, 3.5, 1.4, 0.2, "chad"],
        [6.8, 2.5, 4.4, 0.2, "chad"],
        [3.1, 4.5, 2.4, 0.2, "chad"]
    ]
                 
    rmvpp[pluginName].columnMappingParameters = [
          {
               targetProperty:"measure1",
               formLabel:"Measure 1",
			   measure: true
          },
                    {
               targetProperty:"measure2",
               formLabel:"Measure 2",
			   measure: true
          },
                    {
               targetProperty:"measure3",
               formLabel:"Measure 3",
			   measure: true
          },
                    {
               targetProperty:"measure4",
               formLabel:"Measure 4",
			   measure: true
          },
                    {
               targetProperty:"group",
               formLabel:"Group"
          }
    ]
     
    rmvpp[pluginName].configurationParameters = [
          {
               "targetProperty":"size",
               "label":"Size",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"150"
                }
          },

    ]
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
    var width = 960,
    size = config.size;
	
	$(container).addClass('scatterMatrix');
	
    var csv_names = [columnNames.measure1, columnNames.measure2, columnNames.measure3, columnNames.measure4];
    var csv = [];
    
	// Prep values by removing commas
    for (var i = 0; i < data.length; i++) {
        csv.push([data[i].measure1, data[i].measure2, data[i].measure3, data[i].measure4, data[i].group]);
    }

    var largestValue = -10000000;
    
	// Find largest numerical value -- derive padding from it so numbers arent clipped
    for (var i = 0; i < csv.length; i++) {
        for (var i2= 0; i2 <4; i2++) {
            if (csv[i][i2] > largestValue) {
                largestValue = csv[i][i2];
            }
        }
    }
    var padding = (largestValue+"").length * 6;


var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var color = d3.scale.category10();

  var domainByTrait = {},
      traits = d3.keys(csv_names).filter(function(d) {return d !== "group"; }),
      n = traits.length;
  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(csv, function(d) {return d[trait];});
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  var svg = d3.select(container).append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });
    //  .selectAll("text")
      //.attr("transform", "rotate(90)");

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d,i) {return csv_names[i]; });

  cell.call(brush);

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(csv)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 3)
        .style("fill", function(d) {return color(d[4]); });
  }

  var brushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.clear());
      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);
      brushCell = this;
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var e = brush.extent();
    svg.selectAll("circle").classed("hidden", function(d) {
      return e[0][0] > d[p.x] || d[p.x] > e[1][0]
          || e[0][1] > d[p.y] || d[p.y] > e[1][1];
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");


    if (rmvpp.testEnvironmentBoolean) {
         runTestsScatterPlotMatrix();
    }
    rmvpp.changeViewNameToVis(container, rmvpp[pluginName].pluginDescription);

    }
   
    return rmvpp;

}(rmvpp || {}))