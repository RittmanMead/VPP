/* 	OBIEE Web Service Interface
	Requirements:
		jquery.min.js [<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>]
		jquery.xml2json.js [Local only]
	Recommended:
		d3.min.js [<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>]
		rmvpp-ext.js [Local only]
*/

// Wrap functions as an object
var obiee = (function(obiee) {
	
	/* ------ WEB SERVICE INTEGRATION ------ */
	
	// Generic web service call
	function wsCall(url, inpData, successFunc) {
		$.ajax({
			url: url,
			type: "POST",
			dataType: "xml",
			data: inpData,
			contentType: "text/xml; charset=\"utf-8\"",
			success: function(response) {
				jsonResponse = $.xml2json(response);
				if ('Fault' in jsonResponse.Body) {  // Catch error
					console.log(jsonResponse.Body.Fault);
					throw 'OBIEE execution error. See above for details.';
				}
				else
					successFunc(response);
			},
			error: function(XMLHttpRequest,textStatus, errorThrown){
			  console.log(errorThrown)
			}
		});
	}
	
	/* ------ END OF WEB SERVICE INTEGRATION ------ */
	
	/* ------ SESSION MANAGEMENT ------ */
	
	// If an OBIEE session ID exists, use it
	var obieeSessionId = getCookie('ORA_BIPS_NQID');
	if (obieeSessionId) {
		sessionStorage.obieeSessionId = obieeSessionId;
	}
	
	// Get URL: assumes you are on the same domain as OBIEE
	// You need to host these files there anyway otherwise there will be cross-origin security issues
	var obieeURL = window.location.href, protocol;
	var re = new RegExp('(http|https):\/\/(.*?)\:(\\d*)');

	if (re.exec(obieeURL)) {
		protocol = re.exec(obieeURL)[1], obieeServer = re.exec(obieeURL)[2], obieePort = re.exec(obieeURL)[3]
		obieeURL = protocol + '://' + obieeServer + ':' + obieePort + '/analytics-ws/saw.dll'
	}

	// Or override manually
	// obieeURL = 'http://obi11-01.moffatt.me:9704/analytics-ws/saw.dll' // Modify to your own environment

	// Connect to OBIEE
	obiee.logon = function (user, pass, successFunc) {
		nQSessionService = obieeURL + '?SOAPImpl=nQSessionService';
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/>';
		soapMessage = soapMessage + '<soapenv:Body><v8:logon><v8:name>' + user + '</v8:name><v8:password>' + pass + '</v8:password></v8:logon>';
		soapMessage = soapMessage + '</soapenv:Body></soapenv:Envelope>'
		
		eraseCookie('ORA_BIPS_NQID','/analytics-ws'); // Remove cookie if it exists (Only possible if HttpOnlyCookies set to false)
		wsCall(nQSessionService, soapMessage, function(response) {
			sessionId = $.xml2json(response).Body.logonResult.sessionID.text;
			sessionStorage.obieeSessionId = sessionId;
			successFunc(response);
		});
	}

	// Get logged-in username
	obiee.getUsername = function (sessionID, successFunc) {
		nQSessionService = obieeURL + '?SOAPImpl=nQSessionService';
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/>';
		soapMessage = soapMessage + '<soapenv:Body><v8:getCurUser><v8:sessionID>' + sessionID + '</v8:sessionID></v8:getCurUser>';
		soapMessage = soapMessage + '</soapenv:Body></soapenv:Envelope>'
		
		wsCall(nQSessionService, soapMessage, function(response) {
			username = $.xml2json(response).Body.getCurUserResult['return'].text;
			successFunc(username);
		});
	}

	// Logout from OBIEE
	// To properly logout, the ORA_BIPS_NQID (path=/analytics-ws) cookie must be removed. This is only possible if it is not HTTP Only
	// <HttpOnlyCookies/> can be set to false under <Security/> in instanceconfig.xml
	obiee.logoff = function (sucessFunc) {
		nQSessionService = obieeURL + '?SOAPImpl=nQSessionService';
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:logoff><v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:logoff></soapenv:Body></soapenv:Envelope>';
		eraseCookie('ORA_BIPS_NQID','/analytics-ws');
		wsCall(nQSessionService, soapMessage, function(response) {
			sessionStorage.removeItem('obieeSessionId');
			sucessFunc(response);
		});
	}

	/* ------ END OF SESSION MANAGEMENT ------ */
	
	
	/* ------ PUBLIC METADATA FUNCTIONS ------ */
	
	// Fetch subject areas
	obiee.getSubjectAreas = function(successFunc) {
		metadataService = obieeURL + '?SOAPImpl=metadataService';
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:getSubjectAreas><v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:getSubjectAreas></soapenv:Body></soapenv:Envelope>';
		wsCall(metadataService, soapMessage, function(response) {
			outputData = $.xml2json(response);
			outputData = outputData.Body.getSubjectAreasResult.subjectArea;
			if (Object.prototype.toString.call( outputData ) === '[object Object]') {
				outputData = [outputData];
			}
			successFunc(outputData);
		})
	}

	// Fetch tables and columns for given subject area
	obiee.getTablesAndCols = function(subjectArea, successFunc) {
		metadataService = obieeURL + '?SOAPImpl=metadataService';
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:describeSubjectArea>';
		soapMessage = soapMessage + '<v8:subjectAreaName>' + subjectArea + '</v8:subjectAreaName>';
		soapMessage = soapMessage + '<v8:detailsLevel>IncludeTablesAndColumns</v8:detailsLevel>';
		soapMessage = soapMessage + '<v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:describeSubjectArea></soapenv:Body></soapenv:Envelope>';
		wsCall(metadataService, soapMessage, function(response) {
			outputData = $.xml2json(response);
			outputData = outputData.Body.describeSubjectAreaResult.subjectArea.tables;
			if (Object.prototype.toString.call( outputData ) === '[object Object]') {
				outputData = [outputData];
			}
			var biObject = parseTablesAndCols(subjectArea, outputData);
			successFunc(biObject);
		})
	}

	// Parse presentation information into flat object array of columns
	function parseTablesAndCols(subjectArea, tabColData) {
		var presObj = {}, tableObj = {}, allColObj = {};
		
		for (var i=0; i < tabColData.length; i++) {
			var tabCol = {};
			
			columns = tabColData[i].columns;
			if (typeof(columns) === "undefined")
				columns = [];
			
			if (Object.prototype.toString.call( columns ) === '[object Object]')
				columns = [columns];
			
			for (var j=0; j < columns.length; j++) {
				tableName = tabColData[i].name.substring(1, tabColData[i].name.length-1);
				col = new BIColumn(tabColData[i].name + '.' + columns[j].name, columns[j].displayName, columns[j].dataType, tableName, columns[j].aggrRule);
				allColObj[tableName+'.'+col["Name"]] = col;
				tabCol[col["Name"]] = col;
			}
			
			if (tabColData[i].parentTableName == "") {
				table = new BITable(tabColData[i].name, tabColData[i].displayName, tabCol);
				tableObj[table["Name"]] = table;
			} else {
				parent = tabColData[i].parentTableName.substring(1, tabColData[i].parentTableName.length-1);
				findParent(tableObj, tabCol, tabColData[i], parent); // Recursively assign child tables to parent
			}
		}
		
		presObj = new BIPres(subjectArea, allColObj, tableObj);
		return presObj;
	}

	/* ------ END OF METADATA FUNCTIONS ------ */
	
	/* ------ INTERNAL METADATA FUNCTIONS ------ */
	
	// Recursively find parent presentation table in a table object
	function findParent(tableObj, tabColObj, tabColRaw, parent) {
		var found = false;
		for (key in tableObj) {
			if (parent == key) {
				table = new BITable(tabColRaw.name, tabColRaw.displayName, tabColObj, parent);
				tableObj[table["Parent"]]["Children"][table["Name"]] = table;
			} else {
				findParent(tableObj[key].Children, tabColObj, tabColRaw, parent);
			}
		}
		return tableObj;
	}
	
	/* ------ END OF INTERNAL METADATA FUNCTIONS ------ */
	
	
	/* ------ PUBLIC EXECUTION FUNCTIONS ------ */
	
	// Execute query based on an arrays of column and filter objects (Change to XML for 11.1.1.7 and below).
	obiee.runQuery = function(biQuery, successFunc) {
		// XML execution is inferior in 11.1.1.9 and above
		// var xml = buildXML(biQuery);
		// executeXML(xml, successFunc, biQuery);
		
		// If multiple filters exist, assemble into a group
		if (biQuery.Filters.length > 1)
			biQuery.Filters = [new BIFilterGroup(biQuery.Filters, 'and')];
		
		// Convert any variables into column objects
		biQuery.Criteria.forEach(function(col) {
			if (col.Type == 'Variable')
				col = new BIColumn (col.Code, col.Name);
		});
		
		var lsql = buildLSQL(biQuery);
		obiee.executeLSQL(lsql, successFunc, biQuery);
	}
	
	// Run as XML
	obiee.runXMLQuery = function(biQuery, successFunc) {
		var xml = buildXML(biQuery);
		executeXML(xml, successFunc, biQuery);
	}
	
	// Run as LSQL
	obiee.runLSQLQuery = function(biQuery, successFunc) {
		var lsql = buildLSQL(biQuery);
		obiee.executeLSQL(lsql, successFunc, biQuery);
	}
	
	// Execute XML query from file
	obiee.executeXMLFile = function(xmlFile, successFunc) {
		$.ajax({
			url: xmlFile,
			type: "GET",
			dataType: "xml",
			success: function(results) {
				executeXML(results, successFunc);
			}
		});
	}
	
	// Execute LSQL - will NOT respect decimals, use executeXML to workaround
	obiee.executeLSQL = function(lsql, successFunc, biQuery) {
		biQuery = biQuery || ""; // Set to null if unspecified
		
		// Escape special characters
		lsql = lsql.replace('&', '&amp;');
		lsql = lsql.replace('<', '&lt;');
		lsql = lsql.replace('>', '&gt;');
		
		xmlViewService = obieeURL + '?SOAPImpl=xmlViewService';
		soapMessage =  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:executeSQLQuery><v8:sql>' + lsql + '</v8:sql>';
		soapMessage = soapMessage + '<v8:outputFormat>SAWRowsetData</v8:outputFormat><v8:executionOptions><v8:async>FALSE</v8:async>';
		soapMessage = soapMessage + '<v8:maxRowsPerPage>1000000</v8:maxRowsPerPage><v8:refresh>TRUE</v8:refresh><v8:presentationInfo>FALSE</v8:presentationInfo>';
		soapMessage = soapMessage + '<v8:type>query</v8:type></v8:executionOptions><v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:executeSQLQuery></soapenv:Body></soapenv:Envelope>';
		
		wsCall(xmlViewService, soapMessage, function(response) {
			outputData = $.xml2json(response);
			outputData = $.xml2json(outputData.Body.executeSQLQueryResult["return"].rowset).Row;
			if (Object.prototype.toString.call( outputData ) === '[object Object]') {
				outputData = [outputData];
			}
			
			// Map output in accordance with input BIQuery criteria names
			if (biQuery != "")
				outputData = mapResults(biQuery, outputData);
			
			successFunc(outputData);
		});
	}
	
	/* ------ END OF PUBLIC EXECUTION FUNCTIONS ------ */
	
	/* ------ INTERNAL QUERY FUNCTIONS ------ */
	
	// Map column names to output result set
	function mapResults(biQuery, outputData) {
		if (typeof(outputData) === 'undefined') {
			outputData = [];
		} else {
			for (var i=0; i < outputData.length; i++) {
				var j=0;
				for (key in outputData[i]) {
					outputData[i] = renameProperty(outputData[i], key, biQuery.Criteria[j].Name)
					j++;
				}
			}
		}
		return outputData;
	}
	
	// Build Logical SQL from BIQuery object
	function buildLSQL(biQuery) {
		var lsql = 'SELECT\n';
		
		lsql += biQuery.Criteria.map(function(d) {return d.Code;}).join(',\n');
		lsql += '\nFROM "' + biQuery.SubjectArea + '"';
		
		if (biQuery.Filters.length > 0)
			lsql += '\nWHERE\n' + buildFilterLSQL(biQuery.Filters);
	
		lsql += '\nORDER BY '
		if (biQuery.Sort.length == 0)
			lsql += biQuery.Criteria.map(function(d, i) { return (i+1) + ' asc NULLS LAST'; }).join(', ');
		else {
			var sortArray = [];
			for (var i=0; i < biQuery.Sort.length; i++) {
				var position = biQuery.Criteria.map(function(d, j) { if (biQuery.Sort[i].Column.Name == d.Name) return j+1; }); // Get position within array
				position = position.filter(function (d) {return typeof(d) != 'undefined';})[0]; // Reduce array to single element
				sortArray.push(position + ' ' + biQuery.Sort[i].Direction + ' NULLS LAST'); // Build LSQL
			}
			lsql += sortArray.join(', ');
		}
		
		lsql += '\nFETCH FIRST ' + biQuery.MaxRows + ' ROWS ONLY';
		
		return lsql;
	}
	
	// Build LSQL for filters
	function buildFilterLSQL(filters, groupOp) {
		var groupOp = groupOp || '';
		var lsqlArray = [];
		
		for (var i=0; i < filters.length; i++) {
			var filter = filters[i], lsql = "";
			if (filter.Type == 'Filter') {
				
				// Escape single quotes in value
				var value;
				if (typeof(filter.Value) == 'string') // Allow both strings and arrays (for IN/NOT IN)
					value = filter.Value.replace("'", "''"); 
				else {
					value = [];
					filter.Value.forEach(function(f) {
						if (f.Type == 'Variable')
							value.push(f.Code);
						else
							value.push(f.replace("'", "''"));
					});
				}
				
				var valueQuoted = value; // Put quotes around string values
				switch(filter.DataType) {
					case 'string':
						valueQuoted = "'" + value + "'";
						break;
					case 'date':
						valueQuoted = "date '" + value + "'";
						break;
				}
				
				switch(filter.Operator) {
					case('equal'):
						lsql = filter.Code + ' = ' + valueQuoted;
						break;
					case ('notEqual'):
						lsql = filter.Code + ' <> ' + valueQuoted;
						break;
					case ('in'):
						lsql = filter.Code + ' in ' + buildInString(filter);
						break;
					case ('notIn'):
						lsql = filter.Code + ' not in ' + buildInString(filter);
						break;
					case ('greater'):
						lsql = filter.Code + ' > ' + valueQuoted;
						break;
					case ('greaterOrEqual'):
						lsql = filter.Code + ' >= ' + valueQuoted;
						break;
					case ('less'):
						lsql = filter.Code + ' < ' + valueQuoted;
						break;
					case ('lessOrEqual'):
						lsql = filter.Code + ' <= ' + valueQuoted;
						break;
					case ('like'):
						lsql = filter.Code + ' LIKE ' + valueQuoted;
						break;
					case ('contains'):
						lsql = filter.Code + ' LIKE ' + "'%" + value + "%'";
						break;
					case ('starts'):
						lsql = filter.Code + ' LIKE ' + "'" + value + "%'";
						break;
					case ('ends'):
						lsql = filter.Code + ' LIKE ' + "'%" + value + "'";
						break;
					default:
						throw 'Unexpected operator "' + filter.Operator + '". LSQL could not be generated.';
						break;
				}
			} else
				lsql = '(' + buildFilterLSQL(filters[i].Filters, filters[i].Operator) + ')';
			lsqlArray.push(lsql);
		}
		lsql = lsqlArray.join(' ' + groupOp + ' ');
		return lsql;
	}
	
	// Build LSQL string for IN/NOT IN filters
	function buildInString(filter) {
		var valueArray = filter.Value; // Expects array of values for 'in' filters
		if (typeof(filter.Value) == 'string') // If input is a string, split by ;
			valueArray = filter.Value.split(';');
		
		switch(filter.DataType) {
			case 'string':
				valueArray = valueArray.map(function(d) {
				if (d.Type == 'Variable')
						return d.Code;
					else
						return "'" + d + "'";
				});
				break;
			case 'date':
				valueArray = valueArray.map(function(d) {
				if (d.Type == 'Variable')
						return d.Code;
					else
						return "date '" + d + "'";
				});
			break;
		}
		
		return '(' + valueArray.join(', ') + ')';
	}
	
	// Get short operator for a filter
	function getShortOperator(operator) {
		var op;
		
		switch(operator) {
			case('equal'):
				op = '=';
				break;
			default:
				op = '';
				break;
		}
		
		return op;
	}
	
	/* ------ END OF INTERNAL QUERY FUNCTIONS ------ */
	
	/* ------ PUBLIC WEBCAT FUNCTIONS ------ */
	
	// Save BIQuery object as an analysis in the Web Catalogue
	obiee.saveQuery = function (biQuery, path, successFunc) {
		var xml = buildXML(biQuery);
		saveXML(xml, path, successFunc);
	}
	
	// Return a BIQuery object from an existing analysis
	obiee.loadQuery = function(path, successFunc) {
		webcatService = obieeURL + '?SOAPImpl=webCatalogService';
		soapMessage =  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:readObjects><v8:paths>';
		soapMessage = soapMessage + path + '</v8:paths><v8:resolveLinks>FALSE</v8:resolveLinks><v8:errorMode>FullDetails</v8:errorMode><v8:returnOptions>ObjectAsString</v8:returnOptions>';
		soapMessage = soapMessage + '<v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:readObjects></soapenv:Body></soapenv:Envelope>';
		
		loadXML(path, function(analysisObj) {
			subjectArea = analysisObj.criteria.subjectArea.substring(1, analysisObj.criteria.subjectArea.length-1); // Get subject area
			columns = analysisObj.criteria.columns.column;
			if (Object.prototype.toString.call( columns ) === '[object Object]')
				columns = [columns];
			
			// Process columns
			var biCols = [];
			for (var i=0; i < columns.length; i++) {
				expr = columns[i].columnFormula.expr.text;
				if ('columnHeading' in columns[i]) {
					name = columns[i].columnHeading.caption.text[0];
				} else {
					var re = new RegExp('".*?".".*?"');
					columnNames = expr.match(re);
					
					name = expr;
					for (var j=0; j < columnNames.length; j++) {
						re = new RegExp('".*?"."(.*?)"');
						displayName = re.exec(columnNames[j])[1];
						name = name.replace(columnNames[j], displayName);
					}
				}
				var col = new BIColumn(expr, name);
				biCols.push(col);
			}
			
			// Define filter
			if ('filter' in analysisObj.criteria) {
				filter = analysisObj.criteria.filter.expr;
				filter = [convertFilter(filter)];
			}
			else
				filter = [];
			
			var biQuery = new BIQuery(subjectArea, biCols, filter); // Setup BIQuery object
			successFunc(biQuery);
		});
	}
	
	/* ------ END OF PUBLIC WEBCAT FUNCTIONS ------ */
		
	/* ------ INTERNAL WEBCAT FUNCTIONS ------ */
	
	// Save XML back to the Webcat
	function saveXML(xml, path, successFunc) {
		webcatService = obieeURL + '?SOAPImpl=webCatalogService';
		soapMessage =  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:writeObjects><v8:catalogObjects><v8:catalogObject>';
		soapMessage = soapMessage + '<![CDATA[<?xml version="1.0"?>' + xml + ']]>';
		soapMessage = soapMessage + '</v8:catalogObject><v8:itemInfo><v8:path>' + path;
		soapMessage = soapMessage + '</v8:path><v8:type>Object</v8:type><v8:signature>queryitem1</v8:signature></v8:itemInfo>';
		soapMessage = soapMessage + '</v8:catalogObjects><v8:allowOverwrite>TRUE</v8:allowOverwrite><v8:createIntermediateDirs>TRUE</v8:createIntermediateDirs><v8:errorMode>FullDetails</v8:errorMode>';
		soapMessage = soapMessage + '<v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:writeObjects></soapenv:Body></soapenv:Envelope>';
		
		wsCall(webcatService, soapMessage, function(response) {
			jsonResponse = $.xml2json(response);
			result = jsonResponse.Body.writeObjectsResult;
			if (typeof(result) == 'object')
				throw result.errorInfo.message;
			successFunc(response);
		});
	}
	
	// Load XML from a Webcat path
	function loadXML(path, successFunc) {
		webcatService = obieeURL + '?SOAPImpl=webCatalogService';
		soapMessage =  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:readObjects><v8:paths>';
		soapMessage = soapMessage + path + '</v8:paths><v8:resolveLinks>FALSE</v8:resolveLinks><v8:errorMode>FullDetails</v8:errorMode><v8:returnOptions>ObjectAsString</v8:returnOptions>';
		soapMessage = soapMessage + '<v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:readObjects></soapenv:Body></soapenv:Envelope>';
		
		wsCall(webcatService, soapMessage, function(response) {
			rawResponse = $.xml2json(response);
			analysisObj = rawResponse.Body.readObjectsResult.catalogObject.catalogObject
			
			// Throw error if object does not exist
			if (analysisObj == "") {
				throw 'OBIEE Load Query Error: ' + rawResponse.Body.readObjectsResult.catalogObject.errorInfo.message;
			}
			
			analysisObj = $.xml2json(analysisObj);
			successFunc(analysisObj);
		});
	}
	
	// Build dependencies HTML, ignoring duplicates
	function dependencyHTML(visArray) {
		var html = '', allDeps = [];
		
		// Standard dependencies
		html += '<script src="/web-api/js/lib/jquery.min.js"></script>\n';
		html += '<script src="/web-api/js/lib/jquery.xml2json.js"></script>\n';
		html += '<script src="/web-api/js/lib/d3.min.js"></script>\n';
		html += '<script src="/web-api/js/rmvpp-ext.js"></script>\n';
		html += '<script src="/web-api/js/obieeUI.js"></script>\n\n';
		html += '\n<script src="/web-api/js/obiee-v8.js"></script>\n';
		html += '<link	rel="stylesheet" type="text/css" href="/web-api/css/obiee.css">\n';
		html += '\n<script src="/web-api/js/pluginAPI.js"></script>\n';
		html += '<link	rel="stylesheet" type="text/css" href="/web-api/css/pluginAPI.css">\n';
		html += '\n<script src="/web-api/js/lib/jquery.sumoselect.min.js"></script>\n';
		html += '<link	rel="stylesheet" type="text/css" href="/web-api/css/lib/sumoselect.css">\n';
		html += '\n<!-- Fonts -->\n';
		html += '<link href="http://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css">\n';
		html += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">\n';
		
		for (var i=0; i < visArray.length; i++) {
			deps = rmvpp[visArray[i].Plugin].dependencies;

			for (var j=0; j < deps.js.length; j++) {
				var dep = '<script src="' + deps.js[j] + '"></script>\n';
				if ($.inArray(dep, allDeps) == -1) { // Check if dependency already included
					html += dep;
					allDeps.push(dep);
				}
			}
			
			if ('css' in deps) {
				for (var j=0; j < deps.css.length; j++ ) {
					var dep = '<link rel="stylesheet" type="text/css" href="' + deps.css[j] + '">\n';
					if ($.inArray(dep, allDeps) == -1) { // Check if dependency already included
						html += dep;
						allDeps.push(dep);
					}
				}
			}
		}
		
		return html;		
	}
	
	// Build visualisation HTML
	function visualisationHTML(dbObj) {
		var html = '', visArray = dbObj.Visuals
		var hasFilters = !$.isEmptyObject(dbObj.Prompts)
		var hasInts = dbObj.Interactions.length > 0;
		var hasDrills = dbObj.Drilldowns.length > 0;
		var hasSelectors = dbObj.Selectors.length > 0;
		var hasUtilities = dbObj.Utilities.length > 0;
		html += '\n<div id="rmvppContainer" style="white-space: nowrap; z-index: 0;"></div>'; // Container div
		
		var visMap = {}; // Map new vis number with original ones
		
		html += '\n<script id="rmvppLogic">'; // Main script tag
		
		// JS object for visualisations
		html += '\n\n\tvar biVisArray = [], biSelectors = [], biInteractions = [], biDrilldowns = [], biUtilities = [], biPrompt = {}, biDB = new BIDashboard();';
		for (var i=0; i < visArray.length; i++) {
			var inc = i+1;
			visArray[i].ID = i; // Reset ID
			html += '\n\t' + '/* Visualisation ' + inc + ' */ var biVis' + inc + ' = ' + JSON.stringify(visArray[i]) + '/* End of Visualisation ' + inc + ' */'; // JS object
			
			// Create new visualisation object
			html += '\n\tvar vis = new BIVisual(biVis' + inc + '.Plugin, biVis' + inc + '.Config, biVis' + inc + '.ColumnMap, biVis' + inc + '.Query, biVis' + inc + '.X, biVis' + inc + '.Y, biVis' + inc + '.ID);';
			
			html += '\n\tbiVisArray.push(vis);';
		}
		
		html += '\n\n\tbiDB.Visuals = biVisArray;';
		
		// JS for global filters
		if (hasFilters) {
			html += '\n';
			html += '\n\t' + '/* Global Filter */ biPrompt = ' + JSON.stringify(dbObj.Prompts) + '/* End of Global Filter */'; // JS object
			
			html += '\n\n\tbiDB.Prompts = biPrompt;';
		}
		
		// JS for selectors
		if (hasSelectors) {
			html += '\n';
			
			for (var i=0; i < dbObj.Selectors.length; i++) {
				var inc = +i+1, search;
				
				html += '\n\t' + '/* Selector ' + inc + ' */ var biSel' + inc + ' = ' + JSON.stringify(dbObj.Selectors[i]) + '/* End of Selector ' + inc + ' */'; // JS object
				html += '\n\t' + 'biSelectors.push(biSel' + inc + ');';
			}
			html += '\n\n\tbiDB.Selectors = biSelectors;';
		}
		
		// JS for interactions
		if (hasInts) {
			html += '\n';
			
			// Rebuild interaction objects rather than storing them as with others
			// This is because interaction objects contain superfluous information that needn't be stored twice
			for (var i=0; i < dbObj.Interactions.length; i++) {
				var inc = i+1;

				// Explicitly store a cut-down information object
				var simpleInteract = {
					'Trigger' : dbObj.Interactions[i].Trigger,
					'SourceNum' : dbObj.Interactions[i].SourceNum,
					'TargetNum' : dbObj.Interactions[i].TargetNum,
					'Action' : dbObj.Interactions[i].Action,
					'Columns' : dbObj.Interactions[i].Columns
				}
				
				html += '\n\t/* Interaction ' + inc + ' */ var biInt' + inc + ' = ' + JSON.stringify(simpleInteract) + '/* End of Interaction ' + inc + ' */'; // JS object
				
				// Create new BIInteraction object
				html += '\n\tinteraction = new BIInteraction ("' + dbObj.Interactions[i].Trigger + '", ';
				html += 'biVisArray[' + dbObj.Interactions[i].SourceNum + '], ';
				html += 'biVisArray[' + dbObj.Interactions[i].TargetNum + '], ';
				html += '"' + dbObj.Interactions[i].Action + '", ';
				html += 'biInt' + inc + '.Columns);';
				
				html += '\n\tbiInteractions.push(interaction);\n';
			}
			
			html += '\n\tbiDB.Interactions = biInteractions;';
		}
		
		if (hasDrills) {
			html += '\n';
			
			// Rebuild interaction objects rather than storing them as with others
			// This is because interaction objects contain superfluous information that needn't be stored twice
			for (var i=0; i < dbObj.Drilldowns.length; i++) {
				var inc = i+1;
				
				// Explicitly store a cut-down information object
				var simpleDrill = {
					'Trigger' : dbObj.Drilldowns[i].Trigger,
					'SourceNum' : dbObj.Drilldowns[i].SourceNum,
					'DrillPath' : dbObj.Drilldowns[i].DrillPath,
					'Columns' : dbObj.Drilldowns[i].Columns
				}
				
				html += '\n\t/* Drilldown ' + inc + ' */ var biDrill' + inc + ' = ' + JSON.stringify(simpleDrill) + '/* End of Drilldown ' + inc + ' */'; // JS object
				
				html += '\n\tdrill = new BIDrilldown (biDrill' + inc + '.Trigger, biVisArray[biDrill' + inc + '.SourceNum], biDrill' + inc + '.DrillPath, biDrill' + inc + '.Columns, "' + dbObj.Path + '");'
				html += '\n\tbiDrilldowns.push(drill);\n';
			}
			html += '\n\tbiDB.Drilldowns = biDrilldowns;';
		}
		
		// Store utilities
		if (hasUtilities) {
			html += '\n';
			
			for (var i=0; i < dbObj.Utilities.length; i++) {
				var inc = i+1;
				
				html += '\n\t/* Utility ' + inc + ' */ var biUtility' + inc + ' = ' + JSON.stringify(dbObj.Utilities[i]) + '/* End of Utility ' + inc + ' */'; // JS object
				html += '\n\tbiDB.Utilities.push(biUtility' + inc + ');'
			}
		}
		
		html += '\n\tobieeUI.restoreDBLayout($("#rmvppContainer"), biDB)';
		html += '\n</script>'; // Close for #rmvppLogic
		return html;
	}
	
	// Convert report XML to BIFilter objects
	function convertFilter(filter) {
		if (filter["xsi:type"] != 'sawx:logical') {
			code = filter.expr[0].text;
			value = filter.expr[1].text;
			type = filter.expr[1]["xsi:type"].replace('xsd:','');
			biFilter = new BIFilter(code, value, filter.op, type);
			return biFilter;
		} else {
			var subFilter = filter.expr;
			var filterList = [];
			for (var j=0; j < subFilter.length; j++) {
				filterList.push(convertFilter(subFilter[j]));
			}
			var biFilterGroup = new BIFilterGroup(filterList, filter.op);
			return biFilterGroup;
		}
	}
	
	/* ------ END OF WEBCAT FUNCTIONS ------ */
	
	/* ------ PUBLIC RMVPP FUNCTIONS ------ */
	
	// Function to rename data properties based on column map for a specific visualisation
	obiee.mapData = function(data, columnMap) {
		for (var i=0; i < data.length; i++) {
			for (prop in columnMap) {
				if (Object.prototype.toString.call( columnMap[prop] ) === '[object Array]') { // For grouped attributes, transform to sub-array
					var valueArray = [];
					for (var j=0; j < columnMap[prop].length; j++) {
						value = {'name' : columnMap[prop][j].Name, 'value' : data[i][columnMap[prop][j].Name]}
						valueArray.push(value);
					}
					data[i][prop] = valueArray;
				} else {
					if ('Name' in columnMap[prop])
						data[i] = renameProperty(data[i], columnMap[prop].Name, prop);
				}
			}
		}
		return data;
	}

	// Saves a visualisation to the catalogue as static text
	obiee.saveVis = function(dbObj, path, successFunc) {
		// Build HTML script to generate full visualisation
		var html = '';
		dbObj.Path = path;
		html += dependencyHTML(dbObj.Visuals);
		
		// Hide report links in OBIEE
		html += '<style>#o\\:portalgo\\~r\\:reportLinks { display: none; }</style>';
		html += '<style>#o\\:preview\\~r\\:reportLinks { display: none; }</style>';
		html += '<style>#o\\:viewpreview\\~r\\:reportLinks { display: none; }</style>';
		
		html += visualisationHTML(dbObj);
		
		var staticHTMLView = buildHTMLViewXML(html);
		
		// Set the HTML view as the compound layout
		var compoundView = '<saw:view xsi:type="saw:compoundView" name="compoundView!1">';
		compoundView += '<saw:cvTable><saw:cvRow><saw:cvCell viewName="rmvppView"/></saw:cvRow>';
		compoundView += '</saw:cvTable></saw:view>';
		
		var stockQuery = new BIQuery(dbObj.Visuals[0].Query.SubjectArea, dbObj.Visuals[0].Query.Criteria); // No need for filters or sort
		var xml = buildXML(stockQuery, [staticHTMLView, compoundView]) // Use the first visualisation as the criteria. Arbitrary here anyway.
		saveXML(xml, path, successFunc);
	}
	
	// Loads a visualisation from the catalogue as a BIVisual object
	obiee.loadVis = function(path, successFunc) {
		var html;
		loadXML(path, function(analysisObj) {
			// Get the RMVPP view
			for (var i=0; i < analysisObj.views.view.length; i++) {
				view = analysisObj.views.view[i];
				if (view.name == 'rmvppView') {
					html = view.staticText.caption.text[0];
				}
			}
			
			// Search for visualisations
			var numMatches, visArray = [], selectorArray = [], filterObj = {}, interactions = [], drilldowns = [], utilities = [];
			numMatches = html.match(/\/\* Visualisation /g);
			if ($.isEmptyObject(numMatches))
				throw 'No RMVPP Visualisation found in: ' + path;
			else
				numMatches = numMatches.length;
			
			// Loop over visualisations
			for (var i=0; i < numMatches; i++) {
				var inc = i+1;
				re = new RegExp('\/\\* Visualisation ' + inc + ' \\*\/.* = (.*?)\/\\* End of Visualisation ' + inc + ' \\*\/'); // Extract the BIVisual object using regex

				if (re.exec(html)) { 
					visObj = re.exec(html)[1];
					visObj = JSON.parse(visObj);
					visObj = new BIVisual(visObj.Plugin, visObj.Config, visObj.ColumnMap, visObj.Query, visObj.X, visObj.Y, visObj.ID);
					visArray.push(visObj);
				} else
					throw 'No RMVPP Visualisation script found in vis: ' + i;
			}
			
			// Search for global filters
			re = new RegExp('\/\\* Global Filter \\*\/.* = (.*?)\/\\* End of Global Filter \\*\/'); // Extract filter object using regex
			if (!$.isEmptyObject(re.exec(html))) {
				filterObj = re.exec(html)[1];
				filterObj = JSON.parse(filterObj);
			}
			
			// Column Selectors
			numMatches = html.match(/\/\* Selector /g);
			if (!$.isEmptyObject(numMatches)) {
				for (var i=0; i < numMatches.length; i++) {
					var inc = +i+1;
					re = new RegExp('\/\\* Selector ' + inc + ' \\*\/.* = (.*?)\/\\* End of Selector ' + inc + ' \\*\/'); // Extract the interaction object using regex
					var selector;
					if (re.exec(html)) {
						selector = re.exec(html)[1];
						selector = JSON.parse(selector);
						selectorArray.push(selector);
					}
				}
			}
			
			// Interactions
			numMatches = html.match(/\/\* Interaction /g);
			if (!$.isEmptyObject(numMatches)) {
				for (var i=0; i < numMatches.length; i++) {
					var inc = i+1;
					re = new RegExp('\/\\* Interaction ' + inc + ' \\*\/.* = (.*?)\/\\* End of Interaction ' + inc + ' \\*\/'); // Extract the interaction object using regex
					
					var interaction;
					if (re.exec(html)) {
						interaction = re.exec(html)[1];
						interaction = JSON.parse(interaction);
						interaction = new BIInteraction(interaction.Trigger, visArray[interaction.SourceNum], visArray[interaction.TargetNum], interaction.Action, interaction.Columns);
						interactions.push(interaction);
					}
				}
			}
			
			// Drilldowns
			numMatches = html.match(/\/\* Drilldown /g);
			if (!$.isEmptyObject(numMatches)) {
				for (var i=0; i < numMatches.length; i++) {
					var inc = i+1;
					re = new RegExp('\/\\* Drilldown ' + inc + ' \\*\/.* = (.*?)\/\\* End of Drilldown ' + inc + ' \\*\/'); // Extract the interaction object using regex
					
					var drilldown;
					if (re.exec(html)) {
						drilldown = re.exec(html)[1];
						drilldown = JSON.parse(drilldown);
						drilldown = new BIDrilldown(drilldown.Trigger, visArray[drilldown.SourceNum], drilldown.DrillPath, drilldown.Columns, path);
						drilldowns.push(drilldown);
					}
				}
			}
			
			// Utilities
			numMatches = html.match(/\/\* Utility /g);
			if (!$.isEmptyObject(numMatches)) {
				for (var i=0; i < numMatches.length; i++) {
					var inc = i+1;
					re = new RegExp('\/\\* Utility ' + inc + ' \\*\/.* = (.*?)\/\\* End of Utility ' + inc + ' \\*\/'); // Extract the interaction object using regex
					
					var utility;
					if (re.exec(html)) {
						utility = re.exec(html)[1];
						utility = JSON.parse(utility);
						utility = new BIUtility(utility.Utility, utility.X, utility.Y);
						utilities.push(utility);
					}
				}
			}
			
			var dbObj = new BIDashboard(visArray, filterObj, interactions, selectorArray, drilldowns, path, [], utilities);
			successFunc(dbObj);
		});
	}
	
	/* ------ END OF PUBLIC RMVPP FUNCTIONS ------ */
	
	/* ------ INTERNAL XML OPERATIONS ------ */
	
	// Build XML report from BIQuery object
	// Necessary to execute as XML on older versions due to decimal issue
	// Can accept an array of XML strings for views to be inserted
	function buildXML(biQuery, viewsXML) {
		var subjectArea = biQuery.SubjectArea
		var colObjs = biQuery.Criteria
		var filters = biQuery.Filters || [];
		var sort = biQuery.Sort || [];
		var views = viewsXML || [];
		var xml = '<saw:report xmlns:saw="com.siebel.analytics.web/report/v1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlVersion="201201160" xmlns:sawx="com.siebel.analytics.web/expression/v1.1">';
		xml += '<saw:criteria xsi:type="saw:simpleCriteria" subjectArea="&quot;' + subjectArea + '&quot;">';
		
		// Build column tags
		if (colObjs.length == 0)
			throw 'Cannot build XML: No columns passed.'
		
		xml += '<saw:columns>';
		for (var i=0; i < colObjs.length; i++) {
			xml += '<saw:column xsi:type="saw:regularColumn" columnID="c' + i + '">';
			xml += '<saw:columnFormula><sawx:expr xsi:type="sawx:sqlExpression">';
			xml += colObjs[i].Code;
			xml += '</sawx:expr></saw:columnFormula></saw:column>';
		}
		xml += '</saw:columns>';
		xml += buildFilterXML(filters);
		xml += buildSortXML(sort, colObjs);
		xml += '</saw:criteria>';
		
		if (views.length > 0) {
			xml += '<saw:views>';
			for (var i=0; i < views.length; i++) {
				xml += views[i];
			}
			xml +='</saw:views>';
		}
		
		xml += '</saw:report>';
		return xml;
	}
	
	// Builds sort XML from an array of BISort objects
	function buildSortXML(sort, criteria) {
		var xml = "";
		
		if (sort.length > 0) {
			xml += '<saw:columnOrder>';	
			
			for (var i=0; i < sort.length; i++) {
				dir = sort[i].Direction == 'desc' ? 'descending' : 'ascending';
				
				// Get column by name (string) or criteria position (number)
				var colRef;
				if (isNaN(sort[i].Column)) { 
					for (var j=0; j < criteria.length; j++) {
						if (criteria[j].Name == sort[i].Column)
							colRef = 'c' + j;
					}
				} else
					colRef = 'c' + sort[i].Column;
				xml += '<saw:columnOrderRef columnID="' + colRef + '" direction="' + dir + '"/>'; // Sort by column tag
			}
			
			xml += '</saw:columnOrder>';
		}
		return xml;
	}
	
	// Builds filter XML from an array of BIFilter and BIFilterGroup objects
	// If only BIFilter objects present, AND logic is assumed
	function buildFilterXML(filters) {
		var xml = ""
		
		// Build filter tags
		if (filters.length > 0) {
			xml += '<saw:filter>';
			
			// Convert filter array to an AND filter group
			if (filters.length > 1)
				filters = [new BIFilterGroup(filters, 'and')];
			
			for (var i=0; i < filters.length; i++) {
				if (filters[i].Type == 'Filter')
					xml += buildSingleFilterXML(filters[i]);
				else
					xml += buildFilterGroupXML(filters[i]);
			}

			xml += '</saw:filter>';
		}
		
		return xml;
	}

	// Build XML for a single filter
	function buildSingleFilterXML(filter) {
		var xml = "";
		if (filter.FilterType == 'list') {
			xml += '<sawx:expr xsi:type="sawx:list" op="' + filter.Operator + '">';
			xml += '<sawx:expr xsi:type="sawx:sqlExpression">' + filter.Code + '</sawx:expr>';
			
			var value;
			if (typeof(filter.Value) == 'string')
				value = filter.Value.split(';');
			else
				value = filter.Value;
			
			for (var j=0; j < value.length; j++) {
				xml += '<sawx:expr xsi:type="xsd:' + filter.DataType + '">' + value[j] + '</sawx:expr>';
			}
			xml += '</sawx:expr>';
		} else {
			xml += '<sawx:expr xsi:type="sawx:' + filter.FilterType + '" op="' + filter.Operator + '">';
			xml += '<sawx:expr xsi:type="sawx:sqlExpression">' + filter.Code + '</sawx:expr>';
			xml += '<sawx:expr xsi:type="xsd:' + filter.DataType + '">' + filter.Value + '</sawx:expr>';
			xml += '</sawx:expr>';
		}
		return xml;
	}

	// Buid XML for a filter group
	function buildFilterGroupXML(filterGroup) {
		var xml = "";
		
		xml += '<sawx:expr xsi:type="sawx:logical" op="' + filterGroup.Operator + '">';

		var filters = filterGroup.Filters;
		
		for (var j=0; j < filters.length; j++) {
			if (filters[j].Type == 'Filter')
				xml += buildSingleFilterXML(filters[j])
			else
				xml += buildFilterGroupXML(filters[j])
		}
		
		xml += '</sawx:expr>';
		return xml;
	}
	
	// Build Static Text (HTML) view XML
	function buildHTMLViewXML(html) {
		var xml = '<saw:view xsi:type="saw:htmlview" name="rmvppView">';
		xml += '<saw:staticText><saw:caption fmt="html"><saw:text>';
		html = html.split('\n');
		for (var i=0; i<html.length; i++) {
			html[i] = html[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
		html = html.join('\n');
		xml += html;
		xml += '</saw:text></saw:caption></saw:staticText></saw:view>';
		return xml;
	}
		
	// Execute XML - will respect decimals on older OBIEE versions
	function executeXML(xml, successFunc, biQuery) {
		biQuery = biQuery || "";
		if (typeof(xml) == 'object') // Convert to string if necessary
			xml = new XMLSerializer().serializeToString(xml);
		
		// Build SOAP message
		xml = '<![CDATA[' + xml + ']]>';
		xmlViewService = obieeURL + '?SOAPImpl=xmlViewService';
		
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8">';
		soapMessage = soapMessage + '<soapenv:Header/><soapenv:Body><v8:executeXMLQuery><v8:report><v8:reportXml>' + xml;
		soapMessage = soapMessage + '</v8:reportXml></v8:report><v8:outputFormat>SawRowsetData</v8:outputFormat><v8:executionOptions><v8:async>FALSE</v8:async>';
		soapMessage = soapMessage + '<v8:maxRowsPerPage>100000</v8:maxRowsPerPage><v8:refresh>TRUE</v8:refresh><v8:presentationInfo>TRUE</v8:presentationInfo><v8:type>query</v8:type>';
		soapMessage = soapMessage + '</v8:executionOptions><v8:reportParams/><v8:sessionID>' + sessionStorage.obieeSessionId + '</v8:sessionID>';
		soapMessage = soapMessage + '</v8:executeXMLQuery></soapenv:Body></soapenv:Envelope>';
		
		// Call web service
		wsCall(xmlViewService, soapMessage, function(response) {
			var outputData = response.getElementsByTagName('rowset');
			if (outputData.length > 0) {
				outputData = $.xml2json($(outputData[0]).text()).Row;
			} else { 
				var outputData = response.getElementsByTagName('sawsoap:rowset');
				if (outputData.length > 0) {
					outputData = $.xml2json($(outputData[0]).text()).Row;
				} else {
					console.log(outputData);
				}	
			}
			
			if (Object.prototype.toString.call( outputData ) === '[object Object]')
				outputData = [outputData]
			
			// Map output in accordance with input BIQuery criteria names
			if (biQuery != "")
				outputData = mapResults(biQuery, outputData);
			
			if (outputData.length == 2500)
				console.warn('Warning: reached 2500 row limit for XML queries.');
			successFunc(outputData);
		});
	}
	
	/* ------ END OF INTERNAL XML OPERATIONS ------ */
	
	/* ------ GENERAL INTERNAL FUNCTIONS ------ */
	
	// Cookie functions
	function getCookie(name) {
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + name + "=");
	  if (parts.length == 2) return parts.pop().split(";").shift();
	}

	function createCookie(name,value,days,path) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path="+path;
	}

	function eraseCookie(name, path) {
		createCookie(name,"",-1,path);
	}

	// Generic Object functions
	function renameProperty(obj, oldName, newName) {
		 // Do nothing if the names are the same
		 if (oldName == newName) {
			 return obj;
		 }
		// Check for the old property name to avoid a ReferenceError in strict mode.
		if (obj.hasOwnProperty(oldName)) {
			obj[newName] = obj[oldName];
			delete obj[oldName];
		}
		return obj;
	};
	
	/* ------ GENERAL INTERNAL FUNCTIONS ------ */
	
	/* ------ PUBLIC BI OBJECT FUNCTIONS ------ */
	
	// Search for filter of a certain code and replace it
	obiee.replaceFilter = function(filters, newFilter, changed) {
		var code = newFilter.Code, changed = changed || false;
		for (var j=0; j < filters.length; j++) {
			if (filters[j].Type == 'Filter') {
				if (filters[j].Code == code) {
					filters[j] = newFilter;
					changed = true;
				}
			} else
				changed = obiee.replaceFilter(filters[j].Filters, newFilter, changed); // Recursively loop through filter groups
		}
		return changed;
	}
	
	// Remove explicit global filters from visualisations
	// This prevents a prompt from being created and ran, and then persisted after removal in design mode
	obiee.removePromptedFilters = function(filters, changed) {
		var changed = changed || false;
		var removeIndices = [];
		for (var i=0; i < filters.length; i++) {
			if (filters[i].Type == 'Filter') {
				if (filters[i].Global) {
					removeIndices.push(i);
					changed = true;
				}
			} else {
				changed = obiee.removePromptedFilters(filters[i].Filters, changed); // Recursively loop through filter groups
				if (filters[i].Filters.length == 0) { // Remove filter group if it has no children
					removeIndices.push(i);
					changed = true;
				}
			}
		}
		
		for (var i = removeIndices.length -1; i >= 0; i--)
			filters.splice(removeIndices[i],1);
		return changed;
	}
	
	/* ------ END OF PUBLIC BI OBJECT FUNCTIONS ------ */
	
	return obiee;
}(obiee || {}));

