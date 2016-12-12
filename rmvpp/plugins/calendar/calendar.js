 rmvpp = (function(rmvpp){
    
    var pluginName = "rmvpp-calendar"
    var pluginDescription = "Calendar"
    
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = 10000;

    rmvpp[pluginName].testData = [
          ["2015-02-03", "3,000"],
	      ["2015-02-04", 10],
	      ["2015-06-07", "12,000"],
	      ["2015-12-25", 7],
	      ["2015-01-03", 6],
	      ["2015-08-17", 1],
	      ["02/08/2015", 3],
	      ["02/09/2015", 4],
	      ["02/10/2015", 5],
	      ["02/11/2015", 6],
	      ["02/12/2015", 7],
	      ["02/13/2015", "8,000,000"],
	]
                 
    rmvpp[pluginName].columnMappingParameters = [
          {
               targetProperty:"Date",
               formLabel:"Date"
          },
          {
               targetProperty:"Metric",
               formLabel: "Metric"
          } 
      ]
     
    rmvpp[pluginName].configurationParameters = [
          {
               "targetProperty":"upper_limit",
               "label":"Value Upper Limit",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"10"
                }
          },
           {
               "targetProperty":"lower_limit",
               "label": "Value Lower Limit",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"1"
               }
              },
          /* removing MD functionality for now

          {
               "targetProperty":"channel",
               "label":"Master Detail Channel (optional)",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":""
                }
          },

          {
               "targetProperty":"field",
               "label":"Master Detail Field (optional) e.g."+ '\"Time\".\"Calendar Date\"',
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":""
                }
          },*/
          {
                "targetProperty":"date_format",
                "label":"Date Format (D3 Syntax)",
                "inputType":"textbox",
                "inputOptions":{
                    "defaultValue":"%Y-%m-%d"
                }
          },
          {
               "targetProperty":"years",
               "label":"Select a year(s)",
               "inputType": "dropdown",
               "inputOptions": {
                    "multiSelect": true,
                    "values": ["2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008",
                     "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000"],
                    "defaultSelection":"1" 
               }
          }
      ]
     
    rmvpp[pluginName].render = function(csv, columnNames, config, container)   {
        //handle commas
        config.lower_limit = config.lower_limit;
        config.upper_limit = config.upper_limit;


            var calendarElement =  container;
    	    var highColorLimit = +config.upper_limit;
            var lowerColorLimit = +config.lower_limit;
            var yearsArray = config.years;
            var dateFormat = config.date_format;
            var channel = config.channel;

	    for (var i = 0; i < yearsArray.length; i++) {
                 yearsArray[i] = +yearsArray[i];        
    	    }   
   
            var data = d3.nest()
    		.key(function(d) {return d.Date; })
    		.rollup(function(d) {return +(d[0].Metric); })
    		.map(csv)     

		
	    var width = 960,
        height = 136,
        cellSize = 17; // cell size
    
    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        percent = d3.format(".1%"),
        format = d3.time.format(dateFormat);

    var color = d3.scale.quantize()
        .domain([lowerColorLimit, highColorLimit])
        .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
 
	d3.select(container).attr("class","calendar");  
	var svg = d3.select(container).selectAll("svg")
        .data(yearsArray)
      .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
      .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
    
	svg.attr("class","calendar");

        svg.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

    
    var rect = svg.selectAll(".day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));})
      .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return week(d) * cellSize; })
        .attr("y", function(d) { return day(d) * cellSize; })
        .datum(format)
        .on("click", function(d){sendEvent(d)});



    rect.append("title")
        .text(function(d) { return d; });
    
    svg.selectAll(".month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);
    
      rect.filter(function(d) { return d in data; })
          .attr("class", function(d) { return "day " +  color(data[d]); })
        .select("title")
          .text(function(d) { return d + ": " + percent(data[d]); });
    
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
    }

    function sendEvent(d) {
        /*if (channel.length > 0 && config.field.length > 0) {
               var v=[config.field,d];
               SAutils.publishMDEvent(channel, v);
           }*/
    }

    d3.select(self.frameElement).style("height", "2910px");

     if (rmvpp.testEnvironmentBoolean) {
         runTestsCalendar();
    }

    //changeViewNameToVis(container, rmvpp[pluginName].pluginDescription);

	}
    return rmvpp;




}(rmvpp || {}))
