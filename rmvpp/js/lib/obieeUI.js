/* 	OBIEE Web Service Interface
	Requirements:
		obiee-v8.js [Local only]
		rmvpp-ext.js [Local only]
	Description: Code to function certain UI elements for the OBIEE Web interface without having to store all of the code inline
*/

var obieeUI = (function(obieeUI) {
	
	/* ------ PUBLIC UI FUNCTIONS ----- */
	
	// Restore DB layout from a BIDashboard object
	obieeUI.restoreDBLayout = function(container, dbObj) {
		var visArray = dbObj.Visuals;
		$(container).find('.visualisation, .biPrompt, .biColumnSelect, .breadcrumbs, .utility').remove();
		
		// Apply drill down functionality
		if (dbObj.Breadcrumbs.length > 0) {
			var breadcrumbs = d3.selectAll($(container).toArray())
				.append('div')
				.classed('breadcrumbs', true);
			
			// Update filters for each visualisation
			dbObj.Breadcrumbs.forEach(function(bc) {
				visArray.forEach(function(vis) { 
					updateFilters(bc.DrillFilter, vis, false);
				});
				
				if (!$.isEmptyObject(dbObj.Prompts))
					updatePrompt(bc.DrillFilter, dbObj.Prompts);
			});
			
			// Create breadcrumb history
			breadcrumbs.selectAll('.path')
				.data(dbObj.Breadcrumbs)
				.enter().append('span')
					.attr('bc-id', function(d, i) { return i; })
					.text(function(d) { return d.SourcePath; })
					.style('margin-left', '10px')
					.on('click', function(d, i) {
						var drillFilter = dbObj.Breadcrumbs[i+1];
						var crumbs =  dbObj.Breadcrumbs.filter(function(bc, bci) { return bci < i; });
						applyDrill(d.SourcePath, container, drillFilter,  crumbs);
					});
			
			dbObj.Drilldowns.forEach(function(dd, i) {
				dbObj.Drilldowns[i] = new BIDrilldown(dd.Trigger, visArray[dd.SourceNum], dd.DrillPath, dd.Columns, dd.SourcePath, dbObj.Breadcrumbs);
			});
			
			// Shift layout downward
			visArray.forEach(function(x) { x.Y += 25; });
			dbObj.Selectors.forEach(function(x) { x.Y += 25; });
			dbObj.Utilities.forEach(function(x) { x.Y += 25; });
			
			if (!$.isEmptyObject(dbObj.Prompts))
				dbObj.Prompts.Y += 25;
		}	
		
		// Remove existing prompted filters
		visArray.forEach(function(vis) { obiee.removePromptedFilters(vis.Query.Filters); });
		
		// Add global filters
		if (!$.isEmptyObject(dbObj.Prompts)) {
			var filters = dbObj.Prompts.Filters;
			var promptDiv = obieeUI.drawPrompt(container, dbObj);
			for (var i=0; i < filters.length; i++) {
				obieeUI.drawFilter(promptDiv, i, filters[i]);
			}
			visArray.forEach(function(vis) { updateVisFilters(vis, filters); });
		}
		
		// Add visualisations
		for (var i=0; i < visArray.length; i++) {
			$(container)
				.append($('<div></div>')
					.addClass('visualisation')
					.attr('vis-number', visArray[i].ID)
					.attr('data-x', visArray[i].X)
					.attr('data-y', visArray[i].Y)
					.css('transform', 'translate(' + visArray[i].X + 'px, ' + visArray[i].Y + 'px)')
					.css('-webkit-transform', 'translate(' + visArray[i].X + 'px, ' + visArray[i].Y + 'px')
				);
			
			obieeUI.renderVisual(visArray[i]);
		}
		
		// Add column selectors
		for (var i=0; i < dbObj.Selectors.length; i++) {
			var colGroupNum = +i+1;
			
			$(container).append($('<div></div>')
				.addClass('biColumnSelect')
				.attr('subject-area', $('#subjectArea').val())
				.attr('colGroup', colGroupNum)
				.attr('data-x', dbObj.Selectors[i].X)
				.attr('data-y', dbObj.Selectors[i].Y)
				.css('transform', 'translate(' + dbObj.Selectors[i].X + 'px, ' + dbObj.Selectors[i].Y + 'px)')
				.css('-webkit-transform', 'translate(' + dbObj.Selectors[i].X + 'px, ' + dbObj.Selectors[i].Y + 'px')
			);
			
			var colSelector = $(container).find('.biColumnSelect[colGroup="' + colGroupNum + '"]');
			
			var styleSelect;
			$(colSelector)
				.attr('vis-numbers', dbObj.Selectors[i].Visuals.join(';'))
			if (dbObj.Selectors[i].Style == 'Dropdown') {
				$(colSelector)
					.append('<select></select>');
					
				dbObj.Selectors[i].Columns.forEach(function(col) {
					$(colSelector).find('select').append($('<option></option>')
						.attr('value', col.ID)
						.text(col.Name)
					);
				});
				styleSelect = 'select';
			} else {
				dbObj.Selectors[i].Columns.forEach(function(col) {
					$(colSelector).append($('<div></div>')
						.append($('<input></input>')
							.attr('type', 'radio')
							.attr('name', 'colSelect')
							.attr('value', col.ID)
						)
						.append($('<span></span>')
							.text(col.Name)
						)
					);
				});
				$(colSelector).find('input').first().prop('checked', true);
				styleSelect = 'input[name="colSelect"]';
			}
			
			$(colSelector).find(styleSelect)
				.change(function() {
					var colGroup = $(this).parents('.biColumnSelect').attr('colgroup')-1;
					obieeUI.applyColumnSelect(dbObj.Selectors[colGroup], dbObj.Visuals, $(this).val());
				});
		}
		
		// Add interactions
		for (var i=0; i < dbObj.Interactions.length; i++) {
			obieeUI.createInteraction(dbObj.Interactions[i]);
		}
		
		// Add drilldowns
		for (var i=0; i < dbObj.Drilldowns.length; i++) {		
			obieeUI.createInteraction(dbObj.Drilldowns[i]);
		}
		
		// Add utilities
		dbObj.Utilities.forEach(function (utility) {
			switch (utility.Utility) {
				case 'Refresh':
					$(container)
						.append($('<div></div>')
							.addClass('utility')
							.attr('bi-utility', 'Refresh')
							.attr('data-x', utility.X)
							.attr('data-y', utility.Y)
							.css('transform', 'translate(' + utility.X + 'px, ' + utility.Y + 'px)')
							.css('-webkit-transform', 'translate(' + utility.X + 'px, ' + utility.Y + 'px')
							.append('<i class="fa fa-refresh fa-3x"></i>')
							.click(function() {
								obieeUI.restoreDBLayout($(container), dbObj);
							})
						);
					break;
			}
		});
	}
	
	// Draw Prompt HTML
	obieeUI.drawPrompt = function(container, dbObj) {
		promptDiv = $(d3.selectAll($(container).toArray()).append('div')
			.classed('biPrompt', true)
			.attr('data-x', dbObj.Prompts.X)
			.attr('data-y', dbObj.Prompts.Y)
			.style('transform', 'translate(' + dbObj.Prompts.X + 'px, ' + dbObj.Prompts.Y + 'px)')
			.style('-webkit-transform', 'translate(' + dbObj.Prompts.X + 'px, ' + dbObj.Prompts.Y + 'px')[0])
			
		var html = '<table><thead><tr><th class="filterButton" colspan="3"><i class="fa fa-search fa-2x"></i></th></tr></thead><tbody></tbody>';
		promptDiv.append(html)
		
		$(container).find('.filterButton').click(function() {
			obieeUI.applyPrompts(dbObj, promptDiv);
		});
		
		return promptDiv;
	}
	
	// Draw Prompt Filters
	obieeUI.drawFilter = function(promptDiv, num, filter) {
		var tbodyDiv = promptDiv.find('tbody');
		filterRow = $('<tr class="biFilter" filter-id="' + num + '"></tr>')
		codeCell = $('<td></td>').append($('<span></span>')
			.addClass('code')
			.css('font-weight', 'bold')
			.attr('col-id', filter.ColumnID)
			.attr('subject-area', filter.SubjectArea)
			.text(filter.Name)
		);
		
		valueCell = $('<td></td>').append($('<select></select>')
			.addClass('value')
			.prop('multiple', true)
		);
		
		advSearch = $('<td></td>').append($('<i></i>')
				.addClass('fa fa-search')
				.click(function(event) {
					var popup = renderPopup(event, 'Advanced Search');
					
					if (filter.DataType != 'date') {
						popup.append($('<div></div')
							.append('<span>' + filter.Name + '</span>')
							.append($('<select class="filterOp"></select>')
								.append('<option value="starts">Starts</option>')
								.append('<option value="contains">Contains</option>')
								.append('<option value="ends">Ends</option>')
								.append("<option value=\"like\">Like ('%')</option>")
								
							)
						);
						popup.append($('<div class="advSearchBox"></div>')
							.append($('<input>'))
							.append($('<i>').addClass('fa fa-search').click(function() {
								var val = $(this).prev().val(), op = $(this).parent().prev().find('.filterOp').val();
								var subFilter = new BIFilter(filter.Column, val, op, filter.SubjectArea);
								var advSearchQuery = new BIQuery(filter.SubjectArea, [filter.Column], [subFilter])
								obiee.runQuery(advSearchQuery, function(results) {
									var resultsBox = popup.find('.advSearchResults');
									resultsBox.empty();
									results.forEach(function(result) {
										resultsBox.append($('<li>' + result[filter.Name] + '</li>'));
									});
								});
							}))
						);
						popup.append($('<ul class="advSearchResults"></ul>'));
					}
					popup.parent().find('.done').click(function() {
						console.log($(this));
					});
				})
		);
		
		tbodyDiv.append($(filterRow)
			.append(codeCell)
			.append(valueCell)
			.append(advSearch)
		);
		
		var row = $(promptDiv).find('[filter-id="' + num + '"]');
		var sumoSelect = row.find('select').SumoSelect({ // Upgrade selectors to use the Sumo Select library
			selectAll : true,
			selectAlltext : '',
			placeholder: 'Filter'
		}); 
		
		// Run query to retrieve possible filter values
		var biQuery = new BIQuery (filter.SubjectArea, [filter.Column], []);
		biQuery.MaxRows = 100;
		$('#mask').css("display", "block"); // Show loading mask
		obiee.runQuery(biQuery, popListLoop(row, filter));
	}
	
	// Apply column selector
	obieeUI.applyColumnSelect = function (selector, visArray, newColID, element) {
		var colIDArray = selector.Columns.map(function(d) { return d.ID; });
		var newCol = selector.Columns.filter(function(d) { return d.ID == newColID; })[0];
		selector.Visuals.forEach(function(i) {
			var vis = visArray.filter(function(d) { return d.ID == i && d.Query.SubjectArea == selector.SubjectArea; })[0];
			var refreshVis = false, replaceColID;

			for (var i=0; i < vis.Query.Criteria.length; i++) {
				if ($.inArray(vis.Query.Criteria[i].ID, colIDArray) > -1) {
					refreshVis = true;
					replaceColID = vis.Query.Criteria[i].ID;
					vis.Query.Criteria[i] = newCol;
				}
			};
			if (refreshVis) {
				for (attr in vis.ColumnMap) {
					var cMap = vis.ColumnMap[attr];
					if (Object.prototype.toString.call( cMap ) == '[object Array]') {
						for (j=0; j < cMap.length; j++) {
							if (cMap[j].ID == replaceColID)
								vis.ColumnMap[attr][j] = newCol;
						}
					} else {
						if (cMap.ID == replaceColID)
							vis.ColumnMap[attr] = newCol;
					}
				}
				obieeUI.renderVisual(vis);
			}
		});
	}
	
	// Scan global filters on the page and update and execute any visualisations
	obieeUI.applyPrompts = function (dbObj, promptDiv) {
		var filters = dbObj.Prompts.Filters, visArray = dbObj.Visuals;
		
		$(promptDiv).find('tbody tr').each(function() {
			var code = $(this).find('.code').attr('col-id');
			var sa = $(this).find('.code').attr('subject-area');
			var value = $(this).find('.value').val() || [];
			dbObj.Prompts.Filters = obieeUI.updateFilterValue(filters, code, sa, 'in', value)
		});
		
		// Loop through visualisations and apply filters if applicable
		for (var i=0; i < visArray.length; i++) {
			var refreshVis = updateVisFilters(visArray[i], filters);
			
			// Execute views if filters have changed
			if (refreshVis)
				obieeUI.renderVisual(visArray[i]);
		};
	}
	
	// Update filter object based on value change
	// Matches on ColumnID and SubjectArea
	obieeUI.updateFilterValue = function(filters, colID, sa, newOp, newValue) {
		for (var i=0; i < filters.length; i++) {
			if (filters[i].ColumnID == colID && filters[i].SubjectArea == sa) {
				filters[i].Operator = newOp;
				filters[i].Value = newValue;
			}
		}
		return filters;
	}
	
	// Function to render a visualisation
	obieeUI.renderVisual = function(vis) {
		$(vis.Container).empty();
		
		// Add loading animation
		$(vis.Container).append($('<div class="loading"></div>')
			.append('<i class="fa fa-circle-o-notch fa-spin fa-3x"></i>')
		);
		obiee.runQuery(vis.Query, renderQueryLoop(vis));
	}
	
	/* ------ END OF PUBLIC UI FUNCTIONS ------ */
	
	/* ------ INTERNAL UI FUNCTIONS ------ */

	// Render generic popup window at an event location
	function renderPopup(event, title) {
		$('#mask').fadeIn(200).children('i').hide();
		var popup = $('<div></div>').addClass('biPopup').css({
			'top' : event.pageY + 'px',
			'left' : event.pageX + 20 + 'px'
		});
		
		popup.append($('<div class="close"></div>')
			.append($('<i class="fa fa-times"></i>')
				.click(hidePopup)
			)
		);
		
		popup.append('<div class="colheader">' + title + '</div>');
		
		popup.append('<div class="body"></div>');
		
		popup.append($('<div class="done"></div>')
			.append($('<i class="fa fa-check fa-2x"></i>')
				.click(hidePopup)
			)
		);
		
		$('#mask').append(popup);
		return popup.find('.body');
	}
	
	function hidePopup() {
		$.when($('#mask').fadeOut(200)).done(function() {
			$('#mask').find('.biPopup').remove();
			$('#mask').children('i').show();
		});
	}
	
	// Wrapper function to execute runQuery asynchronously in a loop and render visualisations based on the index
	function renderQueryLoop(visual) {
		return function(results) {
			data = obiee.mapData(results, visual.ColumnMap); // Map data to visualisation format
			$(visual.Container).empty(); // Clear container
			rmvpp[visual.Plugin].render(data, visual.ColumnMap, visual.Config, $(visual.Container)[0])
		}
	}
	
	// Update visualisation with prompted values
	function updateVisFilters (vis, promptFilters) {
		var refreshVis = false, visNum = vis.ID
		refreshVis = obiee.removePromptedFilters(vis.Query.Filters); // Remove existing explicit global filters
		for (var j=0; j < promptFilters.length; j++) {
			filter = promptFilters[j];

			if (filter.SubjectArea == vis.Query.SubjectArea && filter.Value.length > 0 ) { // Check subject areas match and value is not blank
				refreshVis = true;
				var filterFound = false; // Search for filter on same code and update if found
				origFilters = vis.Query.Filters;
				filterFound = obiee.replaceFilter(origFilters, filter);
				
				if (!filterFound) {
					filter.Global = true;
					vis.Query.Filters.push(filter);
				}
			}
		}
		return refreshVis;
	}
	
	// Wrapper function to populate a Sumo Select with the values of a query
	function popListLoop(row, filter) {
		return function(results) {
			$('#mask').hide();
			var select = row.find('select');
			results.forEach(function(r) {
				select[0].sumo.add(r[filter.Name]); // Add prompt values
			});
			
			var selectValues = [];
			
			filter.Value.forEach(function (val) {
				if (val.Type == 'Variable') {
					query = new BIQuery(filter.SubjectArea, [val]);
					obiee.runQuery(query, function(results) { // Fetch variable value to populate prompt
						selectValues.push(results[0][val.Name]);
						select.val(selectValues); // Need to execute this here as running a query is asynchronous
						select[0].sumo.reload(); // Slightly inefficient, could be better
						sumoSearch(row.find('.SumoSelect'));
					});
				} else
					selectValues.push(val);
			});
			select.val(selectValues);
			select[0].sumo.reload();
			sumoSearch(row.find('.SumoSelect'));
		}
	}
	
	// Adds a Javascript search function to a Sumo Select
	function sumoSearch(sumoSelect) {
		var select = sumoSelect.find('select');
		
		// Create input box
		var selectAll = sumoSelect.find('.select-all');
		selectAll.children('span').first().css('border-right', '1px solid #DDD');
		var filterBox = $('<span>').addClass('biSearch');
		
		filterBox.append(
			$('<input></input').keyup(function() { // Search on key up
				filter = $(this).val().toLowerCase();
				
				var prevFilter = $(this).attr('search-string') || '', search = 'option';
				if (filter.substring(0, filter.length-1) == prevFilter) // Search remaining options if continuing the phrase
					search = 'option:not([disabled])';
				
				$(this).attr('search-string', filter);
				select.find(search).each(function(i) {
					var check = $(this).val().toLowerCase().indexOf(filter); // If value contains search term
					if (check == -1) {
						$(this).prop('disabled', true); // Mark disabled values for optimisation
						sumoSelect.find('.options li[data-val="' + $(this).val() + '"]').hide(); // Hide UI element
					} else {
						$(this).prop('disabled', false); //Unmark active values
						sumoSelect.find('.options li[data-val="' + $(this).val() + '"]').show(); // Show UI element
					}
				});
			})
		);
		selectAll.append(filterBox);
	}
	
	/* ------ END OF INTERNAL UI FUNCTIONS ------ */
	
	/* ------ PUBLIC INTERACTION FUNCTIONS ------ */
	
	// Activate triggers and functions for interactions
	obieeUI.createInteraction = function (interaction) {
		var visElement = interaction.SourceVis.Container;
		interactionData = {}; // Data to be stored in the event handler itself
		interactionData.Action = interaction.Action;
		interactionData.SourceNum = interaction.SourceNum;
		interactionData.Columns = interaction.Columns;
		
		if (interaction.Action == 'drill')
			interactionData.DrillPath = interaction.DrillPath;
		else
			interactionData.TargetNum = interaction.TargetNum;
		
		$(visElement).on(interaction.Trigger, '', interactionData, interaction.Handler); // Use the 'data' object in the jQuery 'on' function to store the mapping
	}
	
	// Remove an interaction from a visualisation container
	obieeUI.removeInteraction = function (container, action) {
		$(container).off(action.Trigger, action.Handler);
	}
	
	// Generate an action handler based on the source and target visualisations and the action type
	obieeUI.generateHandler = function(action, sourceVis, targetVis, passCols) {
		var handler;
		switch (action) { // Switch for general actions that apply to multiple/all plugins
			case('filter'):
				return genFilterHandler(sourceVis, targetVis, passCols);
				break;
			case('drill'):
				return genDrillHandler(sourceVis, targetVis, passCols);
				break;
			case ('log'):
				return function(event, output) { console.log(output); };
				break;
			default:
				// Assumes a function local to the plugin
				return genPrivateHandler(action, sourceVis, targetVis, passCols);
				break;
		}
	}
	
	/* ------ END OF PUBLIC INTERACTION FUNCTIONS ------ */
	
	/* ------ INTERNAL INTERACTION FUNCTIONS ------ */
	
	// Generate a handler to filter queries
	function genFilterHandler(sourceVis, targetVis, passCols) {
		return function(event, output) {
			var container = $('.visualisation[vis-number=' + targetVis.ID + ']');
			
			output = formatOutput(output, passCols, targetVis); // Format output object
			updateFilters(output, targetVis, true);
			
			obieeUI.renderVisual(targetVis);
		}
	}
	
	// Update or add filters on a visualisation using an interaction output object (colArray)
	function updateFilters(colArray, targetVis, global) {
		colArray.forEach(function(colMap) {
			var col = colMap.col;
			var filter = new BIFilter(col, colMap.values, 'in', targetVis.Query.SubjectArea, global);

			// Replace filters
			var filterFound = obiee.replaceFilter(targetVis.Query.Filters, filter);

			if (!filterFound)
				targetVis.Query.Filters.push(filter);
		});
	}
	
	// Update prompt values with interaction output
	function updatePrompt(colArray, prompt) {
		colArray.forEach(function(colMap) {
			prompt.Filters.forEach(function (filter) {
				if (colMap.col.Code == filter.Column.Code)
					filter.Value = colMap.values;
			});
		});
	}
	
	// Apply drilldown
	function applyDrill(path, container, filterVals, crumbs) {
		obiee.loadVis(path, function(dbObj) {
			dbObj.Breadcrumbs = crumbs; // Set breadcrumb trail
			obieeUI.restoreDBLayout(container, dbObj); // Run dashboard
		});
	}
	
	// Generate a handler to drill down to another report
	function genDrillHandler(sourceVis, drillParams, passCols) {
		var sourcePath = drillParams.sourcePath, drillPath = drillParams.targetPath, crumbs = drillParams.breadcrumbs
		return function(event, output) {
			output = formatOutput(output, passCols);
			var breadcrumb = new BIBreadcrumb(sourcePath, drillPath, output);
			crumbs.push(breadcrumb);
			applyDrill(drillPath, $(sourceVis.Container).parent(), output, crumbs);
		}
	}
	
	// Generate a handler for a private action on a plugin
	// Assumes that the target plugin has an overloaded function with the action ID
	function genPrivateHandler(action, sourceVis, targetVis, passCols) {
		return function(event, output) {
			var container = d3.selectAll('.visualisation[vis-number="' + targetVis.ID + '"]');
			output = formatOutput(output, passCols, targetVis); // Format output object
			rmvpp[targetVis.Plugin][action](output, container);
		}
	}
	
	// Formats output object to support passing multiple values from actions
	function formatOutput(output, passCols, targetVis) {
		output = output.filter(function(d) { return $.inArray(d.id, passCols) > -1; }); // Filter unselected columns
		var criteria = d3.set(output.map(function(d) { return d.id; })).values(); // Get unique criteria IDs
		
		// Handle multiple values for a single criteria
		var refactorOutput = [];
		criteria.forEach(function(c) { // Reform output objects to use array of values
			var criterion = output.filter(function(d) { return d.id == c; });
			var values = criterion.map(function(d) { return d.value; });
			
			targetVis = targetVis || {};
			// Set target ID property, the property in the target column map that matches the input column code
			var targetID;
			for (prop in targetVis.ColumnMap) {
				if (targetVis.ColumnMap[prop].Code == criterion[0].col.Code)
					targetID = prop;
			}
			
			refactorOutput.push({ 'sourceId' : c, 'targetId' : targetID, 'col' : criterion[0].col, 'values' : values, 'config' : targetVis.Config});
		});
		output = refactorOutput;
		
		return output;
	}
	
	/* END OF INTERNAL INTERACTION FUNCTIONS */
	
	/* ------ PUBLIC DRAG, DROP AND RESIZE FUNCTIONS ------ */
	
	// Basic drag function
	obieeUI.basicDrag = function(event) {
		var target = event.target;
		
		// Keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// Translate the element
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';				

		// Update the position attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}
	
	// Drag column function. Handles scroll bars on the left pane
	obieeUI.dragWithScrollbar = function(event) {
		var scroll = $('.leftPane').scrollTop();
		var origHeight = $('.leftPane').height();
		$('.leftPane').css('overflow', 'visible');
		if (scroll > 0)
			$('.leftPane').css('margin-top', -1 * scroll + 'px').height(origHeight+scroll);
		var target = event.target,
		// Keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// Translate the element
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';				

		// Update the position attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}
	
	// Snap back to place when done
	obieeUI.snapBack = function(event) {
		$('.leftPane').css('overflow', 'auto').css('margin-top', '0px').css('height', '100%');
		event.target.style.webkitTransform = event.target.style.transform = "";
		event.target.removeAttribute('data-x');
		event.target.removeAttribute('data-y');
	}
	
	// Feedback the possibility of a drop
	obieeUI.dragEnter = function(event) {
		event.target.classList.add('dropTarget');
	}
	
	// Remove the drop feedback style
	obieeUI.dragLeave = function(event) {
		event.target.classList.remove('dropTarget'); 
	}
	
	// Remove active dropzone feedback
	obieeUI.dropDeactivate = function(event) {
		event.target.classList.remove('dropTarget'); 
	}
	
	/* ------ END OF PUBLIC DRAG, DROP AND RESIZE FUNCTIONS ------ */
	
	/* ------ PUBLIC PRINTING FUNCTIONS ------ */
	
	obieeUI.printDB = function(dbElem, filename, type){
		type = type || 'png';
		var visArray = $(dbElem).find('.biPrompt, .visualisation');
		var dfdArray = [], canvasArray = [];
		
		applySVGCSS(); // Apply CSS as attributes for print function
		
		// Loop over visualisations
		$(visArray).each(function(i) {
			var canvasID = 'printCanvas-' + i;
			createParentCanvas(this, canvasID);
			dfdArray.push( // Create visualisation canvases asynchronously
				$.when(printElement($(this), canvasID, 0)).done(function() {
					var canvas = drawVisToMaster(canvasID);
					canvasArray.push(canvas);
				})
			);
		});
		
		// When all rendered, stitch them together
		$.when.apply(null, dfdArray).done(function() {
			// Get overall dashboard size
			dbHeight = d3.max(visArray.map(function(d) { return d3.max([0, +$(this).attr('data-y')]) + $(this).height(); }));
			dbWidth = d3.max(visArray.map(function(d) { return d3.max([0, +$(this).attr('data-x')]) + $(this).width(); }));
			
			createParentCanvas(canvasArray[0], 'printCanvas', dbHeight, dbWidth); // Create master canvas
			var masterCanvas = document.getElementById('printCanvas');
			var ctx = masterCanvas.getContext('2d');
			
			// Ensure background is white
			ctx.rect(0, 0, dbWidth, dbHeight);
			ctx.fillStyle="#FFFFFF";
			ctx.fill();
			
			// Loop through visualisation canvases
			$(canvasArray).each(function() {
				var order = +$(this).attr('id').split('printCanvas-')[1];
				var canvas = document.getElementById($(this).attr('id'));
				var x = d3.max([0, +$(visArray[order]).attr('data-x')]);
				var y = d3.max([0, +$(visArray[order]).attr('data-y')]);
				
				ctx.drawImage(canvas, x, y); // Draw to master at correct location
				$(canvas).remove();
			});
			
			revertSVGCSS();
			switch(type) {
				case 'png':
					saveAsPNG(masterCanvas, filename + '.png'); // Save as PNG
					break;
				case 'pdf':
					saveAsPDF(masterCanvas, filename + '.pdf'); // Save as PDF
					break;
			}
		});
	}
	
	// Function to print a visualisation as an image
	obieeUI.printHTML = function (elem, filename, type) {
		type = type || 'png';
		applySVGCSS();
		$('#printCanvas').remove(); // Remove printing canvas
		createParentCanvas(elem, 'printCanvas') // Add new canvas
		
		// When all asynchronous calls resolved, print the element
		$.when(printElement(elem, 'printCanvas', 0)).done(function() {
			var canvas = drawVisToMaster('printCanvas');
			revertSVGCSS();
			switch(type) {
				case 'png':
					saveAsPNG(canvas, filename + '.png'); // Save as PNG
					break;
				case 'pdf':
					saveAsPDF(canvas, filename + '.pdf'); // Save as PDF
					break;
			}
		});
	}
	
	// Create empty, parent canvas element
	function createParentCanvas(elem, id, height, width) {
		height = height || 0, width = width || 0;
		$(elem).parent().append($('<canvas id="' + id +'"></canvas>')
			.attr('height', height)
			.attr('width', width)
		);
	}
	
	// Save as PNG
	function saveAsPNG(canvas, filename) {
		canvas.toBlob(function(blob) {
			saveAs(blob, filename);
			$(canvas).remove();
		});
	}
	
	// Save as PDF
	function saveAsPDF(canvas, filename) {
		var img = canvas.toDataURL("image/jpeg"); // Rendering PDF as PNG is unnecessarily intensive
		var width, height, ratio = $(canvas).width()/$(canvas).height();
		
		// Scale to page size
		if ($(canvas).width() > 800 || $(canvas).height() > 500) {
			if (ratio < 1.6) { // 1.5 is the ratio of an A4 sheet of paper
				height = 500; // A4 height
				width = height * ratio;
			} else {
				width = 800; // A4 width
				height = width / ratio;	
			}
		} else {
			width = $(canvas).width();
			height = $(canvas).height();
		}
		
		var doc = new jsPDF('landscape', 'pt', 'A4');

		doc.addImage(img, 'JPEG', 20, 20, width, height);
		doc.save(filename);
		$(canvas).remove();
	}
	
	// Apply CSS as attributes for SVG elements for printing only
	function applySVGCSS() {
		var basic = $('.bar-chart, .hbar-chart, .scatter-chart, .line-chart, .pie-chart');
		
		basic.find('text').css({
			'fill': '#333',
			'font-size': '10px',
			'font-family': 'sans-serif'
		});
		
		basic.find('.axis .label').css({
			'font-family': "'Open Sans', Arial",
			'font-size': '12px',
			'font-weight': 'bold'
		});

		basic.find('.axis path, .axis line').css({
			'fill': 'none',
			'stroke': '#666',
			'shape-rendering': 'crispEdges'
		});
		
		basic.find('.legend text.title').css({
			'font-weight': 'bold',
			'text-anchor': 'end'
		});
		
		// The following should be removed/reverted after print
		basic.find('.zoomOut').hide();
	}
	
	// Revert any applied CSS for printing
	function revertSVGCSS() {
		$('.tempCanvas, .canvas-container').remove(); // Remove temporary canvases
		$('.zoomOut').show();
	}
	
	// Prints a DOM tree, recursively checking for SVG elements
	function printElement(elem, canvasID, i) {
		var mainDFD = $.Deferred();
		var dfdArray = []; // Use array of deferred objects to handle multiple levels
		
		// Loop over children
		elem.children().each(function() {
			if(!d3.select(this).classed('do-not-print')) {
				if ($(this).hasClass('print-as-map'))
					dfdArray.push($.when(createCanvas($(this), canvasID, i)));
				else if ($(this).find('svg').length > 0) {
					dfdArray.push(
						$.when(printElement($(this), canvasID, i+1)) // Recurse if SVG found
					); 
				} else {
					dfdArray.push($.when(createCanvas($(this), canvasID, i))); // Create temporary canvases to build into full image
				}
			}
		});

		// Resolve when all recurses complete
		$.when.apply(null, dfdArray).done(function() {
			mainDFD.resolve();
		});
		
		return mainDFD.promise();
	}
	
	// Create canvas elements from Div and SVG elements
	function createCanvas(elem, masterCanvasID, i) {
		var canvasDFD = $.Deferred();
		if (elem.hasClass('print-as-map')) {
			var canvasDFDArray = [$.Deferred(), $.Deferred()];

			var d = new Date();
			var seconds = d.getTime() / 1000;
			
			// Force the tiles to avoid the cache
			elem.find('.leaflet-tile').each(function() {
				$(this).attr('src', $(this).attr('src') + '?' + seconds);
			});
			
			html2canvas(elem[0], { // Special print function for map images using proxy
				noCache: true,
				useCORS: true, 
				logging: false,
				timeout: 1000,
				onrendered: function(tempCanvas) {
					$(tempCanvas)
						.attr('id', 'tempMapCanvas1-' + i + '-' + masterCanvasID)
						.attr('canvas-id', i)
						.addClass('tempMapCanvas')
						.addClass(masterCanvasID);
					$('#'+masterCanvasID).parent().append(tempCanvas);
					canvasDFDArray[0].resolve();
				}
			});
			
			$('#'+masterCanvasID).parent().append('<canvas class="tempMapCanvas ' + masterCanvasID + '" canvas-id="' + i + '" id="tempMapCanvas0-' + i + '-' + masterCanvasID + '"></canvas>');		
			var tempCanvas = new fabric.Canvas('tempMapCanvas0-' + i + '-' + masterCanvasID, {
				 height: elem.height(),
				 width: elem.width()
			});
			
			var serializer = new XMLSerializer();
			var svg = serializer.serializeToString(elem.find('svg')[0]);
			
			var mapOffset;
			
			fabric.loadSVGFromString(svg, function(objects, options) {
				var obj = fabric.util.groupSVGElements(objects, options);
				if (obj.width < elem.width()) {
					mapOffset = 15
					obj.paths.forEach(function(p) {
						p.transformMatrix[4] += mapOffset;
						p.transformMatrix[5] += mapOffset;
					});
				} else {
					mapOffset = Math.floor((obj.width - elem.width())/2);
				}
				tempCanvas.add(obj).renderAll();
				canvasDFDArray[1].resolve();
			});
			
			$.when.apply(null, canvasDFDArray).done(function() {
				$('#'+masterCanvasID).parent().append('<canvas class="tempCanvas ' + masterCanvasID + ' lower-canvas" canvas-id="' + i + '" id="tempCanvas-' + i + '-' + masterCanvasID + '"></canvas>');
				
				$('#tempCanvas-' + i + '-' + masterCanvasID).attr({width: elem.height(), height: elem.width()});
				
				var can1 = document.getElementById('tempMapCanvas1-' + i + '-' + masterCanvasID);
				var can2 = document.getElementById('tempMapCanvas0-' + i + '-' + masterCanvasID);
				var can3 = document.getElementById('tempCanvas-' + i + '-' + masterCanvasID);
				var ctx3 = can3.getContext('2d');
				
				ctx3.drawImage(can1, 0, 0);
				var left = +elem.find('svg').css('margin-left').replace('px', '') || 0;
				var top = +elem.find('svg').css('margin-top').replace('px','') || 0;

				ctx3.drawImage(can2, left-mapOffset, top-mapOffset);
				$(can1).remove(); $(can2).remove();
				canvasDFD.resolve();
			});
		} else if (elem.prop('nodeName').toLowerCase() != 'svg') { // Render HTML elements
			if (elem.css('display') != 'none') { // Don't render if not displayed
				// Convert HTML to canvas using html2canvas
				html2canvas(elem[0], {
					onrendered: function(tempCanvas) {
						$(tempCanvas)
							.attr('id', 'tempCanvas-' + i + '-' + masterCanvasID)
							.attr('canvas-id', i)
							.addClass('tempCanvas lower-canvas')
							.addClass(masterCanvasID);
						$('#'+masterCanvasID).parent().append(tempCanvas);
						canvasDFD.resolve();
					}
				});
			} else 
				canvasDFD.resolve();
		} else { // Render SVG elements
			$('#'+masterCanvasID).parent().append('<canvas class="tempCanvas ' + masterCanvasID + '" canvas-id="' + i + '" id="tempCanvas-' + i + '-' + masterCanvasID + '"></canvas>');		
			var tempCanvas = new fabric.Canvas('tempCanvas-' + i + '-' + masterCanvasID, {
				 backgroundColor: 'rgb(255, 255, 255)',
				 height: elem.height(),
				 width: elem.width()
			});
			
			var serializer = new XMLSerializer();
			var svg = serializer.serializeToString(elem[0]);
			
			fabric.loadSVGFromString(svg, function(objects, options) {
				var obj = fabric.util.groupSVGElements(objects, options);
				tempCanvas.add(obj).renderAll();
				canvasDFD.resolve();
			});
		}
		return canvasDFD.promise();
	}
	
	// Assemble master canvas for a single visualisation from the temporary canvases made by createCanvas
	function drawVisToMaster(masterCanvasID) {
		var canvasArray = $('.tempCanvas.lower-canvas.' + masterCanvasID + '[id]');
		canvasArray = canvasArray.sort(function(a, b) { return +$(a).attr('canvas-id')-$(b).attr('canvas-id'); }) // Sort element array

		var width = d3.max(canvasArray.map(function(d) { return +$(this).attr('width'); }));
		var height = d3.sum(canvasArray.map(function(d) { return +$(this).attr('height'); }));
		
		var masterCanvas = document.getElementById(masterCanvasID);
		$(masterCanvas).attr('width', width).attr('height', height);
		var ctx = masterCanvas.getContext('2d');
		
		var height = 0;
		canvasArray.each(function(i) {
			var tempCanvas = document.getElementById($(this).attr('id'));
			
			ctx.drawImage(tempCanvas, 0, height);
		});
		
		return masterCanvas;
	}
	
	/* ------ END OF PUBLIC PRINTING FUNCTIONS ------ */
	
	return obieeUI;
}(obieeUI || {}))