// Pseudo-Class objects for columns, tables and filters
// Presentation Column
function BIColumn (code, name, dataType, table, aggRule) {
	this.Code = code; // Presentation layer representation
	this.Name = name; // Column name
	this.Table = table || "Unspecified"; // Presentation Table
	this.Measure = aggRule || "none"; // Measure indicator
	this.ID = this.Table + '.' + name;
	this.DataType = dataType || 'string'; // Data type
	this.Type = 'Column';
}

// Presentation Table
function BITable (code, name, columns, parent, children) {
	this.Code = code;
	this.Name = name;
	this.Columns = columns;
	this.Parent = parent || "";
	this.Children = children || {};
	this.Type = 'Table';
}

// BI Variable object
// Contains information to describe a repository or session variable
function BIVariable(name, type) {
	this.Name = name; // Variable name as defined in OBIEE
	
	this.VarType = type || 'Repository'; // Type, repository or session
	if ($.inArray(this.VarType, ['Repository', 'Session']) == -1)
		throw 'Invalid variable type "' + type + '" chosen.';
	
	var code;
	switch(this.VarType) {
		case 'Repository':
			code = 'VALUEOF("' + this.Name + '")';
			break;
		case 'Session':
			code = 'VALUEOF(NQ_SESSION."' + this.Name + '")';
			break;
	}
		
	this.Code = code;
	this.Value = '';
	this.Type = 'Variable'
}

