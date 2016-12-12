 rmvpp = (function(rmvpp){
	
    var pluginName = "rmvpp-hbar"

    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = 'Horizontal Bar Chart';
	
	// List additional dependencies (Assume OBIEE, jQuery, jQuery.XML2Json and d3)
	rmvpp[pluginName].dependencies = {
		'js' : [
			'/rmvpp/plugins/hbar/hbar.js'
		]
	};
	
     rmvpp[pluginName].testData = [
		['3e', '8.59487344508915'],
		['4FM', '0.26547871645063'],
		['4Music', '1.28124144610785'],
		['98FM', '0.217209858914152'],
		['Alibi', '2.18114899992961'],
		['Animal Planet', '1.75604825974354'],
		['At the Races', '1.72762301812899'],
		['BBC 1', '0.011061613185443'],
		['BBC 2', '8.07698882777068'],
		['BBC 5Live Extra', '0.075420089900747'],
		['BBC 6 Music', '0.0774312922981'],
		['BBC FOUR', '5.43628008004586'],
		['BBC News 24', '4.08475206902447'],
		['BBC Radio 1', '0.093520911476927'],
		['BBC Radio 2', '0.139778566616051'],
		['BBC Radio 3', '0.078436893496777'],
		['BBC Radio 4', '0.068380881510011'],
		['BBC Radio 4 Extra', '0.048268857536478'],
		['BBC Radio 5Live', '0.151845781000171'],
		['BBC Radio Ulster', '0.044246452741772'],
		['BBC THREE', '6.86624498456402'],
		['BBC TWO HD', '4.68811278823044'],
		['BBC World', '2.44035963194576'],
		['BBC World Svce', '0.060336071920598'],
		['BBC1 HD', '8.88146978671199'],
		['BT Sport 1', '6.84989429175476'],
		['BT Sport 1 HD', '4.04510218463707'],
		['BT Sport 2', '4.44679351656096'],
		['BT Sport 2 HD', '2.29739252995067'],
		['Bloomberg', '1.20228244162298'],
		['Boomerang', '1.65392794727644'],
		['CBBC', '1.68739881137938'],
		['CCTv', '0.067375280311334'],
		['CN+1', '1.30426475468359'],
		['CNBC Europe', '1.77186931206822'],
		['CNN', '1.77815678099931'],
		['Cartoon Network', '1.18438506727307'],
		['Cartoonito', '1.37704503821616'],
		['Cbeebies', '1.84326699717426'],
		['Challenge', '3.23200225254669'],
		['Channel 4', '8.68034954697666'],
		['Comedy', '5.96019830455638'],
		['Comedy +1', '5.3739328057279'],
		['Comedy Extra', '4.52822219764086'],
		['Crime & Investigation HD', '2.4677704752275'],
		['Cula4', '0.653640779139809'],
		['DCTV', '0.497772593344931'],
		['DMAX', '2.85389620184427'],
		['Dave', '5.78622929718532'],
		['Disc Channel +1', '3.2873103184739'],
		['Discovery', '3.38988164073892'],
		['Discovery HD', '2.86589989888777'],
		['Discovery History', '2.6646032046828'],
		['Discovery Quest', '2.62354452235066'],
		['Discovery Science', '3.19520771482113'],
		['Discovery Shed', '2.05293411660666'],
		['Discovery Turbo', '2.01713936790685'],
		['Disney Channel', '1.75183711283768'],
		['Disney Channel HD', '1.0216548702393'],
		['Disney Junior', '2.13189312109153'],
		['E!', '4.84096417042929'],
		['E4', '7.51787456130648'],
		['E4+1', '7.11262712399722'],
		['ESPN', '2.85855101034993'],
		['ESPN HD', '2.38681968598183'],
		['EWTN', '0.290618746417546'],
		['Euronews', '2.75635288557264'],
		['Euronews DEU', '0.085476101887513'],
		['Euronews ESP', '0.105588125861046'],
		['Euronews FRA', '0.202125840934002'],
		['Euronews ITA', '0.096537715072956'],
		['Euronews RUS', '0.117655340245166'],
		['Eurosport', '2.06872591750363'],
		['Eurosport 2', '1.55812435516813'],
		['Eurosport 2 HD', '1.32077856420627'],
		['Eurosport HD', '1.77367711493091'],
		['Extreme Sports', '1.8623797191165'],
		['FILMFOUR +1', '4.20588297222749'],
		['FM104', '0.219221061311505'],
		['FOX', '0.025266881435159'],
		['FOX +1', '2.25401638136146'],
		['FOX HD', '4.46052409841591'],
		['Fashion TV', '1.29071652664603'],
		['Film Four', '4.57447985277998'],
		['Food Network', '1.65521957302173'],
		['G.O.L.D.', '5.65851794495339'],
		['G.O.L.D. +1', '3.12641412668564'],
		['Galway Bay FM', '0.102571322265016'],
		['Heat', '1.30440275409008'],
		['History Channel', '2.87410776324932'],
		['History HD', '2.44143916413886'],
		['Home', '1.00751689722696'],
		['Home & Health', '2.89200513759923'],
		['ID', '1.42231486745415'],
		['ITV2', '6.68523676880223'],
		['ITV3', '3.95301831199783'],
		['ITV4', '4.98979314783343'],
		['KISS', '1.89817446781631'],
		['Kerrang!', '0.696944812919799'],
		['Lifetime', '3.13941001831849'],
		['MGM Movies', '3.38786768576422'],
		['MTV', '2.45366692477097'],
		['MTV Base', '1.60655254458552'],
		['MTV Classic', '1.45705682942749'],
		['MTV Dance', '1.51811845956246'],
		['MTV Hits', '2.04767018297433'],
		['MTV MUSIC', '2.60551270577115'],
		['MTV Rocks', '1.07068410081486'],
		['MUTV', '0.267638093822021'],
		['Magic', '2.14452656180911'],
		['More4', '7.4565328881872'],
		['More4+1', '4.43117933169099'],
		['Nat Geo Wild', '2.8656854694376'],
		['Nat Geo Wild HD', '2.49620829120324'],
		['National Geographic', '3.20363000863285'],
		['National Geographic HD', '2.62365183687226'],
		['NewsTalk 106', '0.283579538026809'],
		['Nick Junior', '2.90317066057943'],
		['Nick Replay', '2.21716884593519'],
		['Nick Toons', '2.73020725440705'],
		['Nickelodeon', '2.21835624428064'],
		['Oireachtas TV', '1.40381927335257'],
		['PPV Channel', '0.016089619178826'],
		['Pick', '4.36933720824995'],
		['QVC', '0.823279220095593'],
		['RTE 2 FM', '0.217209858914152'],
		['RTE 2XM', '0.596321510815241'],
		['RTE Gold', '0.350954818338143'],
		['RTE Lyric FM', '0.152851382198848'],
		['RTE News Now', '4.32710195790553'],
		['RTE One', '0.27754593083475'],
		['RTE One +1', '7.93821586235331'],
		['RTE One HD', '9.24449181943425'],
		['RTE Pulse', '0.272517924841366'],
		['RTE R Na G', '0.059330470721921'],
		['RTE Radio 1', '0.598332713212594'],
		['RTE Radio 1 Extra', '0.140784167814728'],
		['RTE2', '0.031173637158976'],
		['RTE2 HD', '8.90258741188419'],
		['RTEjr', '1.39074645776978'],
		['RTEjr Radio', '0.224249067304888'],
		['Racing UK', '0.180193708236354'],
		['Radio Nova', '0.17598020976841'],
		['Setanta HD', '6.62139048193983'],
		['Setanta Ireland', '3.04093802479813'],
		['Setanta Sports 1', '0.414299748003246'],
		['Setanta Sports 1 HD', '3.31469469917244'],
		['Sky 1 HD', '4.06881980078479'],
		['Sky Action', '6.95675896876279'],
		['Sky Action HD', '4.7940074906367'],
		['Sky Arts 1', '3.64832114879881'],
		['Sky Arts 1 HD', '2.42780963879666'],
		['Sky Arts 2', '2.80663294550647'],
		['Sky Arts 2 HD', '1.84827447429319'],
		['Sky Comedy', '8.80434782608696'],
		['Sky Comedy HD', '4.34456928838951'],
		['Sky Crime and Thriller', '6.41304347826087'],
		['Sky Disney', '6.88858695652174'],
		['Sky Disney HD', '3.97003745318352'],
		['Sky Drama', '6.34510869565217'],
		['Sky Drama HD', '3.52059925093633'],
		['Sky Family', '6.5625'],
		['Sky Family HD', '7.04119850187266'],
		['Sky Greats', '6.92934782608696'],
		['Sky Greats HD', '3.67041198501873'],
		['Sky Living', '5.1074484880786'],
		['Sky Living HD', '3.06570077472583'],
		['Sky Living+1', '4.78565610450208'],
		['Sky Livingit', '3.36876401556671'],
		['Sky News', '4.7072192110053'],
		['Sky News HD', '2.86547942448939'],
		['Sky One', '7.52793057329324'],
		['Sky Premiere', '6.6304347826087'],
		['Sky Premiere +1', '6.69836956521739'],
		['Sky Premiere HD', '4.11985018726592'],
		['Sky SCi-Fi/Horror', '5.9375'],
		['Sky SciFi/Horror HD', '3.22097378277154'],
		['Sky Select', '6.3179347826087'],
		['Sky Select HD', '4.04494382022472'],
		['Sky Showcase', '6.9429347826087'],
		['Sky Showcase HD', '3.82022471910112'],
		['Sky Sports', '9.80712166172107'],
		['Sky Sports 1 HD', '10.7537688442211'],
		['Sky Sports 3', '7.29970326409496'],
		['Sky Sports 3 HD', '7.23618090452261'],
		['Sky Sports 4', '6.40454995054402'],
		['Sky Sports 4 HD', '5.92964824120603'],
		['Sky Sports 5', '8.0811078140455'],
		['Sky Sports 5 HD', '8.19095477386935'],
		['Sky Sports News HQ', '4.272799493177'],
		['Sky Sports News HQ HD', '2.14307274373679'],
		['Sky Sports World Cup', '6.7457962413452'],
		['Sky Sports World Cup HD', '6.58291457286432'],
		['Sky Thriller HD', '5.28414755732802'],
		['Sky Two', '6.4971893446497'],
		['Smash Hits', '2.56669403912155'],
		['Spin 1038', '0.187041822953853'],
		['Sunshine 106.8', '0.232293876894301'],
		['Syfy', '3.17836312719769'],
		['TCM', '2.26875539553197'],
		['TCM +1', '1.99818920683048'],
		['TG4', '0.059330470721921'],
		['TG4 HD', '6.79987530545136'],
		['TLC', '6.3895900163913'],
		['TRTE', '0.570175879649649'],
		['TV3', '8.88046418551331'],
		['TV3+1', '7.21317739810746'],
		['TV5', '0.243193733813404'],
		['TVX', '7.5812274368231'],
		['TXFM', '0.131733757026638'],
		['The Adult Channel', '2.1505376344086'],
		['The Box', '2.50984355589245'],
		['The God Channel', '0.224243572737035'],
		['Today FM', '0.264473115251953'],
		['True Movies 1', '2.65880956930101'],
		['UCB Ireland', '0.052291262331185'],
		['UPC Customer Channel', '5.95416469736432'],
		['UTV Ireland', '0.011061613185443'],
		['UTV Ireland HD', '8.47420130124795'],
		['Universal', '3.97637546585813'],
		['VH1', '2.64144189670057'],
		['VIVA', '2.03131442132679'],
		['WRN', '0.040224047947065'],
		['Zee TV', '8']
	];
                 
    rmvpp[pluginName].columnMappingParameters = [
    	{
			targetProperty:"category",
			formLabel:"Category"
		},
		{
			targetProperty:"measure1",
			formLabel:"First Measure"
		},
		{
			targetProperty:"measure2",
			formLabel:"Second Measure"
		},
		{
			targetProperty:"measure3",
			formLabel:"Third Measure"
		}
    ];
    
    rmvpp[pluginName].configurationParameters = [
		{
			"targetProperty":"w",
			"label":"Width",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 500
			}
		},
		{
			"targetProperty":"h",
			"label":"Height",
			"inputType":"textbox",
			"inputOptions": {
				"subtype" : "number",
				"defaultValue" : 400
			}
		},
		{
			"targetProperty":"chartTitle",
			"label":"Chart Title",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : ""
			}
		},
		{
			"targetProperty":"xTitle",
			"label":"X Axis Title",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : "default"
			}
		},
		{
			"targetProperty":"yTitle",
			"label":"Y Axis Title",
			"inputType":"textbox",
			"inputOptions": {
				"defaultValue" : "default"
			}
		},
		{
			"targetProperty":"brushNav",
			"label":"Mini-Chart Navigator",
			"inputType":"checkbox",
			"inputOptions": {"defaultValue" : true	}
		},
		{
			"targetProperty":"colour1",
			"label":"Colour 1",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#5DA5DA"
			}
		},
		{
			"targetProperty":"colour2",
			"label":"Colour 2",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#60BD68"
			}
		},
		{
			"targetProperty":"colour3",
			"label":"Colour 3",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#F15854"
			}
		},
		{
			"targetProperty":"colour4",
			"label":"Colour 4",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#4D4D4D"
			}
		},
		{
			"targetProperty":"colour5",
			"label":"Colour 5",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#FAA43A"
			}
		},
		{
			"targetProperty":"colour6",
			"label":"Colour 6",
			"inputType":"colourpicker",
			"inputOptions": { 
				"defaultValue": "#B276B2"
			}
		}
    ];
	
	
    rmvpp[pluginName].render = function(data, columnMap, config, container)   {			
		// Compile column name list for Y
		var colNames = [columnMap.measure1, columnMap.measure2, columnMap.measure3], legendTitle = 'Measures';
		
		colNames = colNames.filter(function(d) {
			return typeof(d) != "undefined";
		});
		
		// Denormalise X label onto Y values for tooltip later
		data.map(function(d) {
			d.measure = [{'name' : columnMap.measure1, 'value' : d.measure1.replace(/,/g,''), 'x' : d.category}];
			if (typeof(columnMap.measure2) != "undefined") {
				d.measure.push({'name' : columnMap.measure2, 'value' : d.measure2.replace(/,/g,''), 'x' : d.category});
				if (typeof(columnMap.measure3) != "undefined") {
					d.measure.push({'name' : columnMap.measure3, 'value' : d.measure3.replace(/,/g,''), 'x' : d.category});
				}
			}
		});
		
		var varyColour = false;
	
		var xTitle = config.xTitle, yTitle = config.yTitle;
		if (config.xTitle == 'default') xTitle = columnMap.category.Name;
		if (config.yTitle == 'default') {
			if (varyColour)
				yTitle = columnMap.measure[0].Name;
			else
				yTitle = "";
		}
		
		// Add chart title if necessary
		if (config.chartTitle != "") {
			var title = d3.select(container)
				.append('div')
				.classed('bar-chartTitle', true)
				.text(config.chartTitle);
		}
		
		
		// Create Sort radio buttons
		var sortControl = d3.select(container)
			.append('div')
			.classed('sortBar', true);

		var sortHeader = sortControl.append('span');
		sortHeader.append('b').text('Sort by');
		sortHeader
			.append('select')
				.classed('sortColumn', true)
				.style('margin', '0 10px')
				.selectAll('.sortOptions')
				.data([columnMap.category.Name].concat(colNames))
				.enter()
				.append('option')
					.text(function(d, i) {return d})
					.attr('value', function(d, i) {return i});
		
		$(sortControl[0]).append('<span>Ascending<input type="radio" name="sortBar" value="asc"></span>');
		$(sortControl[0]).append('<span>Descending<input type="radio" name="sortBar" value="desc" checked></span>');
		$(sortControl[0]).find('.sortColumn').val('1'); // Set first measure column by default
		
		var chartContainer = d3.select(container)
			.append('div')
			.classed('hbar-chart', true);
		
		var selector = $(chartContainer[0]).toArray();
		// Render bar chart
		
		if (config.brushNav)
			renderNav(data, $(chartContainer[0]), {'col' : 1, 'dir' : 'desc'});
		renderBar(data, $(chartContainer[0]), {'col' : 1, 'dir' : 'desc'}); // Sort by first measure column descending by default
			
		// Render chart on sort change
		$('.sortBar input, .sortBar select').change(function() {
			sortBar = $(this).parents('.sortBar');
			barContainer = sortBar.next('.hbar-chart')
			
			sortObj = {}; // Use object to define sort column and direction
			sortObj.dir = sortBar.find('input[name="sortBar"]:checked').val()
			sortObj.col = sortBar.find('.sortColumn').val();
			
			if (config.brushNav)
				renderNav(data, barContainer, sortObj);
			renderBar(data, barContainer, sortObj);
		});
		
		
		// Mini Chart Code
		//	add in new variables and navigation chart details
		function renderNav(data, selector,  sort) {
			
			// Sort data based on input
			switch(sort.dir) {
				case ('desc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.ascending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.ascending(a.category, b.category); });
					break;
				case ('asc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.descending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.descending(a.category, b.category); });
					break;
			}
		
			$(selector).find('.navigator,.tooltip').remove(); // Clear existing chart
			selector = selector.toArray(); // Convert jQuery object for D3 use
				
			var width = config.w, height = config.h;
			var navFrac = 0.2;
			
			// Set x domain
			var maxX = d3.max(data, function(d) { return d3.max(d.measure, function(d) { return +d.value; }); });
			var minX = d3.min(data, function(d) { return d3.min(d.measure, function(d) { return +d.value; }); });			
			
			var y = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }));
				
			var x = d3.scale.linear()
					.range([0, width])
					.domain([d3.min([0, minX]), maxX]) // From 0 to maximum
					.nice();
			
			var margin = rmvpp.api.margin(width, height, "" , "" , x, y); // xTitle, yTitle, x, y)
				
			height = height - margin.top - margin.bottom;
			navWidth = navFrac*width; 
			width = width - margin.left - margin.right; // Space for legend
			navHeight =  height;
			
			y.rangeBands([height, 0], .1); // Apply range once height has been modified for margin
			
			// Define variable y grouping
			var y1 = d3.scale.ordinal()
				.domain(colNames)
				.rangeRoundBands([0, y.rangeBand()]);
				
			var navYScale = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }))
				.rangeBands([navHeight, 0], .1)
			
			var navYAxis = d3.svg.axis() // only want the y axis on the navigation chart
				.scale(navYScale)
				.orient('left');		
				
			var navChart = rmvpp.api.createSVG(navWidth, navHeight, margin, selector); // Create chart SVG
			 navChart.parent().classed('navigator', true);
			 
			var navGroups = navChart.selectAll(".navGroups")
					.data(data)
				.enter().append("g")
					.attr("transform", function(d) { return "translate(0," + y(d.category) + ")"; }); //x
				
			// Create bars
			navGroups.selectAll('g') //x
					.data(function(d) { return d.measure; })
					.enter()
					.append("rect")
					.classed('bar', true)
					.attr("y", function(d, i) { return y1(d.name); }) 
					.attr("height", y1.rangeBand())  
					.attr("x", function(d, i) { return navFrac*x(Math.min(0, d.value)); }) 
					.attr("width", function(d, i) { return navFrac*Math.abs(x(d.value) - x(0)); });	
					
			navChart.append('g')
				.attr('class', 'y axis')
				.call(navYAxis)
				.selectAll('.tick').remove();
		
			var viewport = d3.svg.brush()
				.y(navYScale)
				.on("brushend", function () {
				
					var maxRange = d3.max(viewport.extent());
					var minRange = d3.min(viewport.extent());	
				
					testFilter = navYScale.range().filter(function(d) { return (d) <= maxRange && (d+navYScale.rangeBand()) >= minRange; });
					var positions = [];
					
					for (i = 0; i < testFilter.length; i++) { 
						positions.push(navYScale.range().indexOf(testFilter[i])); 
					}

					selectedCategory = data.filter(function(d, i) { return $.inArray(i, positions) > -1;});
				
					// Render chart on sort change
					$('.sortBar input, .sortBar select').change(function() {
						sortBar = $(this).parents('.sortBar');
						barContainer = sortBar.next('.hbar-chart')
						
						sortObj = {}; // Use object to define sort column and direction
						sortObj.dir = sortBar.find('input[name="sortBar"]:checked').val()
						sortObj.col = sortBar.find('.sortColumn').val();
					}); 
				
					if (typeof sortObj != 'undefined') { //typeof sortObj != 'undefined' 
						renderBar(selectedCategory, $(selector[0]), sortObj);
					} else {
						renderBar(selectedCategory, $(selector[0]), {'col' : 1, 'dir' : 'desc'});
					}			
				});
			
			navChart.append("g")
				.attr("class", "viewport")
				.call(viewport)
				.selectAll("rect")
				.attr("width", navWidth); 
	};
		
	// Main rendering function
		function renderBar(data, selector, sort) {
		// Error if no bars selected
		if (data.length == 0) {
		 throw 'No data can not render chart'
		}
			// Sort data based on input
			switch(sort.dir) {
				case ('desc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.ascending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.ascending(a.category, b.category); });
					break;
				case ('asc'):
					if (sort.col != 0)
						data = data.sort(function(a, b) { return d3.descending(+a.measure[sort.col-1].value, +b.measure[sort.col-1].value); });
					else
						data = data.sort(function(a, b) { return d3.descending(a.category, b.category); });
					break;
			}
		
			$(selector).find('.main, .tooltip').remove(); // Clear existing chart
			selector = selector.toArray(); // Convert jQuery object for D3 use
		
			// Define column names and height and width from config
			var width = +config.w, height = +config.h, xTitle = config.xTitle, yTitle = config.yTitle;
			if (config.yTitle == 'default') yTitle = columnMap.category.Name;
			if (config.xTitle == 'default') {
				if (varyColour)
					xTitle = columnMap.measure[0].Name;
				else
					xTitle = "";
			}
			
			// Minimum and maximum measure values
			var maxX = d3.max(data, function(d) { return d3.max(d.measure, function(d) { return +d.value; }); });
			var minX = d3.min(data, function(d) { return d3.min(d.measure, function(d) { return +d.value; }); });
			
			// Define x and y axes
			var y = d3.scale.ordinal()
				.domain(data.map(function (d) { return d.category; }));			
			
			var x = d3.scale.linear()
					.domain([d3.min([0, minX]), maxX]) // From 0 to maximum
					.range([0, width]).nice();
			
			// Get standard margin
			var margin = rmvpp.api.margin(width, height, xTitle, yTitle, x, y);
			
			height = height - margin.top - margin.bottom;
			y.rangeBands([height, 0], .1); // Apply range once height has been modified for margin
			
			// Define variable y grouping
			var y1 = d3.scale.ordinal()
				.domain(colNames)
				.rangeRoundBands([0, y.rangeBand()]);
			
			// Define colour palette
			var colour = d3.scale.ordinal()
				.range([config.colour1, config.colour2, config.colour3, config.colour4, config.colour5, config.colour6]);
			
			var chart = rmvpp.api.createSVG(width, height, margin, selector); // Create chart SVG
			chart.parent().classed('main', true); //needs.parent to be assigned to the right part when using SVG function
			
			var tooltip = rmvpp.api.tooltip.create(selector); // Create tooltip object
			
			var legend = rmvpp.api.legend.create(chart, colNames, legendTitle, width);  // Legend
			rmvpp.api.legend.addColourKey(legend, colNames, colour); // Legend Colour Key
			
			// Create Y partitions
			var yGroups = chart.selectAll(".yGroups")
				.data(data)
			.enter().append("g")
				.attr("transform", function(d) { return "translate(0," + y(d.category) + ")"; }); //x
			
			// Generate invisible rectangles for section hovering
			yGroups.append('rect')
				.classed('section', true)
				.style('opacity', 0)
				.attr("x", x(d3.min([0,minX])))
				.attr('y', 0)
				.attr('height', y.rangeBand())
				.attr('width', x(d3.max([0,maxX])))
				.attr('pointer-events', 'none') // Disable pointer events until animation complete
				.on('mouseover', function(d, i, event) {
					var offset = getOffset(d3.event, this, container);
					rmvpp.api.tooltip.displayList(tooltip, container, d, 'category', 'measure', offset.X, offset.Y, colour);
					highlightGroup(this);
				})
				.on('mouseout', function(d, i) {
					revertColour(this);
					rmvpp.api.tooltip.hide(tooltip);
				})
				.transition().duration(500)
				.transition().attr('pointer-events', ''); // Enable point events when animation complete
			
			// Create bars
			yGroups.selectAll('g') //x
				.data(function(d) { return d.measure; })
				.enter()
				.append("rect")
				.classed('bar', true)
				.attr("y", function(d, i) { return y1(d.name); })
				.attr("x", function(d, i) {return x(0);}) // Set bar width to 0 for animations
				.attr("width", function(d, i) {return 0;})
				.attr("height", y1.rangeBand())
				.attr('fill', function(d) { return colour(d.name); })
				.attr('pointer-events', 'none') // Disable pointer events until animation complete
				.on("mouseover", function(d, i) { 
						var datum = d3.selectAll($(this).parent().find('rect.section').toArray()).datum();
						var offset = getOffset(d3.event, this, container, x, datum.value);
						rmvpp.api.tooltip.displayList(tooltip, container, datum, 'category', 'measure', offset.X, offset.Y, colour, d.name);
						
						highlightBar(this, d.name);
						return true;
					})
				.on("mouseout", // Hide tooltip and revert bar colour
					function(d){
						revertColour(this);
						rmvpp.api.tooltip.hide(tooltip);
					})
				.transition() // Animate bars on render
					.attr("x", function(d, i) { return x(Math.min(0, d.value)); }) 
					.attr("width", function(d, i) { return Math.abs(x(d.value) - x(0)); })
					.duration(500)
					.duration(500)
					.transition().attr('pointer-events', ''); // Enable point events when animation complete
			
			// Draw axes after bars so they display over
			rmvpp.api.drawAxes(chart, x, y, width, height, margin, xTitle, yTitle) // Axes
			chart.select('.zero-line') // Adjust zero line as the chart is rotated
				.attr('x1', x(0))
				.attr('x2', x(0))
				.attr('y1', 0)
				.attr('y2', height)
			
			
			// Get tooltip offset co-ordinates for this chart
			function getOffset(event, context, container) {
				var offset = {};
				offset.X = parseFloat(+d3.select(context).attr("x") + +d3.select(context).attr('width')/2 + 0.5*width); //
				offset.Y = event.pageY - $(container).position().top; // Use pageX as it is supported on IE as well. Subtract the position of the container
				return offset;
			} 
			
			
			//
			
			//
			
			// Highlight bars in a group
			function highlightGroup(element) {
				d3.selectAll($(element).parent().find('rect.bar').toArray())
					.transition()
					.attr('fill', function(d) { return rmvpp.api.reduceBrightness(colour(d.name), 15); })
					.duration(100);
			}
			
			// Revert colour of bars
			function revertColour(element) {
				d3.selectAll($(element).parent().find('rect.bar').toArray())
					.transition()
					.attr('fill', function(d) { return colour(d.name); })
					.duration(100);
			}

			// Highlight specific bar
			function highlightBar(element, group) {
				highlightGroup(element);
				d3.select(element)
					.transition()
					.attr('fill', function(d) { return rmvpp.api.reduceBrightness(colour(d.name), 50); })
					.duration(200);
			}
		}
    }
   
    return rmvpp;

}(rmvpp || {}))