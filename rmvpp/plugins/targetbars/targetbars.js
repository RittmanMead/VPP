 rmvpp = (function(rmvpp){

    var pluginName = "rmvpp-targetbars"
    var pluginDescription = "Target Bars"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = 30;

    rmvpp[pluginName].testData = [
        ["600,0000", "6400000", "2000000"]
               // ["CY", 6400000, "#5C7287",6000000, 6400000],
               // ["PY", 2000000, "#DEDEDE", 6000000,2000000]
	]

    rmvpp[pluginName].columnMappingParameters = [
    {
               targetProperty:"goal",
               formLabel:"Goal",
			   measure: true
          },
                     {
               targetProperty:"value1",
               formLabel:"Value 1",
			   measure: true
          },
           {
               targetProperty:"value2",
               formLabel:"Value 2",
			   measure: true
          },

      ]

    rmvpp[pluginName].configurationParameters = [
    {
               "targetProperty":"name1",
               "label":"Name 1",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"Name 1"
                }
          },
          {
               "targetProperty":"name2",
               "label":"Name 2",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"Name 2"
                }
          },
              {
               "targetProperty":"visHeight",
               "label":"Visualization Height",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"70"
                }
          },
                    {
               "targetProperty":"visWidth",
               "label":"Visualization Width",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"300"
                }
          },
               {
               "targetProperty":"duration",
               "label":"duration",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"1500"
                }
          },
          {
               "targetProperty":"cyBarColor",
               "label":"Value 1 Bar Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#5C7287"
                }
          },
          {
               "targetProperty":"pyBarColor",
               "label":"Value 2 Bar Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#DEDEDE"
                }
          },
                    {
               "targetProperty":"kpiColor",
               "label":"Goal Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#ff9933"
                }
          },
                    {
               "targetProperty":"green",
               "label":"Positive Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#36B236"
                }
          },
          {
               "targetProperty":"greenScore",
               "label":"Upper Limit",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"1"
                }
          },
                     {
               "targetProperty":"yellow",
               "label":"Neutral Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#FFD633"
                }
          },

          {
               "targetProperty":"yellowScore",
               "label":"Lower Limit",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":".7"
                }
          },
          {
               "targetProperty":"red",
               "label":"Negative Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#D63333"
                }
          },
          {
               "targetProperty":"backColor",
               "label":"Background Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#F2F2F2"
                }
          },
           {
               "targetProperty":"fontColor",
               "label":"Font Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#5C7287"
                }
          },
          {
               "targetProperty":"fontFam",
               "label":"Font Family",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"Arial"
                }
          }


      ]


    rmvpp[pluginName].render = function(data, columnNames, config, container)   {

            //set up number variables correctly
            config.greenScore = +config.greenScore;
            config.yellowScore = +config.yellowScore;

            var bardata = [];
            //transform data into bardata -- need to do this because Pernod Ricard has multiple visualizations for same row of data
            for (var i = 0; i < data.length; i++) {
                bardata.push({"KPI":+data[i].goal, "name":config.name1, "value":+data[i].value1, "color":config.cyBarColor});
                bardata.push({"KPI":+data[i].goal, "name":config.name2, "value":+data[i].value2, "color":config.pyBarColor});
            }

            //bump is to push the bars to the right, so they don't overlap the names
            //var bump = 20;
            var nameLengths = config.name1.length >= config.name2.length? config.name1.length : config.name2.length;


            var sizeConstant = 70;
            var defaultFontSize = (10*config.visHeight/sizeConstant);
            var bump = defaultFontSize /2.55 * nameLengths;
            var topMargins = config.visHeight/3;
            var bottomMargins = config.visHeight/4;
            //var defaultFontSize = 10;
            var sizeFactor = bardata.length;
            config["heightToWidth"] = 3;
             var margin = {top: topMargins, right: 20+bump, bottom: bottomMargins, left: 25},                             // Establish Margins
             width = (+config.visWidth) - margin.left - margin.right+bump,                                                // Determine width of vis
             height = +config.visHeight- margin.top - margin.bottom,
             pad = .2,                           /*        this is the percent of whitespace in between bars;  .2 = 20%        */
             tix = 3,
             tixSizeInner = 5,                /*        tick size of inner ticks                                                                       */
             tixSizeOuter = 0,               /*        tick size of ticks on ouside extremes                                                */
             tixNumFormat = "1s";  /*        this will change the number of values in the value axis                   */

            var y = d3.scale.ordinal()
            .rangeBands([0, height], pad);                                        // Splits bar into bar and whitespace padding

            var x = d3.scale.linear()
            .range([0, width]);

            // Find max value
            var valMax = d3.max(bardata,
                                   function(d){
                                       return Math.abs(d.value);
                                   });

            // Make kpi a variable
            var kpi = d3.max(bardata,
                                  function(d){
                                       return d.KPI;
                                   });
            // Make cy a variable
            var cy = d3.max(bardata,
                                  function(d){
                                       return d.value;
                                   });

            // establish domain for chart
            var xdom = Math.max(kpi,valMax);

            // create svg for chart in div and alter it to adjust for margin.  [0,0] is now in top left corner less margin top and left
            var svg = d3.select(container).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height*sizeFactor + margin.top + margin.bottom)
                .style("background-color", config.backColor)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              x.domain([0, xdom]);
              y.domain(bardata.map(function(d) { return d; }));

              // Define x axis
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(d3.format(tixNumFormat))                                          // Abbreviates tick number
                .tickSize(tixSizeInner,tixSizeOuter)
                .ticks(tix)                                                                          // Number of ticks
                ;
            // Add axis to svg
               svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate("+(defaultFontSize+bump)+"," + height*sizeFactor + ")")
                  .call(xAxis)
                  .style("fill",config.fontColor)
                  .style("font-size",defaultFontSize+"px")
                  .style("font-family", config.fontFam) ;

            // Create Bars for Barchart
              svg.selectAll(".bar")
                  .data(bardata)
                  .enter()
                  .append("rect")
                  .attr("class", function(d) { return d.value/d.kpi >= +config.greenScore? "green" : d.value/d.kpi >=+config.yellowScore ? "yellow" : "red"; })      //naming bar red yellow green
                  .attr("x", function(d) {return x(Math.min(0, +d.value))+defaultFontSize+bump; })                                                                   // bars start at 0 if positive or the value if negative
                   .attr("y", function(d, i) { return (i+1)*y.rangeBand()/(1-pad)-y.rangeBand();})
                  .style("fill", function(d) { return d.color; })
                  .attr("height", y.rangeBand())
                  .transition()
                  .duration(function(d,i){return (1-i) * +config.duration;})
                  .ease("cubic-in-out")
                  .attr("width", function(d) { return Math.abs(x(+d.value) - x(0)); })
            ;

            //  Make KPI (target) line
             svg.append("g")
              .append("line")
              .data(bardata)
              .attr("class", "KPI")                                                                 // naming the line KPI
              .attr("x1", function(d){return x(+d.KPI)+(defaultFontSize+bump);})                               // x1 = x location of KPI value
              .attr("x2", function(d){return x(+d.KPI)+(defaultFontSize+bump);})                               // x2 = x location of KPI value
              .attr("y1", -y.rangeBand()+.25*y.rangeBand())                                        // y1 = - bar thickness adjusted for padding (0 is at the top)
              .attr("y2", height-y.rangeBand()/(1-pad) )                                                  // y2 = matching bottom of lowest bar
              .attr("stroke", cy/kpi >=+config.greenScore ? config.green :
                        cy/kpi >= +config.yellowScore ? config.yellow :
                        config.red)
              .attr("stroke-width", ".2em")
              .style("font-weight","bold");

            // Create flag for flagpost
                svg.selectAll(".path")
                    .append("g")
                .data(bardata)
                .enter()
                .append("path")
                    .attr("d", d3.svg.symbol().type("triangle-up").size(.5*.5*y.rangeBand()*.5*y.rangeBand()))    /* up-triangle we will rotate later, size measured in px^2 -- .5(height*height) in an equilateral triangle  */
                    .style("fill", cy/kpi >=+config.greenScore ? config.green :
                        cy/kpi >= +config.yellowScore ? config.yellow :
                        config.red)
                    .attr("transform", "translate(" + (x(kpi) +  .5*.5*y.rangeBand()+defaultFontSize+bump) + "," + (-y.rangeBand() +.5*y.rangeBand()) + ") rotate("+   90 +  ")" );




            svg.selectAll(".text1")                                                                                                  // In Bar Labels
                 .append("g")
                 .data(bardata)
                 .enter()
                 .append("text")
                 .attr("class","textVal")
                 .text(function(g){return d3.format(",")(g.value);})                                              //formats number to have 1,000s comma separator
            // Create a variable for the height and width of the individual text boxes being created
                 .each(function(d) {
                    d.height = this.getBBox().height;
                  })
                 .each(function(d) {
                    d.width = this.getBBox().width;
                 })

            // Justify text inside right less 5px unless bar is too small, then justify text outside right
                .attr("x",  function(d) { return bump+d.width+(defaultFontSize/3*(""+d.value).length) < Math.abs(x(d.value) - x(0) -5) ? Math.abs(x(d.value) - x(0)) - 5+bump: Math.abs(x(d.value) - x(0)) + bump+d.width+(defaultFontSize/3*(""+d.value).length)+10; })
            // text starts in center of bars vertical
                .attr("y",  function(d, i) { return (i+1)*y.rangeBand()/(1-pad)-.5*y.rangeBand();})
            // Justify text center vertically
                .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            // determine font color
               .style("fill", function(d, i) {return d.width > Math.abs(x(d.value) - x(0)-5) ? config.fontColor: i == 1 ? config.fontColor :
                        config.backColor ;})
                .style("font-size",defaultFontSize+"px")
                .style("font-weight","bold")
                .style("font-family", config.fontFam);

            function type(d) {
              d.value = +d.value; // coerce to number
              return d;
            }

            svg.selectAll(".text2")                                                     //CY PY y-axis labels
                 .append("g")
                 .data(bardata)
                 .enter()
                .append("text")
                .attr("class","textlbl")
                .attr("x", -20)
                 .text(function(d){return d.name;})
            // text starts in center of bars vertical
                .attr("y",  function(d, i) { return (i+1)*y.rangeBand()/(1-pad)-.5*y.rangeBand();})
            // Justify text center vertically
                .attr("dy", "0.35em")
                 .style("fill", config.fontColor)
                .style("font-size",defaultFontSize+"px")
                .style("font-family", config.fontFam);


            svg.selectAll(".text3")                                   //KPI number label
                 .append("g")
                 .data(bardata)
                 .enter()
                .append("text")
                .attr("class","kpilbl")
                 .text("KPI - "+d3.format(",")(kpi))
                 .each(function(d) {
                    d.height3 = this.getBBox().height;
                  })
                 .each(function(d) {
                    d.width3 = this.getBBox().width;
                 })
                .attr("x",  function(d) { return Math.abs(x(kpi) - x(0))-5+bump; })
            // text starts in center of bars vertical
                .attr("y",  function(d, i) { return -.5*y.rangeBand();})
            // Justify text center vertically
                .attr("dy", "0.35em")
                 .style("fill",config.kpiColor)
            .attr("text-anchor", "end")
                .style("font-size",defaultFontSize+"px")
            //    .style("font-weight","bold")
                .style("font-family", "Arial")



           /* svg.selectAll(".text4")                                   //KPI text label
                 .append("g")
                 .data(bardata)
                 .enter()
                .append("text")
                .attr("class","kpitxt")
                 .text("KPI - ")
                 .each(function(d) {
                    d.width4 = this.getBBox().width;
                 })
                .attr("x",  function(d) { return Math.abs(x(kpi) - x(0))- d.width3 - d.width4 -5 ; })
            // text starts in center of bars vertical
                .attr("y",  function(d, i) { return -.5*y.rangeBand();})
            // Justify text center vertically
                .attr("dy", "0.35em")
                 .style("fill",config.kpiColor)
            // font size = .9 * browser setting for text size
                .style("font-size",defaultFontSize+"px")
            //    .style("font-weight","bold")
                .style("font-family", "Arial")
                 ;*/

                if (rmvpp.testEnvironmentBoolean) {
                     runTestsTargetBars();
                  }
    rmvpp.changeViewNameToVis(container, rmvpp[pluginName].pluginDescription);
    }
    return rmvpp;

}(rmvpp || {}))