// Filter
// Value Type is essential for number comparisons as the query will not error, only bring back no results
function BIFilter(column, value, op, subjectArea, global) {
	this.Code = column.Code;
	this.Name = column.Name;
	
	if (typeof(this.Code) == 'undefined' || this.Code == "")
		throw 'No code specifed for filter.';

	this.Value = value || "";
	
	// Operator, can have a specific value, defaults to equals
	op = op || 'equal';
	this.Operator = op;
	if ($.inArray(op, [	'equal', 'notEqual', 'in', 'notIn', 'greater', 'greaterOrEqual', 'less', 'lessOrEqual', 'top', 'bottom',
						'like', 'contains', 'starts', 'ends']) == -1)
		throw 'Invalid operator "'+op+'" passed to filter.';
	
	// Filter type, based on the operator
	var filterType;
	if ($.inArray(op, ['in', 'notIn']) > -1) {
		filterType = 'list';
		if (typeof(this.Value) == 'string')
			this.Value = [this.Value];
	} else if ($.inArray(op, ['top', 'bottom']) > -1)
		filterType = 'rank';
	else
		filterType = 'comparison';
	this.FilterType = filterType;
	
	// Data type, simple, used in XML
	dataType = column.DataType;
	if ($.inArray(dataType, ['char', 'varchar']) > -1)
		dataType = 'string';
	if ($.inArray(dataType, ['integer', 'double']) > -1)
		dataType = 'decimal';
	if ($.inArray(dataType, ['date', 'timestamp']) > -1)
		dataType = 'date';

	this.DataType = dataType;
	
	this.Global = global || false; // Attribute indicating whether this filter was created/updated by a dashboard prompt or interaction
	this.ColumnID = column.ID; // Column ID so it can be referenced from a BIPres object
	this.Column = column; // Introduces some information redundancy, optimise when possible
	this.SubjectArea = subjectArea || ""; // Subject area, optional as a BIQuery object will have this information, but can be useful for global filters
	this.Type = 'Filter'; // BI object identifier
}

