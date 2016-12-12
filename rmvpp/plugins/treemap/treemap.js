 rmvpp = (function(rmvpp){
    
    var pluginName = "rmvpp-treemap"
    var pluginDescription = "Treemap"
    
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = 1000;

    rmvpp[pluginName].testData = [
    ["brianhall", "brianhall", "4,0"],
    ["charleselliot", "charleselliot", 4],
    ["dadelgado", "dadelgado", 4],
    ["danieladams", "danieladams", 4],
    ["jasonfbaer", "jasonfbaer", 4]
    ]
                 
    rmvpp[pluginName].columnMappingParameters = [
    {
               targetProperty:"name",
               formLabel:"Name"
          },
          {
               targetProperty:"grouping",
               formLabel:"Grouping"
          },
          {
               targetProperty:"measure",
               formLabel:"Measure",
			   measure: true
          }
    ]
     
    rmvpp[pluginName].configurationParameters = [
              {
               "targetProperty":"width",
               "label":"Width",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"500"
                }
          },
          {
               "targetProperty":"height",
               "label":"Height",
               "inputType":"textbox",
               "inputOptions": {
                    "defaultValue":"500"
                }
          },
          {
               "targetProperty":"showValues",
               "label":"Show Values",
               "inputType":"checkbox",
               "inputOptions": {
                    "checked":true
                }
          }
    ]
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
     var canvasWidth = config.width;
    canvasHeight = config.height;
    showValues = config.showValues;


     var renderTreemap = function () {
    // Outer Container (Tree)
    var input = {};
    input.name = "TreeMap";
    input.children = [];

    //Collect parameters from first element
    var treeProps = document.getElementById(container);


    // Populate collection of data objects with parameters
    for (var i = 0; i < data.length; i++) {
          var box = {};
          var found = false;

          box.name = (showValues == true) ? data[i]["name"] +
                                          "<br> " +
                               data[i]["measure"] : data[i]["name"];
          box.size = +data[i]["measure"];
          curGroup = data[i]["grouping"];

          // Add individual items to groups
         for (var j = 0; j < input.children.length; j++) {
            if (input.children[j].name === curGroup) {
                input.children[j].children.push(box);
                found = true;
            }
          }

          if (!found) {
            var grouping = {};
            grouping.name = curGroup;
            grouping.children = [];
            grouping.children.push(box);
            input.children.push(grouping);
          }
    }

    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    width = canvasWidth - margin.left - margin.right,
    height = canvasHeight - margin.top - margin.bottom;

    // Begin D3 visualization
     var color = d3.scale.category20c();

     var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function (d) {
        return d.size;
    });

    var div = d3.select(container).append("div")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) + "px")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px");

    var node = div.datum(input).selectAll(".treeMapNode")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "treeMapNode")
        .call(position)
        .style("background", function (d) {
        return d.children ? color(d.name) : null;
    })
        .html(function (d) {
        return d.children ? null : d.name;
    });

    function position() {
        this.style("left", function (d) {
            return d.x + "px";
        })
            .style("top", function (d) {
            return d.y + "px";
        })
            .style("width", function (d) {
            return Math.max(0, d.dx - 1) + "px";
        })
            .style("height", function (d) {
            return Math.max(0, d.dy - 1) + "px";
        });
    }
    //End D3 visualization
 }


  // Invoke visualization code
    renderTreemap();

    if (rmvpp.testEnvironmentBoolean) {
         runTestsTreemap();
    }
    rmvpp.changeViewNameToVis(container, rmvpp[pluginName].pluginDescription);

    }
    return rmvpp;

}(rmvpp || {}))