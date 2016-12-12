 rmvpp = (function(rmvpp){
    
    var pluginName = "rmvpp-pie"
    var pluginDescription = "Pie Chart"
    var rowLimit = 50000;

    // Do not modify these 3 lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;

    rmvpp[pluginName].testData = [
                    [ "Category 1", "1,300", "2,100", "2,600", "1,900"],
                    [ "Category 2", "3000", "2,100", "2,600", "1,900"],
                    [ "Category 3", "900", "2,100", "2,600", "1,900"],
                    [ "Category 4", "700", "2,100", "2,600", "1,900"],
                    [ "Category 5", "6500", "2,100", "2,600", "1,900"],
                    [ "Category 6", "4000", "2,100", "2,600", "1,900"]
     ]
                 
    rmvpp[pluginName].columnMappingParameters = [
        {
            targetProperty:"x", 
            formLabel:"Category"                          
        },
        {
            targetProperty:"y", 
            formLabel:"Measure"                          
        },
    ]
     
    rmvpp[pluginName].configurationParameters = [
        {
            "targetProperty":"width",
            "label":"Width",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": 800
            }
        },
        {
            "targetProperty":"height",
            "label":"Height",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": 600
            }
        },
        {
            "targetProperty":"pie_padding",
            "label":"Pie Padding",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": 100
            }
        },
        {
            "targetProperty":"inner_radius",
            "label":"Inner Radius",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": 0
            }
        },
        {
            "targetProperty": "legend_vpos",
            "label": "Legend Vertical Position",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": false,
                "values": [
                    "top",
                    "middle",
                    "bottom"
                ],
                "defaultSelection": 1
            }
        },
        {
            "targetProperty": "legend_hpos",
            "label": "Legend Horizontal Position",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": false,
                "values": [
                    "left",
                    "center",
                    "right"
                ],
                "defaultSelection": 3
            }
        },
        {
            "targetProperty": "legend_direction",
            "label": "Legend Direction",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": false,
                "values": [
                    "vertical",
                    "horizontal"              
                ],
                "defaultSelection": 1
            }
        },
 
    ]
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {

        var cData = []
        
        var tData = [{x: 'Apple', y: 40 },{x: 'Samsung', y:  25 },{x: 'LG', y:  7 },{x: 'Motorola', y:  6 }, { x: 'HTC', y: 5 }];
        
        for ( i in data)    {
            cData.push({"x":data[i].x,"y":parseFloat(data[i].y.replace(/,/g,""))})
        }
        console.log(config.legend_direction)
        
        new Contour({
                el: container,
                pie: { 
                    piePadding: +config.pie_padding,
                    innerRadius: +config.inner_radius
                },
                chart: { width:config.width, height:config.height, padding: {top:0,bottom:0,right:0,left:0} },
                legend: {
                    hAlign: config.legend_hpos,
                    vAlign: config.legend_vpos,
                    direction: config.legend_direction
                },
                tooltip: {
                    formatter: function (d) {
                        return d.data.x + ': ' + d.data.y;
                    }
                }
            })
            .pie(cData)
            .legend(_.map(_.pluck(cData, 'x'), function (x) { return { name: x, data: [] }; }))
            .tooltip()
            .render();  
   
        $(container).css("width", +config.width)
        d3.selectAll('.series').classed('palette-1', true);
    
 }
    return rmvpp;

}(rmvpp || {}))