// Filter Group - AND/OR logic for multiple filters
// Can accept an array of BIFilter or BIFilterGroup objects
function BIFilterGroup(filters, op) {
	this.Operator = op || 'and';
	if ($.inArray(op, ['and', 'or']) == -1)
		throw 'Invalid operator "'+op+'" passed to filter group.';
	
	filters = filters || [];
	this.Filters = filters;
	this.Type = 'FilterGroup';
}

// Sort object - specifies columns of criteria to sort by
// References columns in criteria by Name attribute (string) or position in the Criteria array (integer)
function BISort(col, dir) {
	this.Column = col; // Use string to reference name, integer to reference position
	
	dir = dir || 'asc';
	this.Direction = dir.toLowerCase();
	if ($.inArray(dir.toLowerCase(), ['asc', 'desc']) == -1)
		throw 'Invalid sort direction "'+dir+'" passed to sort object.';
	
	this.Type = 'Sort';
}

// BI Query object
// Filters accepts an array of  BIFilters or BIFilterGroup objects
// Sort accepts an array of BISort objects
// If there is more than one filter but no filter group objects, AND logic is implemented
function BIQuery(subjectArea, cols, filters, sort) {
	this.SubjectArea = subjectArea;
	this.Criteria = cols;
	this.Sort = [] || sort;
	
	filters = filters || [];
	if (Object.prototype.toString.call( filters ) != '[object Array]')
		throw 'Filters not passed through as an array to query.'

	this.Filters = filters;
	this.MaxRows = 65000; // Maximum rows. Only respected in LSQL queries
	this.Type = 'Query';
}

