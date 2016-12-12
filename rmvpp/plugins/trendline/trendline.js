 rmvpp = (function(rmvpp){
    
    /**
     *  Plugin Configuration
     */ 
    var pluginName = "rmvpp-trendline"
    var pluginDescription = "Trend Line"
    var rowLimit = 50000;


    // Do not modify these lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;
   
    rmvpp[pluginName].testData = [
                                        ["2014 01", "60"],
                                        ["2014 02", "80"],
                                        ["2014 03", "10"],
                                        ["2014 04", "600"],
                                        ["2014 05", "400"],
                                        ["2014 06", "500"],
                                        ["2014 07", "900"],
                                        ["2014 08", "750"],
                                        ["2014 09", "1,000"],
                                        ["2014 10", "1,200"],
                                        ["2014 11", "900"],
                                        ["2014 12", "8,000"],
                                       ]
                                       
    
    rmvpp[pluginName].columnMappingParameters = [
        {
            targetProperty:"date", 
            formLabel:"Date"                          
        },
        {
            targetProperty:"measure", 
            formLabel:"Measure"                          
        }
    ]
    
    rmvpp[pluginName].configurationParameters = [
        { 
            "targetProperty":"date_format", 
            "label":"Date Format",
            "inputType":"textbox",
            "inputOptions": {               
                "defaultValue": "%Y %m"             
            }
        }
    ]

   
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
        
        // Render Visual
        var margin = {top: 20, right: 30, bottom: 30, left: 80},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var parseDate = d3.time.format(config.date_format).parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.measure); });

        var svg = d3.select(container).append("svg")
            //.attr("id", visualisationContainerID)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
           .append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

         data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.measure = +d.measure.replace(/,/g,"")
          });

          x.domain(d3.extent(data, function(d) { return d.date; }));
          y.domain(d3.extent(data, function(d) { return d.measure; }));

          // Derive a linear regression
          var lin = ss.linear_regression().data(data.map(function(d) {
            return [+d.date, d.measure];
          })).line();

          // Create a line based on the beginning and endpoints of the range
          var lindata = x.domain().map(function(x) {
            return {
              date: new Date(x),
              measure: lin(+x)
            };
          });

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

         svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(columnNames.measure);

          svg.append("path")
              .datum(data)
              .attr("class", "line")
              .attr("d", line);

          svg.append("path")
              .datum(lindata)
              .attr("class", "reg")
              .attr("d", line);


            }

    // Do not modify this line
    return rmvpp;
    

}(rmvpp || {}))