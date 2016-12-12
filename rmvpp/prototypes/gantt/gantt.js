 rmvpp = (function(rmvpp){

    var pluginName = "rmvpp-gantt"
    var pluginDescription = "Gantt Chart"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = 50;

    rmvpp[pluginName].testData = [
        ["Dec 01 01:36:45 2012","Dec 05 08:36:45 2012","Job 5","RUNN"],
        ["Dec 07 01:36:45 2012","Dec 07 06:36:45 2012","Job 6","FAIL"],
        ["Dec 10 01:36:45 2012","Dec 18 01:36:45 2012","Job 1","KILL"],
        ["Dec 02 01:36:45 2012","Dec 10 23:36:45 2012","Job 3","RUNN"],
        ["Dec 08 01:36:45 2012","Dec 09 09:36:45 2012","Job 1","FAIL"],
        ["Dec 07 01:36:45 2012","Dec 14 12:36:45 2012","Job 5","Succ"],
        ["Dec 01 01:36:45 2012","Dec 04 14:36:45 2012","Job 4","KILL"],
        ["Dec 05 01:36:45 2012","Dec 07 17:36:45 2012","Job 2","Some"],
        ["Dec 15 01:36:45 2012","Dec 22 02:36:45 2012","Job 2","Some"],
        ["Dec 15 01:36:45 2012","Dec 22 02:36:45 2012","Job 7","Some2"],
        ["Dec 15 01:36:45 2012","Dec 22 02:36:45 2012","Job 8","Some3"]


	]

    rmvpp[pluginName].columnMappingParameters = [
     {
               targetProperty:"startDate",
               formLabel:"Start Date"
          },
           {
               targetProperty:"endDate",
               formLabel:"Ending Date"
          },
           {
               targetProperty:"taskName",
               formLabel:"Resource"
          },
           {
               targetProperty:"status",
               formLabel:"Status"
          },
      ]

    rmvpp[pluginName].configurationParameters = [
              {
               "targetProperty":"baseColor",
               "label":"Color-brewer Format",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"YlGn"
                }
          },
                    {
               "targetProperty":"tickFormat",
               "label":"Tick Format",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"%a %H:%M"
                }
          },
          {
               "targetProperty":"timeFormat",
               "label":"Date Format",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"%b %d %X %Y"
                }
          },
           {
               "targetProperty":"width",
               "label":"Width",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"800"
                }
          },
           {
               "targetProperty":"height",
               "label":"Height",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"400"
                }
          },


      ]

    rmvpp[pluginName].render = function(tasks, columnNames, config, container)   {
        //var taskStatus = {};

        function convertSetToArray(set){
            var returnArray = [];
            for (var element in set) {
                returnArray.push(element);
            }
            return returnArray;
        }

        function colorsEqual(color1, color2) {
            for (var element in color1){
                if (color1[element] != color2[element]){
                    return false;
                }
            }
            return true;
        }

        var uniqueStatuses = new Set();
        var taskNames = new Set();
        var d3DateFormatter = d3.time.format(config.timeFormat);

        //prep values to convert to date objects -- also prep taskNames -- prep taskStatuses also
        for (var i = 0; i < tasks.length; i++) {
            tasks[i].endDate = d3DateFormatter.parse(tasks[i].endDate);
            tasks[i].startDate = d3DateFormatter.parse(tasks[i].startDate);
            taskNames.add(tasks[i].taskName);

            //get rid of spaces in statuses
            tasks[i].status = tasks[i].status.replace(" ", "");

            uniqueStatuses.add(tasks[i].status);
        }
        uniqueStatuses = convertSetToArray(uniqueStatuses);
        taskNames = convertSetToArray(taskNames);

        tasks.sort(function(a, b) {
            return a.endDate - b.endDate;
        });
        var maxDate = tasks[tasks.length - 1].endDate;
        tasks.sort(function(a, b) {
            return a.startDate - b.startDate;
        });
        var minDate = tasks[0].startDate;

        var format = config.tickFormat;

        var gantt = d3.gantt(container, removeCommasFromNumber(config.width), removeCommasFromNumber(config.height)).taskTypes(taskNames).taskStatus(uniqueStatuses).tickFormat(format);
        //gantt.timeDomain([new Date("Sun Dec 09 04:54:19 EST 2012"),new Date("Sun Jan 09 04:54:19 EST 2013")]);
        //gantt.timeDomainMode("fixed");
        gantt(tasks);

        var legendMap = [];
        //do colors -- make elements progressively lighter or darker
        var colors = colorbrewer[config.baseColor][uniqueStatuses.length];
        console.log(config.baseColor);
        console.log(uniqueStatuses.length);
        console.log(colorbrewer[config.baseColor]);
        console.log(colorbrewer[config.baseColor][uniqueStatuses.length]);


        for (var e in uniqueStatuses){
             legendMap.push({"name":uniqueStatuses[e], "color":colors[e]});
            $("."+uniqueStatuses[e]).css("fill", colors[e]);
        }

        console.log(legendMap);

        //do legend
        var elements = d3.select(container).select("svg").append("g").selectAll("rect").data(legendMap).enter();
        elements.append("rect").attr("x", 20).attr("y", function(d, i) {return 20+20*i;}).attr("width",20).attr("height",20).style("fill", function(d){return d.color});
        elements.append("text").attr("x", 45).attr("y" , function(d, i) {return 20+20*(i+1)-2;}).text(function(d){return d.name});


         if (rmvpp.testEnvironmentBoolean) {
             runTestsGantt();
        }
        changeViewNameToVis(container, rmvpp[pluginName].pluginDescription);


}
return rmvpp;

}(rmvpp || {}))