// BI Presentation object
// Contains a definition of the presentation layer of an RPD
function BIPres(subjectArea, columns, tables) {
	this.SubjectArea = subjectArea;
	this.AllColumns = columns; // Contains a flattened object of all presentation columns
	this.Tables = tables; // Contains a hierarchical object of presentation tables, columns and child tables
	this.AddColumn = function(biColumn) { // Function to add a BIColumn object
		colCode = biColumn.Table + '.' + biColumn.Name;
		this.AllColumns[colCode] = biColumn;

		if (biColumn.Table in this.Tables) {
			this.Tables[biColumn.Table].Columns[biColumn.Name] = biColumn;
		} else {
			var columns = {};
			columns[biColumn.Name] = biColumn;
			this.Tables[biColumn.Table] = new BITable(biColumn.Table, biColumn.Table, columns);
		}
	}
	this.Type = 'Presentation';
}

// RMVPP Pseudo-Class objects

// BI Visual object
// Contains all of the information required to render a specific visualisation as part of a dashboard
function BIVisual(plugin, config, columnMap, query, x, y, id, container) {
	this.Plugin = plugin;
	this.Config = config || rmvpp.getDefaultConfig(plugin);
	this.ColumnMap = columnMap || rmvpp.getDefaultColumnMap(plugin);
	this.Query = query || new BIQuery("", [], []);
	this.X = x || 0; // Coordinates for dashboard layout
	this.Y = y || 0;
	if (id === 0)
		this.ID = 0;
	else
		this.ID = id || -1; // Page identifier of the visualisation for use with dashboards.
	this.Container = container || '.visualisation[vis-number=' + this.ID + ']'; // Returns selector for the element the visualisation is to be rendered in
	this.Type = 'Visual';
}

