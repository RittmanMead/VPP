 rmvpp = (function(rmvpp){


    /**
     *  Plugin Configuration
     */
    var pluginName = "rmvpp-bullet"
    var pluginDescription = "Bullets"
    var rowLimit = 50;


    // Do not modify these lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;


    // Define some test data for developing in the offline test bench.
    rmvpp[pluginName].testData = [
                                        ["Red Cars","car","2,000","8,000","2,000","8,900","5,000"],
                                        ["Blue Cars","car","60","80","90","88","77"],
                                        ["Brown Cars","car","60","80","999","88","100"],
                                        ["Yellow Cars","car","60","80","100","88","77"],
                                        ["Black Cars","car","20","80","71","88","77"],
                                        ["Green Cars","car","60","80","100","88","110"],
                                        ["White Cars","car","60","80","100","88","110"],
                                        ["Orange Cars","car","100","80","71","88","77"],
                                        ["Pink Cars","car","60","80","100","88","110"]
                                       ]

    rmvpp[pluginName].columnMappingParameters = [
            {   targetProperty:         "title",
                formLabel:              "Title"
            },
            {
                targetProperty:         "subtitle",
                formLabel:              "Subtitle"
            },
            {
                targetProperty:         "range1",
                formLabel:              "Range 1"
            },
            {
                targetProperty:         "range2",
                formLabel:              "Range 2"
            },
            {
                targetProperty:         "range3",
                formLabel:              "Range 3"
            },
            {
                targetProperty:         "measure",
                formLabel:              "Measure"
            },
            {
                targetProperty:         "marker",
                formLabel:              "Marker"
            }

    ]

    rmvpp[pluginName].configurationParameters = [
            {
                "targetProperty":"colour0",
                "label":"Largest Range Color",
                "inputType":"colourpicker",
                "inputOptions": {
                    "defaultValue": "#eeeeee"
                }
            },
            {
                "targetProperty":"colour1",
                "label":"Medium Range Color",
                "inputType":"colourpicker",
                "inputOptions": {
                    "defaultValue": "#dddddd"
                }
            },
            {
                "targetProperty":"colour2",
                "label":"Smallest Range Color",
                "inputType":"colourpicker",
                "inputOptions": {
                    "defaultValue": "#cccccc"
                }
            },
            {
                "targetProperty":"colour3",
                "label":"Measure Color",
                "inputType":"colourpicker",
                "inputOptions": {
                    "defaultValue": "#b0c4de"
                }
            },
            {
                "targetProperty":"colour4",
                "label":"Marker Color",
                "inputType":"colourpicker",
                "inputOptions": {
                    "defaultValue": "#000000"
                }
            }
    ]



    rmvpp[pluginName].render = function(data, columnNames, config, container)   {

        // Prepare Data
        var bulletData = []

        for ( row in data )   {
            bulletData.push(
                        {
                            title: data[row].title,
                            subtitle: data[row].subtitle,
                            ranges: [+data[row].range1.replace(/,/g,""), +data[row].range2.replace(/,/g,""), +data[row].range3.replace(/,/g,"")],
                            measures: [+data[row].measure.replace(/,/g,"")],
                            markers: [+data[row].marker.replace(/,/g,"")]
                        }
            )
        }


        $(pluginName + ':first').wrap('<div id="wrap"></div>')
        $('#wrap').width(900)


        // Render Visual
        var margin = {top: 5, right: 40, bottom: 20, left: 200},
            width = 500 - margin.left - margin.right,
            height = 50 - margin.top - margin.bottom;

        var chart = d3.bullet()
            .width(width)
            .height(height)
            .config(config);


        var svg = d3.select(container).selectAll("svg")
            //.attr("id",visualisationContainerID)
            .data(bulletData)
            .enter()
            .append("svg")
            .attr("class", "bullet")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(chart);

        var title = svg.append("g")
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + height / 2 + ")");

        title.append("text")
            .attr("class", "title")
            .text(function(d) { return d.title; });

        title.append("text")
            .attr("class", "subtitle")
            .attr("dy", "1em")
            .text(function(d) { return d.subtitle; });

    }

    // Do not modify this line
    return rmvpp;


}(rmvpp || {}))