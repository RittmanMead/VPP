 rmvpp = (function(rmvpp){
    
	/* WARNING: This plugin does NOT display in the edit pane of OBIEE, neither is it printable from within OBIEE.
	This is because of the way the AMCharts libraries load.
	Furthermore, they cannot be added to this repository because the SVG images do not load properly, even when the URL resolves.
	These are all caveats to using this chart type, but it does render correctly when viewed in OBIEE as an analysis or in a dashboad.
	*/
	
    var pluginName = "multiPanel-lineBar"
    var pluginDescription = "Normalised: Line/Bar"
    var rowLimit = 50000;

    // Do not modify these 3 lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;

    rmvpp[pluginName].testData = [
		['1/1/2015', '25', '35', '40', '70', '20', '18', '35', '25', '1', 'Buy'],
		['2/1/2015', '40', '70', '25', '35', '20', '18', '35', '25', '', ''],
		['3/1/2015', '20', '18', '25', '35', '35', '25', '15', '31', '2', 'Sell'],
		['4/1/2015', '35', '25', '40', '70', '50', '45', '15', '31', '', ''],
		['5/1/2015', '50', '45', '50', '45', '25', '35', '20', '18', '3', 'Do the funky chicken dance'],
		['6/1/2015', '15', '31', '50', '45', '35', '25', '40', '70', '4', 'Strong Buy'],
	];
                 
    rmvpp[pluginName].columnMappingParameters = [
		{
			targetProperty:"date",
			formLabel:"Date"
		},
		{
			targetProperty:"lineVal1",
			formLabel:"Line Value (1)",
			measure: true
		},
		{
			targetProperty:"barVal1",
			formLabel:"Bar Value (1)",
			measure: true
		},
		{
			targetProperty:"lineVal2",
			formLabel:"Line Value (2)",
			measure: true
		},
		{
			targetProperty:"barVal2",
			formLabel:"Bar Value (2)",
			measure: true
		},
		{
			targetProperty:"lineVal3",
			formLabel:"Line Value (3)",
			measure: true
		},
		{
			targetProperty:"barVal3",
			formLabel:"Bar Value (3)",
			measure: true
		},
		{
			targetProperty:"lineVal4",
			formLabel:"Line Value (4)",
			measure: true
		},
		{
			targetProperty:"barVal4",
			formLabel:"Bar Value (4)",
			measure: true
		},
		{
			targetProperty:"eventCode",
			formLabel:"Event Code"
		},
		{
			targetProperty:"eventDesc",
			formLabel:"Event Description"
		}
	];
     
    rmvpp[pluginName].configurationParameters = [
		{
			"targetProperty":"dataset1",
			"label":"1st Dataset Name",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : 'Data Set 1'
			}
		},
		{
			"targetProperty":"dataset2",
			"label":"2nd Dataset Name",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : 'Data Set 2'
			}
		},
		{
			"targetProperty":"dataset3",
			"label":"3rd Dataset Name",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : 'Data Set 3'
			}
		},
		{
			"targetProperty":"dataset4",
			"label":"4th Dataset Name",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : 'Data Set 4'
			}
		},
		{
			"targetProperty":"w",
			"label":"Width",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 800
			}
		},
		{
			"targetProperty":"h",
			"label":"Height",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 500
			}
		}
	];
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
        console.log(data);
		// Convert dates to JS Date objects
		data.forEach(function(d) {
			d.date = rmvpp.api.toDate(d.date);
		});
		
		$(container).css({
			'width' : config.w,
			'height' : config.h
		});
		
		// Create events objects 
		var events = [];
		data.forEach(function(d) {
			if (d.eventCode != '') {
				var event = {};
				event.date = d.date;
				event.graph = 'g1';
				event.description = d.eventDesc;
				event.type = 'sign';
				event.text = d.eventCode;
				event.backgroundColor = '#FFF';
				events.push(event);
			}
		});
		
		var dataSets = [];
		// Loop over configuration triplets
		for (var i=1; i<((Object.keys(columnNames).length-1)/2 + 1); i++) {
			if (columnNames['lineVal' + i]) {
				var dataSet = {}, dataProvider = [];
				dataSet.title = config['dataset' + i];
				dataSet.fieldMappings = [ {
					fromField: "lineVal",
					toField: "lineVal"
				}, {
					fromField: "barVal",
					toField: "barVal"
				} ];
				dataSet.categoryField = 'date';
				
				// Create data provider object
				data.forEach(function(d) {
					var row = {};
					row.date = d.date;
					row.lineVal = d['lineVal' + i];
					row.barVal = d['barVal' + i];
					dataProvider.push(row);
				});
				dataSet.dataProvider = dataProvider;
				dataSet.stockEvents = events;
				dataSets.push(dataSet);
			}
			
		}
		
		
		var chart = AmCharts.makeChart( $(container).attr('id'), {
		  type: "stock",
		  "theme": "light",  

		  dataSets: dataSets,

		  panels: [ {

			  showCategoryAxis: false,
			  title: '',
			  percentHeight: 70,

			  stockGraphs: [ {
				id: "g1",

				valueField: "lineVal",
				comparable: true,
				compareField: "lineVal",
				balloonText: "[[title]]:<b>[[value]]</b>",
				compareGraphBalloonText: "[[title]]:<b>[[value]]</b>"
			  } ],

			  stockLegend: {
				periodValueTextComparing: "[[percents.value.close]]%",
				periodValueTextRegular: "[[value.close]]"
			  }
			},

			{
			  title: '',
			  percentHeight: 30,
			  stockGraphs: [ {
				valueField: "barVal",
				type: "column",
				showBalloon: false,
				fillAlphas: 1
			  } ],


			  stockLegend: {
				periodValueTextRegular: "[[value.close]]"
			  }
			}
		  ],

		  chartScrollbarSettings: {
			graph: "g1"
		  },

		  chartCursorSettings: {
			valueBalloonsEnabled: true,
			fullWidth: true,
			cursorAlpha: 0.1,
			valueLineBalloonEnabled: true,
			valueLineEnabled: true,
			valueLineAlpha: 0.5
		  },

		  periodSelector: {
			position: "left",
			periods: [ {
			  period: "MM",
			  selected: true,
			  count: 1,
			  label: "1 Month"
			}, {
			  period: "YYYY",
			  count: 1,
			  label: "1 Year"
			}, {
			  period: "YTD",
			  label: "YTD"
			}, {
			  period: "MAX",
			  label: "Max"
			} ]
		  },

		  dataSetSelector: {
			position: "left"
		  }
		} );
	}
   
    return rmvpp;

}(rmvpp || {}))