// BI Interaction object
// Contains information to define an interaction between two visualisations on a page
function BIInteraction(trigger, sourceVis, targetVis, action, columns, handler) {
	this.Trigger = trigger; // Custom event to be triggered. Must be specified as part of the interactions object on the source plugin
	this.SourceVis = sourceVis; // BIVisual object for the source
	this.TargetVis = targetVis; //BIVisual object for the target
	this.SourceNum = sourceVis.ID;
	this.TargetNum = targetVis.ID;
	this.Columns = columns || []; // Array of column identifiers to use from the plugin map
	this.Action = action || 'filter'; // Action to be performed on the target visualisation. Default to filter.
	this.Handler = handler || obieeUI.generateHandler(this.Action, this.SourceVis, this.TargetVis, this.Columns); // Generate handler using OBIEE UI function
	this.Type = 'Interaction';
}

// BI Drilldown object
// Special type of interaction which uses a path instead of a target visualisation and has a set handler
function BIDrilldown(trigger, sourceVis, drillPath, columns, sourcePath, breadcrumbs, handler) {
	this.Trigger = trigger; // Custom event to be triggered. Must be specified as part of the interactions object on the source plugin
	this.SourceVis = sourceVis; // BIVisual object for the source
	this.SourceNum = sourceVis.ID;
	this.DrillPath = drillPath;
	this.SourcePath = sourcePath || "";
	this.Columns = columns || []; // Array of column identifiers to use from the plugin map
	this.Action = 'drill';
	this.Breadcrumbs = breadcrumbs || [];
	this.Type = 'Drilldown';

	// Parameters required to develop breadcrumb history
	var drillParams =  {
		'sourcePath' : this.SourcePath,
		'targetPath' : this.DrillPath, 
		'breadcrumbs' : this.Breadcrumbs
	};
	this.Handler = handler || obieeUI.generateHandler('drill', this.SourceVis, drillParams, this.Columns); // Generate handler using OBIEE UI function
}

