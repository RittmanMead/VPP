 rmvpp = (function(rmvpp){
    
    var pluginName = "rmvpp-table"
    var pluginDescription = "Table"
    var rowLimit = 50000;


    // Do not modify these lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;

    rmvpp[pluginName].testData = [["Banner Assortment", "Bread Assortments", "Bread", "", "Y", "2.00", "2,000.00", "29.95"], ["Bowl Bread Club", "Bread Clubs", "Gifts", "", "Y", "2.00", "4,600.00", "49.98"], ["Bread Bowls", "Rounds & Loaves", "Bread", "", "Y", "3.00", "3,400.00", "59.90"], ["Breakfast Muffin", "Sandwiches", "Snacks", "England", "Y", "1.00", "3,000.00", "6.99"], ["Can Clam Chowder", "Gifts & Baskets", "Gifts", "Bay Area", "N", "6.00", "4.00", "11.98"], ["Challah Bread", "Speciality Breads", "Bread", "", "Y", "3.00", "16.00", "25.90"], ["Clam Chowder", "Soup", "Snacks", "Bay Area", "Y", "55.00", "40.00", "89.90"], ["Cobb Salad Sandwich", "Sandwiches", "Snacks", "San Francisco", "Y", "12.00", "8.00", "11.98"], ["Dipping Oils", "Gifts & Baskets", "Gifts", "", "N", "2.00", "1.00", "3.99"], ["Harvest Bread Trio", "Bread Assortments", "Bread", "", "Y", "4.00", "15.00", "29.95"], ["Heet's Cafe Latte", "Hot Drinks", "Drinks", "Seattle", "N", "3.00", "4.00", "7.98"], ["Heet's Cappucino", "Hot Drinks", "Drinks", "Seattle", "N", "54.00", "60.00", "79.80"], ["Heet's Drip Coffee", "Hot Drinks", "Drinks", "Seattle", "N", "46.00", "24.00", "41.88"], ["Heet's Earl Grey Tea", "Hot Drinks", "Drinks", "Seattle", "N", "3.00", "2.00", "4.98"], ["Heet's Tea", "Hot Drinks", "Drinks", "Seattle", "N", "3.00", "2.00", "4.98"], ["Holiday Bread Trio", "Bread Assortments", "Bread", "", "Y", "2.00", "22.00", "26.95"], ["Mineral Water", "Cold Drinks", "Drinks", "", "N", "29.00", "5.25", "20.93"], ["Minestrone", "Soup", "Snacks", "", "Y", "5.00", "3.00", "7.99"], ["North Beach Sandwich", "Sandwiches", "Snacks", "", "Y", "3.00", "6.00", "11.98"], ["Panettone", "Speciality Breads", "Bread", "", "Y", "4.00", "4.00", "13.90"], ["Pepper Jack Cheese", "Gifts & Baskets", "Gifts", "", "N", "2.00", "2.00", "5.99"], ["Raisin Baguette", "Accompaniments", "Snacks", "", "Y", "2.00", "1.00", "4.99"], ["Salt Beef Sandwich", "Sandwiches", "Snacks", "New York", "Y", "10.00", "16.00", "27.96"], ["Sandwich Rolls", "Rounds & Loaves", "Bread", "", "Y", "3.00", "6.00", "19.95"], ["Seasonal Bread Club", "Bread Clubs", "Gifts", "", "N", "3.00", "19.00", "29.99"], ["Snowmen Bread", "Seasonal Breads", "Bread", "", "Y", "1.00", "12.00", "19.95"], ["Sourdough Bread Club", "Bread Clubs", "Gifts", "", "N", "3.00", "22.00", "29.99"], ["Sourdough Loaves", "Rounds & Loaves", "Bread", "Bay Area", "Y", "38.00", "75.00", "224.25"], ["Sourdough Rounds", "Rounds & Loaves", "Bread", "Bay Area", "Y", "5.00", "12.00", "29.90"], ["Tropic C'berry Juice", "Cold Drinks", "Drinks", "", "N", "10.00", "2.50", "14.95"]]
                 
    rmvpp[pluginName].columnMappingParameters = []
     
    rmvpp[pluginName].configurationParameters = [
        { 
            "targetProperty":"header_bgcolour", 
            "label":"Header Colour",
            "inputType":"colourpicker",
            "inputOptions": {               
                "defaultValue": "#F5F5F5"             
            }
        },
        { 
            "targetProperty":"header_font_size", 
            "label":"Header Fontsize",
            "inputType":"dropdown",
            "inputOptions": {               
                "multiSelect": false,
                "values": ['36px','32px','30px','28px','24px','22px','21px','20px','18px','16px','14px','12px','11px','10px','8px','7px'],
                "defaultSelection": [13]
            }
        },        
        { 
            "targetProperty":"row_bgcolour", 
            "label":"Row Colour",
            "inputType":"colourpicker",
            "inputOptions": {               
                "defaultValue": "#FFFFFF"             
            }
        },
        { 
            "targetProperty":"font_size", 
            "label":"Row Fontsize",
            "inputType":"dropdown",
            "inputOptions": {               
                "multiSelect": false,
                "values": ['36px','32px','30px','28px','24px','22px','21px','20px','18px','16px','14px','12px','11px','10px','8px','7px'],
                "defaultSelection": [13]
            }
        },
        { 
            "targetProperty":"initial_rows", 
            "label":"Initial Rows Displayed",
            "inputType":"dropdown",
            "inputOptions": {               
                "multiSelect": false,
                "values": ['10','25','50','100'],
                "defaultSelection": [2]
            }
        }
        
    ]
     
    rmvpp[pluginName].render = function(data, columnNames, config, container)   {
		console.log(data);
		console.log(columnNames);
        var colDefs = [];
        for ( col in columnNames )  {
            colDefs.push({"title":columnNames[col], "targets":[col], className: "my_class"})
        }
        
        $(container).html( '<table cellpadding="0" cellspacing="0" border="0" class="display cell-border stripe hover"></table>' );
 
        var table = $(container).find('table').DataTable( {
            "data": data,
            "columns": colDefs,    
            "pageLength": +config.initial_rows,
            "rowCallback": function ( row, data ) { 
                
                $('td', row).css('background-color', config.row_bgcolour)  
                            .css('font-size', config.font_size)
                            .css('padding', '1px 3px 1px 2px');
            },
            "headerCallback": function ( row, data ) {               
                $('th', row).css('background-color', config.header_bgcolour)
                            .css('border', '1px #ddd solid')
                            .css('border-right-width', '1px')
                            .css('border-left-width', '0px')
                            .css('border-collapse', 'separate')
                            .css('border-spacing','0')
                            .css('font-size', config.header_font_size);  
            }        
        } );  

        // Set column Alignment based on most dominant data type in each column
        table.columns().every(function(){
            
            var num=0
            var txt=0
            
            this.nodes().to$().each(function(){
                if ( isNaN(parseInt($(this).html().replace(/,/g,""))) )  {                  
                    txt++;
                } else {
                    num++
                }
            })
            
            this.nodes().to$().each(function(){
                if (num >= txt) {
                    $(this).css('text-align','right')
                } else {
                    $(this).css('text-align','left')
                }
            })
        })
    }
   
    return rmvpp;

}(rmvpp || {}))