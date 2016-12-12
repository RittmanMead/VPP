 rmvpp = (function(rmvpp){
    
    var pluginName = ""
    var pluginDescription = ""
    var rowLimit = 50000;

    // Do not modify these 3 lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;

    rmvpp[pluginName].testData = []
                 
    rmvpp[pluginName].columnMappingParameters = []
     
    rmvpp[pluginName].configurationParameters = []
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
        
    }
   
    return rmvpp;

}(rmvpp || {}))