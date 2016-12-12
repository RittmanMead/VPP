 rmvpp = (function(rmvpp){

    var pluginName = "rmvpp-indicators"
    var pluginDescription = "Indicators"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = 30;

    rmvpp[pluginName].testData = [
        ["90", "50"], ["75","20"], ["180,000", "-10"]

       /* ["Alex", "19555"],
        ["Joe", "31242"],
            ["Joe", "31242"]*/
	]

    rmvpp[pluginName].columnMappingParameters = [
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
               "label":"Visualization Size",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"1.5"
                }
          },
                    {
               "targetProperty":"padding",
               "label":"Padding",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"20"
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
                    "defaultValue":"100"
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
                    "defaultValue":"0"
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
               "targetProperty":"arrowColor",
               "label":"Arrow Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#D9D9D9"
                }
          },
          {
               "targetProperty":"innerCircleColor",
               "label":"Inner Circle Color",
               "inputType":"colourpicker",
               "inputOptions": {
                    "defaultValue":"#F2F2F2"
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
               "targetProperty":"upperThreshold",
               "label":"Upper Threshold",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":".85"
                }
          },
          {
               "targetProperty":"lowerThreshold",
               "label":"Lower Threshold",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":".60"
                }
          }
      ]

    rmvpp[pluginName].render = function(data, columnNames, config, container)   {

    //handle commas in numbers
    config.greenScore = config.greenScore;
    config.yellowScore = config.yellowScore;
    config.upperThreshold = config.upperThreshold;
    config.lowerThreshold = config.lowerThreshold;


    config.duration = 1500;
    var bump = config.padding;
    var highGrouping = config.upperThreshold;
    var lowGrouping = config.lowerThreshold;

    //offset for negative values. Offsets all values to make positive, and then behave like normal
    var offset = 0;
    if (config.greenScore < 0 || config.yellowScore < 0 || config.yellowScore > 0){
        var offset = config.greenScore < 0 ? config.greenScore : config.yellowScore;
        config.greenScore = config.greenScore - offset;
        config.yellowScore = config.yellowScore - offset;
    }

    //calculate the appropriate percentage ranges -- gets appropriate values for green/yellow/red based on percentage over total values
    var range = (config.greenScore-config.yellowScore);
    config.greenScore = (range * highGrouping - config.yellowScore) / range; //set the greenScore relative to the upper and lower limits
    config.yellowScore = (range * lowGrouping - config.yellowScore) / range; //set the yellowScore relative to upper and lower limits

        var fontBoxOpacity = .5;
        var sizeConstant = 70;

        var defaultFontSize = 10;
        var defaultCircleFontSize = 12;

        var titleFontSize = (defaultFontSize*config.visHeight)-(config.visHeight*.25);
        var circleFontSize = (12*config.visHeight)-(config.visHeight*.25);

        //make sure everything referencing bardata below is changed
        var bardata = [];
        //transform data into bardata -- need to do this because Pernod Ricard has multiple visualizations for same row of data
        for ( var i = 0; i < data.length; i++) {
            bardata.push({"name":config.name1, "value":(+data[i].value1-offset)/range});
            bardata.push({"name":config.name2, "value":(+data[i].value2-offset)/range});
        }


    var margin = {top: titleFontSize, right: 0, bottom: 8, left: 0},                             // Establish Margin
             height = (config.visHeight*sizeConstant)- margin.top - margin.bottom,
             width = height*(bardata.length) - margin.left - margin.right+(data.length*bump*1.7),                                                // Determine width of vis
         yc = height/2,
         r=height/2*.95;


        // create svg for chart in div and alter it to adjust for margin.  [0,0] is now in top left corner less margin top and left
    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", config.backColor)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // create outer circle
     svg.selectAll(".circle")
          .data(bardata)
          .enter()
          .append("circle")
          .attr("cx", function(d,i) {return (i+1)*height - yc+(i*bump);} )
          .attr("cy", yc)
          .attr("r",0)
          .transition()
          .duration(config.duration)
          .attr("r",r)
     // determine RYG for bar fill
          .style("fill", function(d) {return d.value >= +config.greenScore ? config.green : d.value >= +config.yellowScore ? config.yellow : config.red; })
    ;

    // create inner circle
      svg.selectAll(".circle")
          .data(bardata)
          .enter()
          .append("circle")
          .attr("class", "inner")
          .attr("cx", function(d,i) {return (i+1)*height- height/2+(i*bump);} )
          .attr("cy", yc)
          .attr("r",r*.7)
          .style("fill", config.innerCircleColor)
    ;

    // Create arrow triangle
    svg.selectAll(".path")
        .append("g")
	.data(bardata)
	.enter()
	.append("path")
        .each( function(d,i) {
              d.width = (i+1)*height - yc;
         })
        .attr("d", d3.svg.symbol().type( function(d) {return d.value<config.greenScore ? "triangle-down":"triangle-up" ;}).size(.5*height*height/4))
        .style("fill",config.arrowColor)
        .attr("transform", function(d,i) {return d.value < config.greenScore ? "translate(" + (d.width+bump*i) + "," + 0 + ")":"translate(" + (d.width+bump*i) + "," + height+ ")"; } )
        .transition()
        .duration(config.duration)
        .attr("transform", function(d,i) {return d.value < config.greenScore ? "translate(" + (d.width+bump*i) + "," + (yc + height/10) + ")":"translate(" + (d.width+bump*i) + "," + (yc - height/10) + ")"; } );


    // create inner text value
    svg.selectAll(".text")                                                                                                  // In Circle Labels
         .append("g")
         .data(bardata)
         .enter()
         .append("text")
         .attr("class","cirVal")
         .text(function(g){return d3.format("%")(g.value);})                                              //formats number to have %
    // Justify text
        .attr("x",   function(d,i) {return (i+1)*height - yc+(i*bump);} )
        .attr("y",  yc)
    // Justify text center vertically
        .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
        .style("font-size",circleFontSize+"px")
        .style("font-family", config.fontFam)
        .style("fill", config.fontColor);

    // create text labels
    svg.selectAll(".text")                                                                                                  // Above circle Labels
         .append("g")
         .data(bardata)
         .enter()
         .append("text")
         .attr("class","label")
         .text(function(g){return g.name;})
    // Justify text
        .attr("x",   function(d,i) {return (i+1)*height - yc+(i*bump);} )
        .attr("y", 0)
    .attr("text-anchor", "middle")
        .style("font-size",titleFontSize+"px")
        .style("font-family", config.fontFam)
        .style("fill", config.fontColor);

    if (rmvpp.testEnvironmentBoolean) {
         runTestsIndicators();
    }
    rmvpp.changeViewNameToVis(container, rmvpp[pluginName].pluginDescription);

    }
    return rmvpp;

}(rmvpp || {}))
