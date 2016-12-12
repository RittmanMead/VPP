rmvpp = (function(rmvpp) {

    var pluginName = "rmvpp-pivottable"
    var pluginDescription = "Pivot Table"
    var rowLimit = 5000;


    // Do not modify these lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;

    rmvpp[pluginName].testData = [['2008','BizTech','658691.919999999','298'],
		['2008','FunPod','542613.29','246'],
		['2008','HomeView','298694.79','129'],
		['2009','BizTech','821826','290'],
		['2009','FunPod','556665.6','210'],
		['2009','HomeView','321508.4','120'],
		['2010','BizTech','1019482.08','302'],
		['2010','FunPod','400721.11','262'],
		['2010','HomeView','379796.81','143']];
		
    rmvpp[pluginName].columnMappingParameters = []

    rmvpp[pluginName].configurationParameters = [
        {
            "targetProperty": "defaultrows",
            "label": "Default Rows",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": true,
                "values": function() {
                    return rmvpp.getColumnNames()
                },
                "defaultSelection": [1]
            }
        },
        {
            "targetProperty": "defaultcols",
            "label": "Default Columns",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": true,
                "values": function() {
                    return rmvpp.getColumnNames()
                },
                "defaultSelection": [2]
            }
        },
		{
            "targetProperty": "vals",
            "label": "Values",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": true,
                "values": function() {
                    return rmvpp.getColumnNames()
                },
                "defaultSelection": [3]
            }
        },
		{
            "targetProperty": "hideVals",
            "label": "Hide Values",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": true,
                "values": function() {
                    return rmvpp.getColumnNames()
                },
                "defaultSelection": [0]
            }
        },
		{
            "targetProperty": "valueCol",
            "label": "Values as Columns",
            "inputType": "checkbox",
            "inputOptions": {
                "defaultValue": true
            }
        },
        {
            "targetProperty": "defaultaggregator",
            "label": "Default Aggregator",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": false,
                "values": ["Count",
                    "Count Unique Values",
                    "List Unique Values",
                    "Sum",
                    "Integer Sum",
                    "Average",
                    "Minimum",
                    "Maximum",
                    "Sum over Sum",
                    "80% Upper Bound",
                    "80% Lower Bound",
                    "Sum as Fraction of Total",
                    "Sum as Fraction of Rows",
                    "Sum as Fraction of Columnss",
                    "Count as Fraction of Total",
                    "Count as Fraction of Rows",
                    "Count as Fraction of Columns"
                ],
                "defaultSelection": 4
            }
        },
        {
            "targetProperty": "renderername",
            "label": "Default Renderer",
            "inputType": "dropdown",
            "inputOptions": {
                "multiSelect": false,
                "values": ["Table", "Table Barchart", "Heatmap", "Row Heatmap", "Col Heatmap", ],
                "defaultSelection": 1
            }
        },
        {
            "targetProperty": "hide_controls",
            "label": "Hide Controls",
            "inputType": "checkbox",
            "inputOptions": {
                "checked": false
            }
        },
    ];

    rmvpp[pluginName].render = function(data, columnNames, config, container) {
		
		$(container).append('<div class="pivot-table"></div>');
		var pivotTable = $(container).find('.pivot-table');
		
        pivotData = []
        for (row in data) {
            var rowObj = {}
            for (col in data[row]) {
				rowObj[columnNames[col]] = data[row][col];
            }
			pivotData.push(rowObj);
        }
		
        pivotTable.pivotUI(pivotData,
                {
                    unusedAttrsVertical: true,
                    rows: config.defaultrows,
                    cols: config.defaultcols,
                    aggregatorName: config.defaultaggregator,
                    vals: config.vals,
					valueCol: config.valueCol,
					hideVals: config.hideVals,
                    rendererName: config.renderername
                });
                
       if ( config.hide_controls)   {
           $(container).find('.pvtAxisContainer').hide()
           $(container).find('.pvtVals').hide()
           $(container).find('.pvtRenderer').hide()
       }

    }

    return rmvpp;

}(rmvpp || {}))