// BI Breadcrumb object
// Contains information allowing a user to go back to a certain dashboard after drilling down
function BIBreadcrumb(sourcePath, targetPath, drillFilter) {
	this.SourcePath = sourcePath; // Web Catalogue path of original dashboard
	this.TargetPath = targetPath; // Web Catalogue path of original dashboard
	this.DrillFilter = drillFilter; // Column and value object as passed by the original interaction
	this.Type = 'Breadcrumb';
}

// BI Prompt object
// Contains information to define a dashboard prompt/global filter
function BIPrompt(filters, x, y) {
	this.Filters = filters || [];
	this.X = x || 0;
	this.Y = y || 0;
	this.Type = 'Prompt'
}

// BI Column Selector
// Contains information to define a column selector
function BIColumnSelector(columns, sa, visuals, x, y, style) {
	this.Columns = columns; // Array of columns for the selector
	this.SubjectArea = sa; // Subject area of columns
	this.Visuals = visuals || []; // Array of visual IDs to apply selector to
	this.Style = style || 'Dropdown';
	if ($.inArray(this.Style, ['Dropdown', 'Radio']) == -1)
		throw 'Invalid style "' + style + '" chosen.';
	this.X = x || 0;
	this.Y = y || 0;
	this.Type = 'ColumnSelector';
}

// BI Utility object
// Contains information about widget buttons. Currently only supports Refresh
function BIUtility(utility, x, y) {
	this.Utility = utility || 'Refresh';
	this.X = x || 0;
	this.Y = y || 0;
	if ($.inArray(this.Utility, ['Refresh']) == -1)
		throw 'Invalid utility "' + utility + '" chosen.';
	this.Type = 'Utility';
}

// BI Dashboard object
// Contains all of the information to render an entire dashboard page
function BIDashboard(visuals, prompts, interactions, selectors, drilldowns, path, breadcrumbs, utilities) {
	this.Visuals = visuals || [];
	this.Prompts = prompts || {};
	this.Selectors = selectors || [];
	this.Interactions = interactions || [];
	this.Drilldowns = drilldowns || [];
	this.Path = path || "";
	this.Breadcrumbs = breadcrumbs || [];
	this.Utilities = utilities || [];
}