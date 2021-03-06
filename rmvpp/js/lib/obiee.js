/* 	OBIEE Web Service Interface
	Requirements:
		jquery.min.js [<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>]
		jquery.xml2json.js [Local only]
	Recommended:
		d3.min.js [<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>]
*/

// Wrap functions as an object
var obiee = (function(obiee) {
	
	/* ------ WEB SERVICE INTEGRATION ------ */
	
	// Generic web service call
	function wsCall(url, inpData, successFunc) {
		$('#mask').css("display", "block");
		$.ajax({
			url: url,
			type: "POST",
			dataType: "xml",
			data: inpData,
			contentType: "text/xml; charset=\"utf-8\"",
			success: function(response) {
				$('#mask').css("display", "none");
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
	// obieeURL = 'http://obiee:9704/analytics-ws/saw.dll' // Modify to your own environment

	// Connect to OBIEE
	obiee.logon = function (user, pass, successFunc) {
		nQSessionService = obieeURL + '?SOAPImpl=nQSessionService';
		soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v8="urn://oracle.bi.webservices/v8" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/>';
		soapMessage = soapMessage + '<soapenv:Body><v8:logon><v8:name>' + user + '</v8:name><v8:password>' + pass + '</v8:password></v8:logon>';
		soapMessage = soapMessage + '</soapenv:Body></soapenv:Envelope>'
		
		wsCall(nQSessionService, soapMessage, function(response) {
			sessionId = $.xml2json(response).Body.logonResult.sessionID.text;
			sessionStorage.obieeSessionId = sessionId;
			successFunc(response);
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
				col = new BIColumn(tabColData[i].name + '.' + columns[j].name, columns[j].displayName, columns[j].dataType, tableName);
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
		
		//tableObj = processTables(tabColData, tableObj);
		
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
	
	// Execute query based on an arrays of column and filter objects
	obiee.runQuery = function(biQuery, successFunc) {
		xml = buildXML(biQuery);
		executeXML(xml, successFunc, biQuery);
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
	obiee.executeLSQL = function(lsql, successFunc) {
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
				outputData = [outputData]
			}
			successFunc(outputData);
		});
	}
	
	/* ------ END OF PUBLIC EXECUTION FUNCTIONS ------ */

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
	
	/* ------ END OF WEBCAT FUNCTIONS ------ */
	
	/* ------ PUBLIC RMVPP FUNCTIONS ------ */
	
	// Function to rename data properties based on column map for a specific visualisation
	obiee.mapData = function(data, columnMap) {
		for (var i=0; i<data.length; i++) {
			for (prop in columnMap) {
				if ('name' in columnMap[prop])
					data[i] = renameProperty(data[i], columnMap[prop].name, prop);
			}
		}
		return data;
	}

	// Saves a visualisation to the catalogue as static text
	obiee.saveVis = function(vis, path, successFunc) {
		// Build HTML script to generate full visualisation
		var html = '';
		
		// Standard dependencies
		html += '<script src="/rmvpp/dependencies/js/jquery.min.js"></script>\n';
		html += '<script src="/rmvpp/dependencies/js/jquery.xml2json.js"></script>\n';
		html += '<script src="/rmvpp/dependencies/js/d3.min.js"></script>\n';
		html += '<script src="/rmskin/demo/js/obiee-v8.js"></script>\n';
		html += '<script src="/rmvpp/rmvpp-ext.js"></script>\n\n';
		
		deps = rmvpp[vis.Plugin].dependencies;
		
		for (var i=0; i < deps.js.length; i++) {
			html += '<script src="' + deps.js[i] + '"></script>\n';
		}
		
		if ('css' in deps) {
			for (var i=0; i < deps.css.length; i++ ) {
				html += '<link	rel="stylesheet" type="text/css" href="' + deps.css[i] + '">\n';
			}
		}
		
		html += '\n<div id="rmvppContainer"></div>\n<script id="savedLogic">';
		html += '\n\t' + '/* Visualisation 1 */ var biVis = ' + JSON.stringify(vis) + '/* End of Visualisation 1 */';
		html += '\n\t' + 'obiee.runQuery(biVis.Query, function(results) {';
		html += '\n\t\t' + 'data = obiee.mapData(results, biVis.ColumnMap)';
		html += '\n\t\t' + 'rmvpp[biVis.Plugin].render(data, biVis.ColumnMap, biVis.Config, $("#rmvppContainer")[0])';
		html += '\n\t' + '});';
		
		html += '\n</script>';
		
		var staticHTMLView = buildHTMLViewXML(html);
		
		// Set the HTML view as the compound layout
		var compoundView = '<saw:view xsi:type="saw:compoundView" name="compoundView!1">';
		compoundView += '<saw:cvTable><saw:cvRow><saw:cvCell viewName="rmvppView"/></saw:cvRow>';
		compoundView += '</saw:cvTable></saw:view>';
		
		var xml = buildXML(vis.Query, [staticHTMLView, compoundView])
		saveXML(xml, path, successFunc);
	}
	
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
			re = new RegExp('\/\\* Visualisation 1 \\*\/.* = (.*?)\/\\* End of Visualisation 1 \\*\/')
			if (re.exec(html)) {
				visObj = re.exec(html)[1];
				visObj = JSON.parse(visObj);
				successFunc(visObj);
			} else
				throw 'No RMVPP Visualisation found in: ' + path;
		});
	}
	
	/* ------ END OF PUBLIC RMVPP FUNCTIONS ------ */
	
	/* ------ INTERNAL WEBCAT OPERATIONS ------ */
	
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
	
	/* ------ END OF INTERNAL WEBCAT OPERATIONS ------ */
	
	/* ------ INTERNAL XML OPERATIONS ------ */
	
	// Build XML report from column array
	// Necessary to execute as XML on older versions due to decimal issue
	// Can accept an array of XML strings for views to be inserted
	function buildXML(biQuery, viewsXML) {
		var subjectArea = biQuery.SubjectArea
		var colObjs = biQuery.Criteria
		var filters = biQuery.Filters || [];
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
		
		xml += '</saw:criteria>';
		
		if (views.length > 0) {
			xml += '<saw:views>';
			for (var i=0; i<views.length; i++) {
				xml += views[i];
			}
			xml +='</saw:views>';
		}
		
		xml += '</saw:report>';
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
			var value = filter.Value.split(';');
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
	
	// Execute XML - will respect decimals
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
			if (outputData.length > 0)
				outputData = $.xml2json($(outputData[0]).text()).Row;
			
			if (Object.prototype.toString.call( outputData ) === '[object Object]')
				outputData = [outputData]
			
			if (biQuery != "") {
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
			}
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
	
	return obiee;
}(obiee || {}));

// Pseudo-Class objects for columns, tables and filters
// Presentation Column
function BIColumn (code, name, dataType, table) {
	this.Code = code; // Presentation layer representation
	this.Name = name; // Column name
	this.Table = table || "Unspecified"; // Presentation Table
	
	// Simplify data types to string, decimal or date, as is used in filters
	// Default to string if unspecified
	dataType = dataType || 'string';
	if ($.inArray(dataType, ['integer', 'double']) > -1)
		dataType = 'decimal';
	else if ($.inArray(dataType, ['varchar']) > -1)
		dataType = 'string';
	this.DataType = dataType;
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

// Filter
// Value Type is essential for number comparisons as the query will not error, only bring back no results
function BIFilter(code, value, op, dataType) {
	this.Code = code;
	if (typeof(code) == 'undefined' || code == "")
		throw 'No code specifed for filter.';

	this.Value = value;
	if (typeof(value) == 'undefined' || value == "")
		throw 'No value specifed for filter.';
	
	op = op || 'equal';
	this.Operator = op;
	if ($.inArray(op, ['equal', 'notEqual', 'in', 'notIn', 'greater', 'greaterOrEqual', 'less', 'lessOrEqual', 'top', 'bottom']) == -1)
		throw 'Invalid operator "'+op+'" passed to filter.';
	
	var filterType;
	if ($.inArray(op, ['in', 'notIn']) > -1)
		filterType = 'list';
	else if ($.inArray(op, ['top', 'bottom']) > -1)
		filterType = 'rank';
	else
		filterType = 'comparison';
	this.FilterType = filterType;
	
	dataType = dataType || 'string';
	if ($.inArray(op, ['top', 'bottom']) > -1)
		dataType = 'decimal';
	this.DataType = dataType;
	this.Type = 'Filter';
}

// Filter Group - AND/OR logic for multiple filters
// Can accept an array of BIFilter or BIFilterGroup objects
function BIFilterGroup(filters, op) {
	this.Operator = op || and;
	if($.inArray(op, ['and', 'or']) == -1)
		throw 'Invalid operator "'+op+'" passed to filter group.';
	
	filters = filters || [];
	this.Filters = filters;
	this.Type = 'FilterGroup';
}

// BI Query object
// Filters accepts an array of  BIFilters or a BIFilterGroup object
// If there is more than one filter but no filter group objects, AND logic is implemented
function BIQuery(subjectArea, cols, filters) {
	this.SubjectArea = subjectArea;
	this.Criteria = cols;
	
	if (Object.prototype.toString.call( filters ) != '[object Array]')
		throw 'Filters not passed through as an array to query.'
	
	if (filters.length > 1)
		filters = [new BIFilterGroup(filters, 'and')];

	this.Filters = filters;
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
		console.log(biColumn);
		if (biColumn.Table in this.Tables) {
			this.Tables[biColumn.Table].Columns[biColumn.Name] = biColumn;
		} else {
			var columns = {};
			columns[biColumn.Name] = biColumn;
			this.Tables[biColumn.Table] = new BITable(biColumn.Table, biColumn.Table, columns);
		}
	}
}

// RMVPP Pseudo-Class objects
function BIVisual(plugin) {
	this.Plugin = plugin;
	this.Config = rmvpp.getDefaultConfig(plugin);
	this.ColumnMap = rmvpp.getDefaultColumnMap(plugin);
	this.Query = new BIQuery("", [], []);
}