var rmvpp = (function(rmvpp) {

    var showNarrativeForm = false,
            log = false,
            distinctLoadLevels = [],
            distinctLoadLevelIndex = 0,
            newNarrative = false,
            rmvppInvokeTag = 'rmvpp',
            scanRateMS = 300;

    // export global
    rmvpp.rmvppInvokeTag = rmvppInvokeTag;

    function getSortedDistinctLoadLevels(files) {

        var filesSortedByLoadLevel = files.sort(sortByLoadLevel);
        var prevLoadLevel = 0;
        var currentLoadLevel = 0;

        for (var i in filesSortedByLoadLevel) {
            currentLoadLevel = filesSortedByLoadLevel[i].loadLevel.valueOf();
            if (currentLoadLevel !== prevLoadLevel) {
                distinctLoadLevels.push(filesSortedByLoadLevel[i].loadLevel);
            }
            prevLoadLevel = currentLoadLevel;
        }

    }

    function loadFilesByLoadLevel(distinctLoadLevelIndex) {

        var loadLevelCnt = 0;
        var loadedFiles = 0;

        log ? console.log("Loading files for loadLevel: " + distinctLoadLevels[distinctLoadLevelIndex]) : ''

        for (var n in files) {
            if (files[n].loadLevel === distinctLoadLevels[distinctLoadLevelIndex]) {
                if (!files[n].intermediate && files[n].srcType != 'nope') // Skip libraries which write their own script elements
					loadLevelCnt++;
            }
        }

        for (var n in files) {
			if (!files[n].intermediate && files[n].srcType != 'nope') { // Skip libraries which write their own script elements
				if (files[n].loadLevel === distinctLoadLevels[distinctLoadLevelIndex]) {
					
					if (files[n].srcType === "js") {
						var src = document.createElement('script');
						src.setAttribute("type", "text/JavaScript");
						// IE Hack. append time in ms to force cache refresh
						src.setAttribute("src", files[n].srcName + '?' + Date.now()); 
					} else if (files[n].srcType === "css") {
						var src = document.createElement("link");
						src.setAttribute("rel", "stylesheet");
						src.setAttribute("type", "text/css");
						 // IE Hack. append time in ms to force cache refresh
						src.setAttribute("href", files[n].srcName + '?' + Date.now());
					}
					
					if ((typeof src !== undefined) && (src !== false)) {
						parent.document.getElementsByTagName("head")[0].appendChild(src);
					}

					src.onload = function() {
						loadedFiles++;
						if (loadedFiles === loadLevelCnt) {

							log ? console.log("All files loaded for loadLevel: " + distinctLoadLevels[distinctLoadLevelIndex]): ''

							if (distinctLoadLevelIndex + 1 < distinctLoadLevels.length) {
								// Load the next Level
								loadFilesByLoadLevel(distinctLoadLevels[distinctLoadLevelIndex++]);
							} else {
								// All files loaded
								log ? console.log("All files loaded !") : ''

								// Entry Point for the rest of processing
								scanForPlugins()
							}
						}
					};
				}
			}
        }
    }

    function sortByLoadLevel(a, b) {
        if (a.loadLevel < b.loadLevel)
            return -1;
        if (a.loadLevel > b.loadLevel)
            return 1;
        return 0;
    }

    function getPlugins() {
        var plugins = [];
        for (var key in rmvpp) {
            if (typeof rmvpp[key] === 'object' && key != 'api') { // Reserve key api
                plugins.push(key)
            }
        }
        return plugins
    }

    function compareColumnArrays(plugin) {

        var criteriaColumns = rmvpp.getColumnNames();
        var rmvppColumns = rmvpp[plugin].columnNames

        if (criteriaColumns.length !== rmvppColumns.length) {
            return false;
        }

        for (var i = 0; i < criteriaColumns.length; i++) {
            if (criteriaColumns[i] !== rmvppColumns[i]) {
                return false
            }
        }

        return true
    }

    rmvpp.getColumnNames = function() {

        var columnNames = [];

        if ($('#testbench').attr('id') === undefined) {

            var xmlText = $('#idNarrativePreviewForm input[name=ReportXML]').attr("value");

            // Traverse XML and extract column names - either the default or custom headings if specified
            $(xmlText).find('saw\\:criteria saw\\:columns saw\\:column').each(function() {

                var columnName;

                $(this).children().each(function() {

                    if ($(this).get(0).nodeName === 'SAW:COLUMNFORMULA') {
                        columnName = $(this).text().split('.')[1].replace(/"/g, '')
                    }

                    if ($(this).get(0).nodeName === 'SAW:COLUMNHEADING') {
                        if (+$(this).text().length > 0) {
                            columnName = $(this).text();
                        }
                    }
                });
                columnNames.push(columnName);
            });

        } else {
            for (col in rmvpp[rmvpp.selectedPlugin].testData[0]) {
                columnNames.push("Column " + (+col + 1));
            }
        }

        return columnNames;
    }

    function populateNarrativeForm(plugin, isNew) {
		// Add intermediate loading libraries like Google Maps API
		var jsLibraries = '';
		for (var n in files) {
			if (files[n].intermediate) {
				jsLibraries +=  '<script type="text/javascript" src="';
				jsLibraries += files[n].srcName;
				jsLibraries += '"></script>';
			}
		}
		
        // Add the invoke tag TODO: this needs to support multiSelect instances of the same plugin on the same page.
        var invokeTag = "<" + plugin + " />";

        // Create javascript string for the Prefix. This will be eval'd later on by the framework.
        var prefixJS = "<div class='prefixJs' id='" + plugin + "_prefix' style='display: none'>";

        // Init data array
        prefixJS += "rmvpp['" + plugin + "'].data=[];";

        // Add ColumnNames array
        var columnFound = false;
        prefixJS += "rmvpp['" + plugin + "'].columnNames=[";
        var columnNames = rmvpp.getColumnNames();
        for (name in columnNames) {
            columnFound = true;
            prefixJS += "'" + columnNames[name] + "',";
        }
        if (columnFound) {
            prefixJS = prefixJS.substring(0, prefixJS.length - 1);
        }
        prefixJS += " ];";

        // Add mappings Array
        var mappingFound = false;
        prefixJS += "rmvpp['" + plugin + "'].mappings={";

        for (var p in rmvpp[plugin].columnMappingParameters) {
            mappingFound = true;

            if (isNew) {
                prefixJS += "'" + rmvpp[plugin].columnMappingParameters[p].targetProperty + "':'" + (+p + 1) + "',";
            } else {
                prefixJS += "'" + rmvpp[plugin].columnMappingParameters[p].targetProperty + "':'" + $('#p_' + rmvpp[plugin].columnMappingParameters[p].targetProperty).val() + "',";
            }
        }

        if (mappingFound) {
            prefixJS = prefixJS.substring(0, prefixJS.length - 1);
        }
        prefixJS += '};';

        // Add config Array
        var configFound = false;
        var configParams = rmvpp[plugin].configurationParameters;
        prefixJS += "rmvpp['" + plugin + "'].config={";

		// Assign form values to config object
        for (var p in configParams) {
            var param = configParams[p];
            configFound = true;

            switch (param.inputType) {

                case "textbox":
                    if (isNew) {
                        prefixJS += "'" + param.targetProperty + "':'" + param.inputOptions.defaultValue + "',";
                    } else {
                        prefixJS += "'" + param.targetProperty + "':'" + $('#p_' + rmvpp[plugin].configurationParameters[p].targetProperty).val() + "',";
                    }
                    break;
                    
				case "range":
					if (!param.inputOptions.subtype) // Set type to number if unspecifed
						param.inputOptions.subtype = 'number';
					
					var numConvert = '';
					if (param.inputOptions.subtype == 'number')
						numConvert = '+';
						
					if (isNew) {
						prefixJS += "'" + param.targetProperty + "':[" + numConvert + "'" + param.inputOptions.defaultValue[0] + "',";
						prefixJS += numConvert + "'" + param.inputOptions.defaultValue[1] + "'" + "],";
					}
					else {
						prefixJS += "'" + param.targetProperty + "':[" + numConvert + "'" + $('#p_' + param.targetProperty + '_from').val() + "',";
						prefixJS += numConvert + "'" + $('#p_' + param.targetProperty + '_to').val() + "'" + "],";
					}
					break;
					
                case "dropdown":

                    var dropdownValues = typeof param.inputOptions.values == 'function' ? param.inputOptions.values() : param.inputOptions.values;

                    if (param.inputOptions.multiSelect) {
                        if (isNew) {

                            prefixJS += "'" + param.targetProperty + "':[";

                            for (var i in param.inputOptions.defaultSelection) {
                                prefixJS += "'" + dropdownValues[+param.inputOptions.defaultSelection[i] - 1] + "',";
                            }

                            prefixJS = prefixJS.substring(0, prefixJS.length - 1);
                            prefixJS += "],";

                        } else {

                            prefixJS += "'" + param.targetProperty + "':[" + $('#p_' + param.targetProperty + ' option:selected').map(function() {
                                return "'" + $(this).text() + "'";
                            }).get().join(",") + "],";
                        }

                    } else {

                        if (isNew) {
                            prefixJS += "'" + param.targetProperty + "':'" + dropdownValues[+param.inputOptions.defaultSelection - 1] + "',";
                        } else {
                            prefixJS += "'" + param.targetProperty + "':'" + $('#p_' + param.targetProperty + ' option:selected').text() + "',";
                        }

                    }
                    break;
                    
                case "angles":
					// Force default input options
                	param.inputOptions.min = -90;
					param.inputOptions.max = 90;
					param.inputOptions.subtype = 'number';
					
                	if (isNew) {
                		prefixJS += "'" + param.targetProperty + "': {'count':" + param.inputOptions.defaultValue.count;
                		prefixJS += ",'from':" + param.inputOptions.defaultValue.from;
                		prefixJS += ",'to':" + param.inputOptions.defaultValue.to + '},';
                	} else {
                		prefixJS += "'" + param.targetProperty + "': {'count':" + $('#p_' + param.targetProperty + '_count').val();
                		prefixJS += ",'from':" + $('#p_' + param.targetProperty + '_from').val();
                		prefixJS += ",'to':" + $('#p_' + param.targetProperty + '_to').val() + '},';
                	}
                	break;  
                	
				case "radio":
					if (isNew) {
						prefixJS += "'" + param.targetProperty + "':'" + param.inputOptions.defaultValue + "',";
					} else {
						prefixJS += "'" + param.targetProperty + "':'" + $('input:radio[name="' + param.targetProperty + '"]:checked').val() + "',";
					}
					break;
					
                case "colourpicker":
                    if (isNew) {
                        prefixJS += "'" + param.targetProperty + "':'" + param.inputOptions.defaultValue + "',";
                    } else {
                        prefixJS += "'" + param.targetProperty + "':'" + $('#p_' + param.targetProperty).val() + "',";
                    }
                    break;

                case "checkbox":
                    if (isNew) {
                        prefixJS += "'" + param.targetProperty + "':" + param.inputOptions.defaultValue + ",";
                    } else {
                        if ($('#p_' + param.targetProperty).prop('checked')) {
                            prefixJS += "'" + param.targetProperty + "':true,";
                        } else {
                            prefixJS += "'" + param.targetProperty + "':false,";
                        }
                    }
                    break;
            }
        }

        if (configFound) {
            prefixJS = prefixJS.substring(0, prefixJS.length - 1);
        }
        prefixJS += '};';

        prefixJS = prefixJS.substring(0, prefixJS.length - 1);
        prefixJS += "</div>";

        prefixJS += "<div class='narrativeJs' id='" + plugin + "_narrative' style='display: none'>";

        // Add data array population to narrative
        var narrativeJS = "rmvpp['" + plugin + "'].data.push([";
        for (var col = 1; col <= rmvpp.getColumnNames().length; col++) {
            narrativeJS += '"@' + col + '",';
        }
        narrativeJS = narrativeJS.substring(0, narrativeJS.length - 1);
        narrativeJS += " ]);";

        // Add postfix code
        var postfix = '</div>';

        // add code to narrative form and force change()
        $("textarea[name='Prefix']").val(jsLibraries + invokeTag + prefixJS)
        $("textarea[name='Postfix']").val(postfix);
        $("textarea[name='Narrative']").val(narrativeJS).change();

    }
	
	rmvpp.getConfigFromForm = function(plugin) {
		var config = {};
		var configParams = rmvpp[plugin].configurationParameters;
		for (var p in configParams) {
            var param = configParams[p];
			
			switch (param.inputType) {
                case "textbox":
					config[param.targetProperty] = $('#p_' + param.targetProperty).val();
					break;
					
				case "range":
					config[param.targetProperty] = [$('#p_' + param.targetProperty + '_from').val(), $('#p_' + param.targetProperty + '_to').val()];
					break;
				
				case "dropdown":
                    if (param.inputOptions.multiSelect) {
						config[param.targetProperty] = $('#p_' + param.targetProperty + ' option:selected').map(function() {
							return $(this).text();
						});
                    } else {
						conifg[param.targetProperty] = $('#p_' + param.targetProperty + ' option:selected').text();
                    }
                    break;
					
				case "angles":
					config[param.targetProperty] = {'count' : $('#p_' + param.targetProperty + '_count').val()};
					config[param.targetProperty].from = $('#p_' + param.targetProperty + '_from').val();
					config[param.targetProperty].to = $('#p_' + param.targetProperty + '_to').val();
                	break;
					
				case "radio":
					config[param.targetProperty] = $('input:radio[name="' + param.targetProperty + '"]:checked').val();
					break;
				
				case "colourpicker":
					config[param.targetProperty] = $('#p_' + param.targetProperty).val();
                    break;
					
				case "checkbox":
					if ($('#p_' + param.targetProperty).prop('checked')) {
						config[param.targetProperty] = true;
					} else {
						config[param.targetProperty] = false;
					}
                    break;
			}
		}
		return config;
	}

    function prepareData(plugin) {

        log ? console.log("Preparing Data") : ''

        // If the plugin has data mappings then return data as an array of objects and column names as an object.
        if (!$.isEmptyObject(rmvpp[plugin].mappings)) {

            var data = [];
            var rowObj = {};

            var pluginData = rmvpp[plugin].data
            for (row in pluginData) {
                var rowObj = {};
                for (col in pluginData[row]) {
                    for (mapping in rmvpp[plugin].mappings) {
                        if ((+col + 1) === +rmvpp[plugin].mappings[mapping]) {
							var columnMap = rmvpp[plugin].columnMappingParameters.filter(function(d) { return d.targetProperty == mapping; })[0];
							var datum = pluginData[row][+rmvpp[plugin].mappings[mapping] - 1];
							
							if (columnMap.measure == true)
								datum = removeCommas(datum);
							
                            rowObj[mapping] = datum;
                        }
                    }
                }
                data.push(rowObj);
            }
            return data;
        } else {
            return rmvpp[plugin].data 
        }
    }
	
	// Remove commas from string and set to 0 if null
	function removeCommas(number) {
		var returnValue = number.replace(/,/g,"");
        if (returnValue.length == 0)
            returnValue = 0;
		return returnValue;
	}
	
    function prepareColumnNames(plugin) {

        log ? console.log("Preparing Column Names") : ''

        // If has mappings
        if (!$.isEmptyObject(rmvpp[plugin].mappings)) {

            var columnNames = {};

            for (mapping in rmvpp[plugin].mappings) {
                columnNames[mapping] = rmvpp[plugin].columnNames[+rmvpp[plugin].mappings[mapping] - 1]
            }
            return columnNames
        } else {
            return rmvpp[plugin].columnNames
        }
    }

    function renderPluginPackHeader() {

        log ? console.log("Rendering Plugin Pack Header") : ''

        if ($('#pluginPackHeader').attr("id") === undefined) {
            var plugins = getPlugins();

            pluginHeader = '<div id="pluginPackHeader">'
            pluginHeader += '<img src="/rmvpp/logo.png"><br/>'
            pluginHeader += '<table id="pluginSelectTbl" ><tr><td>Plugin</td><td><select class="pluginselect" id="pluginselect"><option></option>'

            for (var i in plugins) {

                // Don't add invoke tag
                if (plugins[i] !== rmvppInvokeTag) {
                    pluginHeader += '<option value="' + plugins[i] + '">' + rmvpp[plugins[i]].pluginDescription + '</option>'
                }
            }

            pluginHeader += '</select></td></tr></table></div>'

            $(pluginHeader).insertAfter('#idViewForm')

            $('#pluginselect').on('change', function() {
                $('#parameterform').remove();
                $("textarea[name='Narrative']").val('')
                $("textarea[name='Prefix']").val('<' + $('#pluginselect option:selected').val() + '/>').change();
                rmvpp.selectedPlugin = $('#pluginselect option:selected').val();
                testData = rmvpp[rmvpp.selectedPlugin].testData
                $("input[name='RowCount']").val(rmvpp[rmvpp.selectedPlugin].rowLimit)
                
            })
        }

    }
	
	function formInteractions() { // Control interactivity for form objects
		// Number inputs
		$('input[type="number"]').on('change', function() {
			$(this).val(+$(this).val()); // Restricts to number if string is entered
			if($(this).prop('min')) // Restricts if min is set
				$(this).val(Math.max($(this).prop('min'), $(this).val()));
			if($(this).prop('max')) // Restricts if max is set
				$(this).val(Math.min($(this).prop('max'), $(this).val()));
		});
		
		// Restrict range so the lower bound can't exceed the upper and vice versa 
		$('.range input[type="number"]:even').on('change', function() { 
			$(this).first().val(Math.min($(this).val(), $(this).next().next().val()));
		});
		
		$('.range input[type="number"]:odd').on('change', function() { 
			$(this).val(Math.max($(this).val(), $(this).prev().prev().val()));
		});
		
		
		// Date version of above
		$('.range input[type="date"]:even').on('change', function() {
			format = d3.time.format('%Y-%m-%d')
			maxDate = format.parse($(this).next().next().val());
			valDate = format.parse($(this).val());
			if (valDate > maxDate)
				$(this).val(format(maxDate));
		});
		
		$('.range input[type="date"]:odd').on('change', function() { 
			format = d3.time.format('%Y-%m-%d')
			minDate = format.parse($(this).prev().prev().val());
			valDate = format.parse($(this).val());
			if (valDate < minDate)
				$(this).val(format(minDate));
		});
		
		// Draw angle selector
		var r = 40.5, px = 35, py = 20;
		
		var angles = d3.selectAll(".angles.wheel").append("svg")
			  .attr("width", 2 * (r + px))
			  .attr("height", r + 1.5 * py)
			.append("g")
			  .attr("transform", "translate(" + [r + px, r + py] +")");

		angles.append("path")
			.style("fill", "none")
			.attr("d", ["M", -r, 0, "A", r, r, 0, 0, 1, r, 0].join(" "));

		angles.append("line")
			.attr("x1", -r - 7)
			.attr("x2", r + 7);

		angles.append("line")
			.attr("y2", -r - 7);

		angles.selectAll("text")
			.data([-90, 0, 90])
			.enter().append("text")
				.attr("dy", function(d, i) { return i === 1 ? null : ".3em"; })
			 	.attr("text-anchor", function(d, i) { return ["end", "middle", "start"][i]; })
			 	.attr("transform", function(d) {
					d += 90;
					return "rotate(" + d + ")translate(" + -(r + 10) + ")rotate(" + -d + ")translate(2)";
			  	})
				.text(function(d) { return d + "°"; });
		
		$('.angles.wheel').each(function() {
			var wheel = $(this),
				from = $(wheel.parent().find('input')[1]).val(),
				to = $(wheel.parent().find('input')[2]).val();
			updateAngleWheel(wheel, from, to);
		});
		
		$('.angles input').on('change', function() {
			var wheel = $(this).parentsUntil('td').next(),
				from = $(wheel.parent().find('input')[1]).val(),
				to = $(wheel.parent().find('input')[2]).val();
			
			updateAngleWheel(wheel, from, to);
		});
		
		// Update wheel images and values
		function updateAngleWheel(wheel, from, to) {
			
			var count = $(wheel.parent().find('input')[0]).val(),
				d3Scale = d3.scale.linear(),
				d3Wheel = d3.selectAll(wheel.find('g').toArray())
				radians = Math.PI / 180;
			
			d3Scale.domain([0, count - 1]).range([from, to]);
			
			var path = d3Wheel.selectAll("path.angle")
				.data([{startAngle: from * radians, endAngle: to * radians}]);
			path.enter().insert("path", "circle")
				.attr("class", "angle")
				.style("fill", "#70B4FA");
			path.attr("d", d3.svg.arc().innerRadius(0).outerRadius(r));

			var line = d3Wheel.selectAll("line.angle")
				.data(d3.range(count).map(d3Scale));
			line.enter().append("line")
				.attr("class", "angle");
			line.exit().remove();
			line.attr("transform", function(d) { return "rotate(" + (90 + +d) + ")"; })
				.attr("x2", function(d, i) { return !i || i === count - 1 ? -r - 5 : -r; });
			
			var drag = d3Wheel.selectAll("path.drag")
				.data([from, to]);
			drag.enter().append("path")
				.attr("class", "drag")
				.attr("d", "M-9.5,0L-3,3.5L-3,-3.5Z")
				.call(d3.behavior.drag()
				.on("drag", function(d, i) {
					if (!from)
						from = 	$(wheel.parent().find('input')[1]).val();
					if (!to)
						to = $(wheel.parent().find('input')[2]).val();
					d = (i ? to : from) + 90;
					var start = [-r * Math.cos(d * radians), -r * Math.sin(d * radians)],
						m = [d3.event.x, d3.event.y],
						delta = ~~(Math.atan2(cross(start, m), dot(start, m)) / radians);
					d = Math.max(-90, Math.min(90, d + delta - 90)); // remove this for 360°
					delta = to - from;
					if (i) {
						to = d;
						if (delta > 360) from += delta - 360;
						else if (delta < 0) from = to;
					} else {
						from = d;
						if (delta > 360) to += 360 - delta;
						else if (delta < 0) to = from;
					}
					if (from)
						updateAngleWheel(wheel, from, to);
				  }));
			drag.attr("transform", function(d) { return "rotate(" + (+d + 90) + ")translate(-" + r + ")"; });
			$(wheel.parent().find('input')[1]).val(from);
			$(wheel.parent().find('input')[2]).val(to);
		}
		
		
		$('.colourpicker').colpick({
			layout: 'hex',
			submit: 0,
			colorScheme: 'light',
			onShow: function(hsb, hex, rgb, el, bySetColor) {
				$(this).colpickSetColor(this.value);
			},
			onChange: function(hsb, hex, rgb, el, bySetColor) {
				$(el).css('border-color', '#' + hex);
				if (!bySetColor)
					$(el).val('#' + hex);
			}
		}).keyup(function() {
			$(this).colpickSetColor(this.value);
		}).css('border-color', function() {
			return $(this).val()
		});
	}
	
	// Geometry function
	function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
	function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
	
	function renderInputBox(param, id) {
		var subtype, min, max;
		if (param.inputOptions.subtype)
			subtype = param.inputOptions.subtype;
		else
			subtype = 'text';
	
		if (param.inputOptions.min)
			min = 'min="'+param.inputOptions.min+'"';
		else
			min = '';
	
		if (param.inputOptions.min)
			max = 'max="'+param.inputOptions.max+'"';
		else
			max = '';
		
		return '<input name="' + param.targetProperty + '" type="' + subtype + '" id="p_' + id + '"' + min + max + ' />';           
	}
	
	function renderRangeBoxes(param) {
		var rangeHTML = '';
		rangeHTML += renderInputBox(param, param.targetProperty + '_from');
		rangeHTML += '<span> to </span>';
		rangeHTML += renderInputBox(param, param.targetProperty + '_to');
		return rangeHTML;
	}
	
    rmvpp.renderParameterForm = function(plugin, config, selector) { // Render parameter form for a given plugin after a given selector

        log ? console.log("rendering parameter form") : ''

        var columnNames = rmvpp.getColumnNames();
        var colMapParams = rmvpp[plugin].columnMappingParameters
        var configParams = rmvpp[plugin].configurationParameters

        if (colMapParams.length > 0 || configParams.length > 0) {

			var parameterForm = '';

			parameterForm += '<div id="parameterform">';
			parameterForm += ''

			if (colMapParams.length > 0) {
                // Add column Mapping Inputs
				parameterForm += '<div id="columnmappingparametersdiv"><table><tr><td class="colheader" colspan=2>Column Mappings</td></tr>'
                for (var i in colMapParams) {
                    parameterForm += '<tr><td class="colvalue">' + colMapParams[i].formLabel + '</td>';
                    // Build column selection drop down
                    parameterForm += '<td class="colvalue"><select id=p_' + colMapParams[i].targetProperty + '>'
                    if ($('#testbench').attr('id') === undefined) {
                        for (col in columnNames) {
                            parameterForm += "<option value=" + (parseInt(col) + 1) + ">" + columnNames[col] + "</option>"
                        }
                    } else {
                        // get column numbers from testData
                        for (col in rmvpp[plugin].testData[0]) {
                            parameterForm += "<option value=" + (parseInt(col) + 1) + ">Column " + (parseInt(col) + 1) + "</option>"
                        }
                    }
                    parameterForm += "</select></td></tr>"
                }
                parameterForm += "</table></div>"
            }
			
            if (configParams.length > 0) {

                // Add configuration Inputs
                parameterForm += '<div id="configurationparametersdiv"><table><tr><td class="colheader" colspan=2>Configuration</td></tr>'
                for (var p in configParams) {

                    var param = configParams[p]

                    parameterForm += '<tr><td class="colvalue">' + param.label + '</td>';
                    parameterForm += '<td class="colvalue">'
                    switch (param.inputType) {
                        case "textbox":
                        	parameterForm += renderInputBox(param, param.targetProperty);
                        	break;
                        case "range":
                        	parameterForm += '<div class="range">'
                        	parameterForm += renderRangeBoxes(param);
                        	parameterForm += '</div>';
                        	break;
                        case "colourpicker":
                            parameterForm += '<input class="colourpicker" name="' + param.targetProperty + '" type="' + param.formInputType + '" id="p_' + param.targetProperty + '" value="' + param.formDefaultValue + '">';
                            break;
                        case "dropdown":
                            if (param.inputOptions.multiSelect) {
                                parameterForm += '<select multiple size=4 name="' + param.targetProperty + '" id="p_' + param.targetProperty + '">'
                            } else {
                                parameterForm += '<select name="' + param.targetProperty + '" id="p_' + param.targetProperty + '">'
                            }

                            var dropdownValues = typeof param.inputOptions.values == 'function' ? param.inputOptions.values() : param.inputOptions.values

                            for (var val in dropdownValues) {
                                parameterForm += '<option value="' + (+val + 1) + '">' + dropdownValues[val] + '</option>'
                            }
                            parameterForm += '</select>';
                            break;
                        case "angles":
                        	parameterForm += '<p class="angles">';
                        	parameterForm += '<input type="number" id="p_' + param.targetProperty + '_count" min="1" max="360"/>'
                        	parameterForm += '<span> from </span>';
                        	parameterForm += '<span class="range">';
                        	parameterForm += renderRangeBoxes(param);

                        	parameterForm += '</span></p><div class="angles wheel"/>';
                        case "radio":
                        	var radioValues = typeof param.inputOptions.values == 'function' ? param.inputOptions.values() : param.inputOptions.values
                        	
                        	parameterForm += '<table id="p_' + param.targetProperty + '">';
                        	for (var val in radioValues) {
                        		parameterForm += '<tr><td class="radioLabel">' + radioValues[val] + '</td><td>';
                        		parameterForm += '<input name="' + param.targetProperty + '" type="radio" value = "' + radioValues[val] + '"/>';
                        		parameterForm += '</td></tr>';
                        	}
                        	parameterForm += '</table>';
                        	
                        	break;
                        case "checkbox":
                            parameterForm += '<input name="' + param.targetProperty + '" type="checkbox" id="p_' + param.targetProperty + '" >';
                            break;
                    }
                    parameterForm += '</td></tr>'
                }
                parameterForm += '</table></div>';
            }

            parameterForm += '<div id="submitdiv"><button id=submitform type="button">Apply</button></div></div>'


            // Add UI parameter form the the DOM
            //$(parameterForm).insertAfter(selector);
			$(selector).append(parameterForm);
            
            // Add change events for the UIActions parameters
            if (configParams.length > 0) {
                
                for (var p in configParams) {                   
                    var param = configParams[p];
                    
                    // if this UI component has UIActions then create a change listener to handle them.
                    if (param.inputType === "checkbox" && param.inputOptions.UIActions !== undefined) {
                        
                        // Change listener
                        $('#p_' + param.targetProperty).on("change",function(){
                            
                            var currentVal = $(this).prop('checked');
                            
                            for (var p in configParams) {                              
                                var param = configParams[p];
                                
                                if ( "p_" + param.targetProperty === $(this).attr('id'))    {
                                                       
                                    for ( var i in param.inputOptions.UIActions ) {

                                        if ( currentVal === param.inputOptions.UIActions[i].when )   {

                                            for ( var a in param.inputOptions.UIActions[i].actions)    {

                                                var targets = param.inputOptions.UIActions[i].actions[a].targets 
                                                var value = param.inputOptions.UIActions[i].actions[a].setValue
                                                var enabled = param.inputOptions.UIActions[i].actions[a].enabled

                                                for (t in targets) {
                                                    $('#p_' +  targets[t]).prop('checked', value )
                                                    $('#p_' +  targets[t]).prop('disabled', !enabled )
                                                }

                                            }   
                                        }  
                                    }
                                }
                            }
                        }); 
                    }
                }
            }
            
            // Reflect mapping array in inputs
            for (var mapping in rmvpp[plugin].mappings) {
                $('#p_' + mapping).val(rmvpp[plugin].mappings[mapping])
            }
			
            // Reflect config array in inputs
            for (var property in config) {
                var inputType;
                var inputOptions;

                // Get  input type
                for (var p in configParams) {
                    var param = configParams[p]
                    if (param.targetProperty == property) {
                        inputType = param.inputType;
                        inputOptions = param.inputOptions
                    }
                }

                switch (inputType) {
                    case "dropdown":

                        var selected = []

                        var dropdownValues = typeof inputOptions.values == 'function' ? inputOptions.values() : inputOptions.values

                        if (inputOptions.multiSelect) {

                            // Lookup index of each selected value
                            for (var val in dropdownValues) {
                                for (var selection in config[property]) {
                                    if (dropdownValues[val] == config[property][selection]) {
                                        selected.push(+val + 1)
                                    }
                                }
                            }
                            $('#p_' + property).val(selected)
                        } else {
                            // Lookup index of selected value
                            for (var val in dropdownValues) {
                                if (dropdownValues[val] == config[property]) {
                                    selected.push(+val + 1)
                                }
                            }
                            $('#p_' + property).val(selected)
                        }
                        break;
                    case "radio":
                    	$('#p_' + property + ' input[value="' + config[property] + '"]')
                    		.prop('checked',true);
                    		
                    case "textbox":
                        $('#p_' + property).val(config[property])
                        break;
                    
                    case "angles":
                    	$('#p_' + property + '_count').val(config[property].count);
                    	$('#p_' + property + '_from').val(config[property].from);
						$('#p_' + property + '_to').val(config[property].to);
						break;
                    
					case "range":
						$('#p_' + property + '_from').val(config[property][0]);
						$('#p_' + property + '_to').val(config[property][1]);
						break;
						
                    case "colourpicker":
                        $('#p_' + property).val(config[property])
                        break;

                    case "checkbox":
                        if (config[property]) {
                            $('#p_' + property).prop('checked', true).change()
                        } else {
                            $('#p_' + property).prop('checked', false)
                        }
                        break;
                }
            }

            // Reflect inputs in prefix
            $('#submitform').on("click", function() {
                populateNarrativeForm(plugin, false);
            });

        }
        formInteractions(); // Function containing custom JavaScript for form interaction
    }
	
	// Append custom export button
	function customExportButton(elem, filename) {
		elem = $(elem);
		elem.append($('<i class="fa fa-download fa-2x" style="float: left; cursor: pointer;"></i>')
			.click(function() {
				$(this).next().animate({width: 'toggle'});
			})
		);
		
		var downloadOpts = $('<span style="display: none; float: left; font-size: 1.5em;"></span>');
		downloadOpts.append($('<span class="png" style="cursor: pointer; margin-left: 5px; padding-right: 5px; border-right: 1px solid #666;">PNG</span>')
			.click(function() {
				obieeUI.printHTML($(this).parent().prev().prev(), filename, 'png');
			})
		);
		downloadOpts.append($('<span class="pdf" style="cursor: pointer; margin-left: 5px;">PDF</span></span>')
			.click(function() {
				obieeUI.printHTML($(this).parent().prev().prev(), filename, 'pdf');
			})
		);
		elem.append(downloadOpts);
	}
	
    function scanForPlugins() {
        var plugins = getPlugins();

        plugins.push(rmvppInvokeTag)

        // Runtime Mode (dashboards etc)
        if ($('#idSubjectAreasMenu').attr("id") === undefined) {
			console.log('what now?');
            $('.pluginselect').hide()
              
            // Redraw visuals after dashboard prompt applied.  
            $(document).on("click",".button",function(){

                var loopLifeTimeMS = 10000;
                var loopIntervalMS = 300;
                var loopAgeMS = 0;

                var runtimeLoop = setInterval(function(){
                    loopAgeMS += loopIntervalMS;
                    
                    if ( loopAgeMS > loopLifeTimeMS )       {                       
                        clearInterval(runtimeLoop)
                    }
                    
                    for (var p in plugins) {
                        $(plugins[p]).each(function(instance) {                          
                            if ($('#' + plugins[p] + "_container_" + instance).length == 0) {
                                // Render Visualisation
                                eval($(this).find('.prefixJs').text())
                                eval($(this).find('.narrativeJs').text())
                                $(this).append('<div class="rmvpp-visualisation" id="' + plugins[p] + '_container_' + instance + '"></div>')
								if ($.inArray(plugins[p], ['multiPanel-lineBar']) == -1) // Hardcoded exception list for printing
									customExportButton(this, plugins[p] + '-' + instance);
								
                                rmvpp[plugins[p]].render(prepareData(plugins[p]), prepareColumnNames(plugins[p]), rmvpp[plugins[p]].config, document.getElementById(plugins[p] + "_container_" + instance))
                                clearInterval(runtimeLoop)
                            }
                        })
                    }
                }, loopIntervalMS)
            });
            
            for (var p in plugins) {

                // Tag found
                //if ($(plugins[p]).length) {
                $(plugins[p]).each(function(instance) {
					
                    if ($('#' + plugins[p] + "_container_" + instance).length == 0) {

                        // Render Visualisation
                        eval($(this).find('.prefixJs').text())
                        eval($(this).find('.narrativeJs').text())
                        $(this).append('<div class="rmvpp-visualisation" id="' + plugins[p] + '_container_' + instance + '"></div>')
						
						if ($.inArray(plugins[p], ['multiPanel-lineBar']) == -1) // Hardcoded exception list for printing
							customExportButton(this, plugins[p] + '-' + instance);
                        rmvpp[plugins[p]].render(prepareData(plugins[p]), prepareColumnNames(plugins[p]), rmvpp[plugins[p]].config, document.getElementById(plugins[p] + "_container_" + instance))
                    }
                })
            }

            // Design mode
        } else {

            log ? console.log("Entering Design Mode - scanRateMS = " + scanRateMS) : ''

            // Enter design mode loop
            var devLoop = setInterval(function() {

                // Add invoke rmvpp icon to toolbar
                if ($('#idReportDiv').attr("id") !== undefined) {
                    if ($('.AnswersViewToolbar').length == 0) {
                        if ($('#rmvpp_invoke').attr("id") === undefined) {
                            // Add invoke button
                            if($('#idReportViewToolbar td.ViewBarButtonCell').length > 0) // Switch for pre 119
								$('<td class="ViewBarButtonCell"><img id="rmvpp_invoke" src="/rmvpp/rmicon.png"></td>').insertBefore('#idReportViewToolbar .ViewBarTextCell');
							else { // v119
								$('<span id="idAnswersCompoundViewToolbar_rmvpp" role="button" title="Rittman Mead Visual Plugins" class="masterToolbarButton uberBarButtonSpan"><img id="rmvpp_invoke" src="/rmvpp/rmicon.png"></span>').insertBefore('#idReportViewToolbar .XUIPreviewingSpan');
							}
							
                            // Handle invoke button click
                            $('#rmvpp_invoke').on("click", function() {

                                // Add new narrative
                                var g = XUIPanel.getEditor("idView");
                                g.addView("narrativeView", null, null, true)

                                // Get new narrative ID
                                newNarrativeId = $(".AccordionPane[panename='viewList'] span:last").html().split(":")[1]

                                // Open new narrative
                                CVViewProps('narrativeView!' + (newNarrativeId ? newNarrativeId : 1), 'compoundView!1')

                                newNarrative = true
                            })

                        }
                    }
                }

                // Results Tab
                if ($("textarea[name='Narrative']").attr("name") == undefined) {

                    log ? console.log("Dev Mode - Not Narrative") : ''

                    $('.pluginselect').hide()

                    for (var p in plugins) {

                        // Process tags
                        $(plugins[p]).each(function(instance) {

                            if ($('#' + plugins[p] + "_container_" + instance).length == 0) {

                                // Evaluate prefix and narrative JavaScript strings
                                eval($(this).find('.prefixJs').text())
                                eval($(this).find('.narrativeJs').text())

                                // Add visualisation container
                                $(this).append('<div id="' + plugins[p] + '_container_' + instance + '"></div>')

                                // OBIEE clones the narrative during a drag/drop operation and this screws up the rendering.
                                // Remove the tag from the clone to fix this, this also improves drag/drop performance.
                                $('#sawDragObj').find(plugins[p]).remove()

                                // Render Visualisation
                                rmvpp[plugins[p]].render(prepareData(plugins[p]), prepareColumnNames(plugins[p]), rmvpp[plugins[p]].config, document.getElementById(plugins[p] + "_container_" + instance))
                            }
                        })
                    }

                    // Narrative 
                } else {

                    // If a new Narrative has just been added then add the invoke tag and force change()
                    if (newNarrative) {

                        if (!showNarrativeForm) {
                            $('#idViewForm').hide()
                        }
                        $('#idViewHtmlEncode').click()
                        $("textarea[name='Prefix']").val("<" + rmvppInvokeTag + "/>").change()
                        $("textarea[name='Narrative']").change()
                        newNarrative = false
                    }

                    // look for tags on the page
                    for (var p in plugins) {

                        // Tag found
                        if ($(plugins[p]).length) {

                            if (!showNarrativeForm) {
                                $('#idViewForm').hide()
                            }

                            // If it's the rmvpp invoke tag
                            if (plugins[p] === rmvppInvokeTag) {

                                // Clear invoke tag
                                $("textarea[name='Prefix']").val("")
                                $("textarea[name='Narrative']").change()
                                renderPluginPackHeader()

                                // it's a plugin tag
                            } else {

                                // If the visualisation is not rendered get to work...
                                if ($('#' + plugins[p] + "_container").length == 0) {

                                    renderPluginPackHeader()

                                    // set the plugin select to the selected plugin
                                    $('#pluginselect').val(plugins[p])

                                    // Fresh Tag just added
                                    if ($("textarea[name='Prefix']").val() === '<' + plugins[p] + '/>') {

                                        log ? console.log("Fresh tag added") : ''

                                        populateNarrativeForm(plugins[p], true)

                                        // Populated Tag
                                    } else if ($("textarea[name='Prefix']").val().indexOf(plugins[p]) !== -1) {

                                        log ? console.log("Found Populated Tag") : ''

                                        // Evaluate prefix and narrative JavaScript strings
                                        eval($('#' + plugins[p] + "_prefix").text())
                                        eval($('#' + plugins[p] + "_narrative").text())


                                        // FIX THIS !!!
                                        // if columns names differ then refresh them
//                                        if (!compareColumnArrays(plugins[p])) {
//                                            populateNarrativeForm(plugins[p], false)
//                                        }

                                        // Display plugin configuration form if it doesn't exist
                                        if (!$('#parameterform').length) {
                                            rmvpp.renderParameterForm(plugins[p], rmvpp[plugins[p]].config, '#pluginPackHeader')
                                        }

                                        // Add visualisation Container
                                        $(plugins[p]).append('<div id="' + plugins[p] + '_container"></div>')

                                        // Render Visualisation
                                        rmvpp[plugins[p]].render(prepareData(plugins[p]), prepareColumnNames(plugins[p]), rmvpp[plugins[p]].config, document.getElementById(plugins[p] + "_container"))
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            }, scanRateMS)
        }
    }
	
	// Get closest parent of the view (CVUICell) then find the heading in it (CVUIViewHdg)
    rmvpp.changeViewNameToVis = function (container, pluginDescription){
        try { $(container).closest(".CVUICell").find(".CVUIViewHdg").text(pluginDescription); }
        catch (err) {}
    }
	
	// Function to be called for a plugin to return a default configuration object
	rmvpp.getConfigObj = function(plugin) {
		var configObj = {}, configParams = rmvpp[plugin].configurationParameters;
		for (var i=0; i < configParams.length; i++) {
			configObj[configParams[i].targetProperty] = configParams[i].inputOptions.defaultValue;
		}
		return configObj;
	}
	
	// Initialise RMVPP
    function initialise() {
        getSortedDistinctLoadLevels(files);
        loadFilesByLoadLevel(distinctLoadLevelIndex);
    }

    /***********************************************************************************/

    // Define source files and Load Level's here...
    var files = [
        // Standard Libraries
	(function() {
		if (!window.jQuery){
			return {loadLevel: 1, srcName: "/rmvpp/js/lib/jquery.min.js", srcType: "js"};
		}
		else {
			return {loadLevel: 1, srcName: "/rmvpp/js/lib/jquery.min.js", srcType: "nope"};
		}
	}()),
	(function() {
                if (!window.jQuery || !window.jQuery.ui){
                        return {loadLevel: 2, srcName: "/rmvpp/js/lib/jquery-ui.min.js", srcType: "js"};
                }
                else {
                        return {loadLevel: 2, srcName: "/rmvpp/js/lib/jquery-ui.min.js", srcType: "nope"};
                }
        }()),
        {loadLevel: 1, srcName: "/rmvpp/js/lib/d3.min.js", srcType: "js"},
        {loadLevel: 1, srcName: "/rmvpp/js/lib/underscore.min.js", srcType: "js"},
        {loadLevel: 1, srcName: "/rmvpp/js/lib/lodash.min.js", srcType: "js"},
        {loadLevel: 1, srcName: "/rmvpp/js/lib/simple-statistics.js", srcType: "js"},
        {loadLevel: 1, srcName: "/rmvpp/js/lib/leaflet.min.js", srcType: "js"},
		{loadLevel: 1, srcName: "/rmvpp/js/lib/leaflet.pip.min.js", srcType: "js"},
		{loadLevel: 1, srcName: "/rmvpp/css/lib/leaflet.css", srcType: "css"},

        // Plugin Pack css
        {loadLevel: 1, srcName: "/rmvpp/rmvpp.css", srcType: "css"},
        
		// Font Awesome
		{loadLevel: 2, srcName: "/rmvpp/font-awesome/css/font-awesome.min.css", srcType: "css"},
		
        // D3 Plugins
        {loadLevel: 2, srcName: "/rmvpp/js/lib/d3.plugin.sankey.js", srcType: "js"},
        {loadLevel: 2, srcName: "/rmvpp/js/lib/topojson.js", srcType: "js"},
        {loadLevel: 2, srcName: "/rmvpp/js/lib/d3.plugin.tip.js", srcType: "js"},
        
		// Jquery Plugins
        {loadLevel: 2, srcName: "/rmvpp/js/lib/interact.js", srcType: "js"},
		{loadLevel: 2, srcName: "/rmvpp/js/lib/jquery.xml2json.js", srcType: "js"},
        {loadLevel: 2, srcName: "/rmvpp/js/lib/colpick.js", srcType: "js"},
        {loadLevel: 2, srcName: "/rmvpp/css/lib//colpick.css", srcType: "css"},
        
		// Libraries for printing
		{loadLevel: 2, srcName: "/rmvpp/js/lib/fabric.min.js", srcType: "js"},
		{loadLevel: 2, srcName: "/rmvpp/js/lib/FileSaver.min.js", srcType: "js"},
		{loadLevel: 2, srcName: "/rmvpp/js/lib/html2canvas.js", srcType: "js"},
		{loadLevel: 2, srcName: "/rmvpp/js/lib/jspdf.js", srcType: "js"},
		
		{loadLevel: 3, srcName: "/rmvpp/js/lib/obiee-v8.js", srcType: "js"},
		// RM Shared code for plugins
		{loadLevel: 4, srcName: "/rmvpp/js/lib/obieeUI.js", srcType: "js"},
		{loadLevel: 4, srcName: "/rmvpp/pluginAPI.css", srcType: "css"},
		{loadLevel: 4, srcName: "/rmvpp/pluginAPI.js", srcType: "js"},
		// RM Plugins
        // D3 Sankey Visualisation
        {loadLevel: 5, srcName: "/rmvpp/plugins/sankey/sankey.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/sankey/sankey.js", srcType: "js"},
        // D3 Trendline Visualisation
        {loadLevel: 5, srcName: "/rmvpp/plugins/trendline/trendline.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/trendline/trendline.js", srcType: "js"},
        // D3 Bullet Visualisation
		{loadLevel: 2, srcName: "/rmvpp/js/lib/d3.plugin.bullet.js", srcType: "js"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/bullet/bullet.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/bullet/bullet.js", srcType: "js"},
        // Jquery Pivot Table Visualisation
		{loadLevel: 2, srcName: "/rmvpp/js/lib/pivot.min.js", srcType: "js"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/pivottable/pivottable.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/pivottable/pivottable.js", srcType: "js"},
        // Jquery Data Tables
		{loadLevel: 2, srcName: "/rmvpp/css/lib//jquery.dataTables.min.css", srcType: "css"},
        {loadLevel: 2, srcName: "/rmvpp/js/lib/jquery.dataTables.min.js", srcType: "js"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/datatables/datatables.js", srcType: "js"},
        // Pie chart 
		// {loadLevel: 2, srcName: "/rmvpp/js/lib/contour.min.js", srcType: "js"},
        // {loadLevel: 2, srcName: "/rmvpp/css/lib//contour.min.css", srcType: "css"},  
        // {loadLevel: 5, srcName: "/rmvpp/plugins/pie/pie.css", srcType: "css"},
        // {loadLevel: 5, srcName: "/rmvpp/plugins/pie/pie.js", srcType: "js"},
		// Bar Chart
		{loadLevel: 5, srcName: "/rmvpp/plugins/bar/bar.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/bar/bar.js", srcType: "js"},
		// Line Chart
		{loadLevel: 5, srcName: "/rmvpp/plugins/line/line.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/line/line.js", srcType: "js"},
		// Horizontal Bar Chart
		{loadLevel: 5, srcName: "/rmvpp/plugins/hbar/hbar.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/hbar/hbar.js", srcType: "js"},
		// Scatter/Bubble Chart
		{loadLevel: 5, srcName: "/rmvpp/plugins/scatter/scatter.css", srcType: "css"},
        {loadLevel: 5, srcName: "/rmvpp/plugins/scatter/scatter.js", srcType: "js"},
		// World Cloud
		{loadLevel: 2, srcName: "/rmvpp/js/lib/d3.layout.cloud.js", srcType: "js"},
		{loadLevel: 5, srcName: "/rmvpp/plugins/wordCloud/wordCloud.js", srcType: "js"},
		//Calendar
		 {loadLevel: 5, srcName: "/rmvpp/plugins/calendar/calendar.css", srcType: "css"},
		 {loadLevel: 5, srcName: "/rmvpp/plugins/calendar/calendar.js", srcType: "js"},
		// Scatter plot matrix
		{loadLevel: 5, srcName: "/rmvpp/plugins/scatterplotmatrix/scatterplotmatrix.js", srcType: "js"},
		{loadLevel: 5, srcName: "/rmvpp/plugins/scatterplotmatrix/scatterplotmatrix.css", srcType: "css"},
		// Indicators
		{loadLevel: 5, srcName: "/rmvpp/plugins/indicators/indicators.js", srcType: "js"},
		// Tree map
		{loadLevel: 5, srcName: "/rmvpp/plugins/treemap/treemap.js", srcType: "js"},
		{loadLevel: 5, srcName: "/rmvpp/plugins/treemap/treemap.css", srcType: "css"},
		// Target bars
		{loadLevel: 5, srcName: "/rmvpp/plugins/targetbars/targetbars.js", srcType: "js"},
		{loadLevel: 5, srcName: "/rmvpp/plugins/targetbars/targetbars.css", srcType: "css"},

		// Multi Panel - Line / Bar
		{loadLevel: 5, srcName: "/rmvpp/plugins/multiPanel-lineBar/multiPanel-lineBar.js", srcType: "js"},
		
		// Map - Choropleth
		{loadLevel: 5, srcName: "/rmvpp/plugins/map-choropleth/map-choropleth.js", srcType: "js"},
		
		// Map - Bubbles
		{loadLevel: 5, srcName: "/rmvpp/plugins/map-bubbles/map-bubbles.js", srcType: "js"},
		
        // Maps - Region Selector
        // {loadLevel: 5, srcName: "/rmvpp/prototypes/mapRegions/mapRegions.css", srcType: "css"},
        // {loadLevel: 5, srcName: "/rmvpp/prototypes/mapRegions/mapRegions.js", srcType: "js"},
        // Maps - TopoJSON
        // {loadLevel: 5, srcName: "/rmvpp/prototypes/mapRegions/maps.css", srcType: "css"},
        // {loadLevel: 5, srcName: "/rmvpp/prototypes/mapRegions/maps.js", srcType: "js"},
		// Gantt
		// {loadLevel: 5, srcName: "/rmvpp/prototypes/gantt/gantt.css", srcType: "css"},
        // {loadLevel: 5, srcName: "/rmvpp/prototypes/gantt/gantt.js", srcType: "js"},
        // Used for offline development
        {loadLevel: 3, srcName: "/rmvpp/test-bench.js", srcType: "js"}

    ];

    // document.addEventListener("DOMContentLoaded", function() {
    //     initialise();
    //}, false);

    window.addEventListener("load", function() {
        initialise();
    }, false);

    return rmvpp;

}(rmvpp || {}))
