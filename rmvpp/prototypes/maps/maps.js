 rmvpp = (function(rmvpp){
    

    /**
     *  Plugin Configuration
     */ 
    var pluginName = "rmvpp-maps"
    var pluginDescription = "Maps - Basic"
    
    // Do not modify these lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    
    // Define some test data for developing in the offline test bench.

    rmvpp[pluginName].testData = [
                                        ["00AL","Greenwich",8712],                                                                                              
                                        ["00AR","Havering",18716],                                                                                              
                                        ["00AT","Hounslow",13796],                                                                                              
                                        ["00CG","Sheffield District",13400],                                                                                    
                                        ["00CW","City of Wolverhampton District",8943],                                                                         
                                        ["00JA","City of Peterborough",12782],                                                                                  
                                        ["00EU","Warrington",18746],                                                                                            
                                        ["00HC","North Somerset",20850],                                                                                        
                                        ["00MD","Slough",12356],                                                                                                
                                        ["17UG","Erewash District",17067],                                                                                      
                                        ["18UH","Teignbridge District",18647],                                                                                  
                                        ["18UC","Exeter District",16451],                                                                                       
                                        ["16UF","Eden District",19676],                                                                                         
                                        ["16UG","South Lakeland District",21813],                                                                               
                                        ["37UF","Mansfield District",10435],                                                                                    
                                        ["19UJ","Weymouth and Portland District",13380],                                                                        
                                        ["19UD","East Dorset District",25738],                                                                                  
                                        ["23UE","Gloucester District",16761],                                                                                   
                                        ["22UL","Rochford District",25115],                                                                                     
                                        ["36UD","Harrogate District",24153],                                                                                    
                                        ["38UD","South Oxfordshire District",26058],                                                                            
                                        ["32UE","North Kesteven District",23582],                                                                               
                                        ["29UN","Thanet District",11777],                                                                                       
                                        ["29UQ","Tunbridge Wells District",22434],                                                                              
                                        ["32UG","South Kesteven District",22217],                                                                               
                                        ["44UF","Warwick District",22943],                                                                                      
                                        ["33UD","Great Yarmouth District",12210],                                                                               
                                        ["37UC","Bassetlaw District",13182],                                                                                    
                                        ["33UE","King's Lynn and West Norfolk District",15181],                                                                 
                                        ["29UC","Canterbury District",17665],                                                                                   
                                        ["36UE","Richmondshire District",22399],                                                                                
                                        ["42UG","Suffolk Coastal District",22527],                                                                              
                                        ["47UC","Malvern Hills District",21117],                                                                                
                                        ["43UB","Elmbridge District",27419],                                                                                    
                                        ["00AC","Barnet",18358],                                                                                                
                                        ["00AD","Bexley",18952],                                                                                                
                                        ["00BE","Southwark",9227],                                                                                              
                                        ["00AU","Islington",6591],                                                                                              
                                        ["00BH","Waltham Forest",6889],                                                                                         
                                        ["00BM","Bury District",15211],                                                                                         
                                        ["00CR","Dudley District",15101],                                                                                       
                                        ["00CT","Solihull District",20287],                                                                                     
                                        ["00GL","City of Stoke-on-Trent",8781],                                                                                 
                                        ["00EB","Hartlepool",10331],                                                                                            
                                        ["00EE","Redcar and Cleveland",12508],                                                                                  
                                        ["00FN","City of Leicester",8966],                                                                                      
                                        ["00FK","City of Derby",14924],                                                                                         
                                        ["00FP","Rutland",25343],                                                                                               
                                        ["00EQ","Cheshire East",22190],                                                                                         
                                        ["17UH","High Peak District",19166],                                                                                    
                                        ["17UJ","North East Derbyshire District",18713],                                                                        
                                        ["00EY","Blackpool",7042],                                                                                              
                                        ["00EJ","Durham County",12326],                                                                                         
                                        ["19UH","West Dorset District",18421],                                                                                  
                                        ["17UF","Derbyshire Dales District",21622],                                                                             
                                        ["16UD","Carlisle District",14511],                                                                                     
                                        ["21UG","Rother District",15747],                                                                                       
                                        ["32UD","Lincoln District",12404],                                                                                      
                                        ["26UE","Hertsmere District",20791],                                                                                    
                                        ["29UH","Maidstone District",21405],                                                                                    
                                        ["34UG","South Northamptonshire District",27324],                                                                       
                                        ["31UG","Melton District",22001],                                                                                       
                                        ["24UN","Test Valley District",24364],                                                                                  
                                        ["34UC","Daventry District",22746],                                                                                     
                                        ["38UC","Oxford District",15041],                                                                                       
                                        ["30UK","Preston District",12522],                                                                                      
                                        ["42UC","Forest Heath District",20940],                                                                                 
                                        ["41UD","Lichfield District",21741],                                                                                    
                                        ["41UG","Stafford District",21751],                                                                                     
                                        ["30UN","South Ribble District",19984],                                                                                 
                                        ["43UD","Guildford District",25214],                                                                                    
                                        ["43UG","Runnymede District",24518],                                                                                    
                                        ["40UB","Mendip District",18480],                                                                                       
                                        ["40UD","South Somerset District",19947],                                                                               
                                        ["43UE","Mole Valley District",26617],                                                                                  
                                        ["38UE","Vale of White Horse District",25982],                                                                          
                                        ["42UE","Mid Suffolk District",23846],                                                                                  
                                        ["00AM","Hackney",4232],                                                                                                
                                        ["00AP","Haringey",7329],                                                                                               
                                        ["00BC","Redbridge",15254],                                                                                             
                                        ["00BD","Richmond upon Thames",24381],                                                                                  
                                        ["00BJ","Wandsworth",14337],                                                                                            
                                        ["00BP","Oldham District",11783],                                                                                       
                                        ["00BW","Wigan District",13418],                                                                                        
                                        ["00BY","Liverpool District",6366],                                                                                     
                                        ["00CB","Wirral District",14262],                                                                                       
                                        ["00KF","Southend-on-Sea",15153],                                                                                       
                                        ["00HP","Poole",19195],                                                                                                 
                                        ["00LC","Medway",16007],                                                                                                
                                        ["24UD","Eastleigh District",24140],                                                                                    
                                        ["00KB","Bedford Unitary",18295],                                                                                       
                                        ["18UG","South Hams District",20168],                                                                                   
                                        ["16UB","Allerdale District",15246],                                                                                    
                                        ["29UE","Dover District",15270],                                                                                        
                                        ["12UD","Fenland District",13901],                                                                                      
                                        ["22UJ","Harlow District",12304],                                                                                       
                                        ["17UB","Amber Valley District",17539],                                                                                 
                                        ["37UJ","Rushcliffe District",26671],                                                                                   
                                        ["32UF","South Holland District",17233],                                                                                
                                        ["00EM","Northumberland",16725],                                                                                        
                                        ["30UF","Fylde District",21681],                                                                                        
                                        ["30UH","Lancaster District",15776],                                                                                    
                                        ["33UB","Breckland District",18575],                                                                                    
                                        ["31UH","North West Leicestershire District",19441],                                                                    
                                        ["36UB","Craven District",21943],                                                                                       
                                        ["29UD","Dartford District",18476],                                                                                     
                                        ["42UB","Babergh District",21373],                                                                                      
                                        ["43UL","Waverley District",27243],                                                                                     
                                        ["26UL","Welwyn Hatfield District",21822],                                                                              
                                        ["42UD","Ipswich District",13973],                                                                                      
                                        ["33UC","Broadland District",23666],                                                                                    
                                        ["30UL","Ribble Valley District",24556],                                                                                
                                        ["30UM","Rossendale District",13127],                                                                                   
                                        ["43UC","Epsom and Ewell District",26311],                                                                              
                                        ["45UH","Worthing District",17904],                                                                                     
                                        ["41UB","Cannock Chase District",15251],                                                                                
                                        ["00AJ","Ealing",12522],                                                                                                
                                        ["00AK","Enfield",12520],                                                                                               
                                        ["00AF","Bromley",20646],                                                                                               
                                        ["00AX","Kingston upon Thames",22811],                                                                                  
                                        ["00BB","Newham",4303],                                                                                                 
                                        ["00BZ","St. Helens District",12278],                                                                                   
                                        ["00CU","Walsall District",10952],                                                                                      
                                        ["00CC","Barnsley District",11330],                                                                                     
                                        ["00CM","Sunderland District",10908],                                                                                   
                                        ["00FB","East Riding of Yorkshire",20448],                                                                              
                                        ["00HA","Bath and North East Somerset",22516],                                                                          
                                        ["00FY","City of Nottingham",8379],                                                                                     
                                        ["00ET","Halton",10407],                                                                                                
                                        ["00HG","City of Plymouth",13225],                                                                                      
                                        ["00KG","Thurrock",16263],                                                                                              
                                        ["00FF","York",22147],                                                                                                  
                                        ["00HD","South Gloucestershire",23613],                                                                                 
                                        ["00HN","Bournemouth",14020],                                                                                           
                                        ["00FC","North East Lincolnshire",12750],                                                                               
                                        ["00KC","Central Bedfordshire",23976],                                                                                  
                                        ["18UB","East Devon District",20325],                                                                                   
                                        ["22UF","Chelmsford District",25064],                                                                                   
                                        ["00HE","Cornwall",13362],                                                                                              
                                        ["24UH","Havant District",14503],                                                                                       
                                        ["22UE","Castle Point District",19675],                                                                                 
                                        ["24UF","Gosport District",17533],                                                                                      
                                        ["18UK","Torridge District",14348],                                                                                     
                                        ["23UF","Stroud District",22780],                                                                                       
                                        ["23UC","Cotswold District",23142],                                                                                     
                                        ["23UD","Forest of Dean District",18104],                                                                               
                                        ["17UD","Chesterfield District",13764],                                                                                 
                                        ["38UB","Cherwell District",21965],                                                                                     
                                        ["26UD","East Hertfordshire District",26604],                                                                           
                                        ["43UM","Woking District",24840],                                                                                       
                                        ["47UF","Wychavon District",21310],                                                                                     
                                        ["36UG","Scarborough District",13463],                                                                                  
                                        ["44UD","Rugby District",20713],                                                                                        
                                        ["41UK","Tamworth District",16357],                                                                                     
                                        ["00GG","Shropshire",18087],                                                                                            
                                        ["47UE","Worcester District",17127],                                                                                    
                                        ["43UK","Tandridge District",24195],                                                                                    
                                        ["00AW","Kensington and Chelsea",14003],                                                                                
                                        ["00AY","Lambeth",8403],                                                                                                
                                        ["00BA","Merton",20384],                                                                                                
                                        ["00BG","Tower Hamlets",5785],                                                                                          
                                        ["00BT","Tameside District",10941],                                                                                     
                                        ["00BS","Stockport District",18357],                                                                                    
                                        ["00BX","Knowsley District",7094],                                                                                      
                                        ["00CA","Sefton District",14747],                                                                                       
                                        ["00CE","Doncaster District",11028],                                                                                    
                                        ["00CS","Sandwell District",7068],                                                                                      
                                        ["00MW","Isle of Wight",14557],                                                                                         
                                        ["00CX","Bradford District",11105],                                                                                     
                                        ["00HX","Swindon",19391],                                                                                               
                                        ["00DA","Leeds District",14162],                                                                                        
                                        ["00GA","County of Herefordshire",16714],                                                                               
                                        ["00EH","Darlington",13939],                                                                                            
                                        ["00ME","Windsor and Maidenhead",25523],                                                                                
                                        ["00MC","Reading",15536],                                                                                               
                                        ["17UK","South Derbyshire District",20836],                                                                             
                                        ["12UC","East Cambridgeshire District",23418],                                                                          
                                        ["12UB","Cambridge District",18557],                                                                                    
                                        ["21UF","Lewes District",18764],                                                                                        
                                        ["19UE","North Dorset District",20539],                                                                                 
                                        ["29UK","Sevenoaks District",24011],                                                                                    
                                        ["32UH","West Lindsey District",18143],                                                                                 
                                        ["30UE","Chorley District",18442],                                                                                      
                                        ["36UH","Selby District",21960],                                                                                        
                                        ["41UE","Newcastle-under-Lyme District",16962],                                                                         
                                        ["26UK","Watford District",19302],                                                                                      
                                        ["41UF","South Staffordshire District",22338],                                                                          
                                        ["47UB","Bromsgrove District",24002],                                                                                   
                                        ["42UF","St. Edmundsbury District",20829],                                                                              
                                        ["45UC","Arun District",17074],                                                                                         
                                        ["00AH","Croydon",14280],                                                                                               
                                        ["00AQ","Harrow",19023],                                                                                                
                                        ["00AZ","Lewisham",8430],                                                                                               
                                        ["00AS","Hillingdon",15977],                                                                                            
                                        ["00BR","Salford District",9398],                                                                                       
                                        ["00BU","Trafford District",19443],                                                                                     
                                        ["00CQ","Coventry District",12102],                                                                                     
                                        ["00CJ","Newcastle upon Tyne District",12570],                                                                          
                                        ["00CH","Gateshead District",11385],                                                                                    
                                        ["00CZ","Kirklees District",13866],                                                                                     
                                        ["00MS","City of Southampton",12904],                                                                                   
                                        ["00FD","North Lincolnshire",15566],                                                                                    
                                        ["00DB","Wakefield District",13096],                                                                                    
                                        ["22UG","Colchester District",19940],                                                                                   
                                        ["18UD","Mid Devon District",17141],                                                                                    
                                        ["18UE","North Devon District",15554],                                                                                  
                                        ["21UH","Wealden District",22352],                                                                                      
                                        ["24UE","Fareham District",26619],                                                                                      
                                        ["24UB","Basingstoke and Deane District",23687],                                                                        
                                        ["00HF","Isles of Scilly",16037],                                                                                       
                                        ["23UG","Tewkesbury District",23796],                                                                                   
                                        ["37UG","Newark and Sherwood District",17099],                                                                          
                                        ["22UQ","Uttlesford District",26330],                                                                                   
                                        ["11UC","Chiltern District",26463],                                                                                     
                                        ["22UK","Maldon District",21403],                                                                                       
                                        ["11UF","Wycombe District",23035],                                                                                      
                                        ["11UE","South Bucks District",24670],                                                                                  
                                        ["36UC","Hambleton District",23271],                                                                                    
                                        ["29UL","Shepway District",13427],                                                                                      
                                        ["29UM","Swale District",14135],                                                                                        
                                        ["31UJ","Oadby and Wigston District",23528],                                                                            
                                        ["32UC","East Lindsey District",12592],                                                                                 
                                        ["31UE","Hinckley and Bosworth District",22596],                                                                        
                                        ["34UE","Kettering District",19206],                                                                                    
                                        ["29UP","Tonbridge and Malling District",23369],                                                                        
                                        ["33UG","Norwich District",12721],                                                                                      
                                        ["30UP","West Lancashire District",17198],                                                                              
                                        ["30UQ","Wyre District",18620],                                                                                         
                                        ["41UH","Staffordshire Moorlands District",18639],                                                                      
                                        ["41UC","East Staffordshire District",17920],                                                                           
                                        ["43UH","Spelthorne District",23114],                                                                                   
                                        ["42UH","Waveney District",14797],                                                                                      
                                        ["45UF","Horsham District",25721],                                                                                      
                                        ["45UB","Adur District",16130],                                                                                         
                                        ["43UF","Reigate and Banstead District",24959],                                                                         
                                        ["00AB","Barking and Dagenham",7099],                                                                                   
                                        ["00AE","Brent",9332],                                                                                                  
                                        ["00AG","Camden",12443],                                                                                                
                                        ["00BN","Manchester District",6170],                                                                                    
                                        ["00BQ","Rochdale District",10089],                                                                                     
                                        ["00CL","South Tyneside District",11548],                                                                               
                                        ["00CF","Rotherham District",11915],                                                                                    
                                        ["00ML","The City of Brighton & Hove",12574],                                                                           
                                        ["00GF","Telford and Wrekin",14426],                                                                                    
                                        ["00KA","Luton",12620],                                                                                                 
                                        ["00EC","Middlesbrough",9603],                                                                                          
                                        ["00MG","Milton Keynes",20073],                                                                                         
                                        ["00MA","Bracknell Forest",24951],                                                                                      
                                        ["22UH","Epping Forest District",20255],                                                                                
                                        ["24UC","East Hampshire District",25398],                                                                               
                                        ["24UG","Hart District",29834],                                                                                         
                                        ["12UG","South Cambridgeshire District",27562],                                                                         
                                        ["22UC","Braintree District",20185],                                                                                    
                                        ["16UC","Barrow-in-Furness District",10773],                                                                            
                                        ["29UG","Gravesham District",16902],                                                                                    
                                        ["22UN","Tendring District",13301],                                                                                     
                                        ["12UE","Huntingdonshire District",23925],                                                                              
                                        ["17UC","Bolsover District",11466],                                                                                     
                                        ["19UC","Christchurch District",21590],                                                                                 
                                        ["34UD","East Northamptonshire District",21034],                                                                        
                                        ["30UG","Hyndburn District",11005],                                                                                     
                                        ["34UF","Northampton District",15762],                                                                                  
                                        ["34UH","Wellingborough District",16213],                                                                               
                                        ["24UP","Winchester District",26115],                                                                                   
                                        ["34UB","Corby District",10576],                                                                                        
                                        ["26UF","North Hertfordshire District",23720],                                                                          
                                        ["31UD","Harborough District",26780],                                                                                   
                                        ["26UB","Broxbourne District",20099],                                                                                   
                                        ["37UD","Broxtowe District",20655],                                                                                     
                                        ["47UG","Wyre Forest District",16204],                                                                                  
                                        ["44UB","North Warwickshire District",18189],                                                                           
                                        ["26UG","St. Albans District",26701],                                                                                   
                                        ["37UB","Ashfield District",11932],                                                                                     
                                        ["31UB","Blaby District",24604],                                                                                        
                                        ["45UE","Crawley District",17471],                                                                                      
                                        ["43UJ","Surrey Heath District",27616],                                                                                 
                                        ["47UD","Redditch District",15811],                                                                                     
                                        ["45UG","Mid Sussex District",26677],                                                                                   
                                        ["40UE","Taunton Deane District",18721],                                                                                
                                        ["40UF","West Somerset District",11319],                                                                                
                                        ["00AA","City of London",22758],                                                                                        
                                        ["00AN","Hammersmith and Fulham",10773],                                                                                
                                        ["00BK","City of Westminster",13103],                                                                                   
                                        ["00BL","Bolton District",11820],                                                                                       
                                        ["00BF","Sutton",19711],                                                                                                
                                        ["00CN","Birmingham District",8000],                                                                                    
                                        ["00CK","North Tyneside District",15596],                                                                               
                                        ["00MR","City of Portsmouth",13142],                                                                                    
                                        ["00CY","Calderdale District",14509],                                                                                   
                                        ["00FA","City of Kingston upon Hull",8231],                                                                             
                                        ["00HH","Torbay",11915],                                                                                                
                                        ["00HB","City of Bristol",14011],                                                                                       
                                        ["00MB","West Berkshire",24437],                                                                                        
                                        ["00MF","Wokingham",29141],                                                                                             
                                        ["00EX","Blackburn with Darwen",9789],                                                                                  
                                        ["00EF","Stockton-on-Tees",15614],                                                                                      
                                        ["18UL","West Devon District",17236],                                                                                   
                                        ["00EW","Cheshire West and Chester",19446],                                                                             
                                        ["22UD","Brentwood District",24675],                                                                                    
                                        ["22UB","Basildon District",16662],                                                                                     
                                        ["24UJ","New Forest District",23267],                                                                                   
                                        ["24UL","Rushmoor District",22343],                                                                                     
                                        ["21UC","Eastbourne District",12776],                                                                                   
                                        ["37UE","Gedling District",19605],                                                                                      
                                        ["11UB","Aylesbury Vale District",24273],                                                                               
                                        ["21UD","Hastings District",8570],                                                                                      
                                        ["23UB","Cheltenham District",20611],                                                                                   
                                        ["19UG","Purbeck District",19912],                                                                                      
                                        ["16UE","Copeland District",12744],                                                                                     
                                        ["32UB","Boston District",12855],                                                                                       
                                        ["26UC","Dacorum District",23668],                                                                                      
                                        ["31UC","Charnwood District",21703],                                                                                    
                                        ["30UD","Burnley District",8887],                                                                                       
                                        ["33UH","South Norfolk District",22760],                                                                                
                                        ["44UE","Stratford-on-Avon District",23637],                                                                            
                                        ["33UF","North Norfolk District",15121],                                                                                
                                        ["30UJ","Pendle District",11325],                                                                                       
                                        ["29UB","Ashford District",19050],                                                                                      
                                        ["44UC","Nuneaton and Bedworth District",14846],                                                                        
                                        ["26UH","Stevenage District",17472],                                                                                    
                                        ["26UJ","Three Rivers District",25020],                                                                                 
                                        ["36UF","Ryedale District",20002],                                                                                      
                                        ["45UD","Chichester District",20502],                                                                                   
                                        ["00HY","Wiltshire",22229],                                                                                             
                                        ["40UC","Sedgemoor District",16870],                                                                                    
                                        ["38UF","West Oxfordshire District",26577]
                                      ]
    
    rmvpp[pluginName].columnMappingParameters = [
        {   targetProperty:         "featureid", 
            formLabel:              "Feature Id"
        }, 
        {   targetProperty:         "measure", 
            formLabel:              "Measure"
        }, 
        {   targetProperty:         "tooltip1", 
            formLabel:              "Tool Tip 1"
        }, 
        {   targetProperty:         "tooltip2", 
            formLabel:              "Tool Tip 2"
        }, 
        {   targetProperty:         "tooltip3", 
            formLabel:              "Tool Tip 3"
        }
    ]
    
     rmvpp[pluginName].configurationParameters = [  
        { 
            "targetProperty":"topojsonfile", 
            "label":"Date Topology Json File Name",
            "inputType":"dropdown",
            "inputOptions": {    
                "multiSelect": false,
                "values":["localAuthority.topojson","Worldmap.topojson"] ,  
                "defaultSelection": 1
            }
        },
        { 
            "targetProperty":"topojson_property_id", 
            "label":"Topology JSON Property Id",
            "inputType":"textbox",
            "inputOptions": {               
                "defaultValue": "localAuthority"             
            }
        },
        { 
            "targetProperty":"colour_range_start", 
            "label":"Starting Colour",
            "inputType":"colorpicker",
            "inputOptions": {               
                "defaultValue": "#FF00FF"             
            }
        },
        { 
            "targetProperty":"colour_range_end", 
            "label":"Ending Colour",
            "inputType":"colorpicker",
            "inputOptions": {               
                "defaultValue": "#00FFFF"             
            }
        },
        { 
            "targetProperty":"tooltip1_label", 
            "label":"Tooltip 1 Label",
            "inputType":"textbox",
            "inputOptions": {               
                "defaultValue": "Label 1"             
            }
        },
        { 
            "targetProperty":"tooltip2_label", 
            "label":"Tooltip 2 Label",
            "inputType":"textbox",
            "inputOptions": {               
                "defaultValue": "Label 2"             
            }
        },
        { 
            "targetProperty":"tooltip3_label", 
            "label":"Tooltip 3 Label",
            "inputType":"textbox",
            "inputOptions": {               
                "defaultValue": "Label 3"             
            }
        }
        
        
      ]
    

    rmvpp[pluginName].render = function(data, columnNames, config, container)   {


        //var selectedMeasure;
        var lookUpFeature = {};
        var numArr = []
        
        // Determine Min and Max measure values
        for ( row in data )   {    
            numArr.push(data[row].measure)
        }

        var maxMeasureValue = Math.max.apply(null, numArr)
        var minMeasureValue = Math.min.apply(null, numArr)

        // Populate feature lookup object
        for ( row in data )   {    
            lookUpFeature[data[row].featureid] = {}
            lookUpFeature[data[row].featureid]["measure"] = data[row].measure;
            lookUpFeature[data[row].featureid]["tooltip1"] = data[row].tooltip1;
            lookUpFeature[data[row].featureid]["tooltip2"] = data[row].tooltip2;
            lookUpFeature[data[row].featureid]["tooltip3"] = data[row].tooltip3;
        }
        
        
            
        var o = d3.scale.ordinal()
            .domain(d3.range(50))
            .rangeRoundBands([0, 95]);

        var width = 600,
            height = 800,
            active = d3.select(null);

        var fill = d3.scale.log()
            .domain([minMeasureValue, maxMeasureValue])
            .range([config.colour_range_start, config.colour_range_end]);

        var projection = d3.geo.albers()
            .center([-3, 55.5])
            .rotate([0, 0])
            .parallels([50, 60])
            .scale(4000)
            .translate([width / 2, height / 2]);

        var zoom = d3.behavior.zoom()
            .translate([0, 0])
            .scale(1)
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select(container).append("svg")
            //.attr("id", visualisationContainerID)
            .attr("width", width)
            .attr("height", height)
            .on("click", stopped, true);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset);

        var g = svg.append("g").attr("transform", "scale(100    )")

        svg.call(zoom) // delete this line to disable free zooming
           .call(zoom.event);


        d3.json("/rmvpp/plugins/maps/" + config.topojsonfile, function(error, uk) {  //LA  

            g.selectAll("path")
                .data(topojson.feature(uk, uk.objects[config.topojson_property_id]).features) 
              .enter().append("path")
                .attr("d", path)
                .attr("class", "feature")
                .on("click", clicked)
                //.on("dblclick", dblclicked)
                .style("fill", function(d,i) { 
                    
                    if (typeof lookUpFeature[d.id] === 'object') {
                        
                        return fill(lookUpFeature[d.id].measure); 
                    }
                })
                .call(tip)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

                // Overlay mesh
                //g.append("path")
                //  .datum(topojson.mesh(uk, uk.objects[pluginConfig.topojson_property_id], function(a, b) { return a !== b; }))             
                //  .attr("class", "mesh")
                //  .attr("d", path);
        });

        // Setup tooltips
        var tip = d3.tip()
            .attr('class', 'map-la-d3-tip')
            .html(function(d) {
                
                var content = "";
                if (lookUpFeature[d.id].tooltip1 !== undefined)   {   
                    content += '<p>' + config.tooltip1_label + ' : ' + lookUpFeature[d.id].tooltip1 + '</p>';
                }
                if (lookUpFeature[d.id].tooltip2 !== undefined)   {   
                    content += '<p>' + config.tooltip2_label + ' : ' + lookUpFeature[d.id].tooltip2 + '</p>';
                }
                if (lookUpFeature[d.id].tooltip3 !== undefined)   {   
                    content += '<p>' + config.tooltip3_label + ' : ' + lookUpFeature[d.id].tooltip3 + '</p>';
                }

                return content;
            })
            .offset(function() {
                return [(this.getBBox().height / 2) -15, 15];
            });
            

        function clicked(d) {

          if (active.node() === this) return reset();
          active.classed("active", false);
          active = d3.select(this).classed("active", true);

          var bounds = path.bounds(d),
              dx = bounds[1][0] - bounds[0][0],
              dy = bounds[1][1] - bounds[0][1],
              x = (bounds[0][0] + bounds[1][0]) / 2,
              y = (bounds[0][1] + bounds[1][1]) / 2,
              scale = 0.3 / Math.max(dx / width, dy / height),
              translate = [width / 2 - scale * x, height / 2 - scale * y];

          svg.transition()
              .duration(750)
              .call(zoom.translate(translate).scale(scale).event);
        }

        function reset() {
          active.classed("active", false);
          active = d3.select(null);

          svg.transition()
              .duration(750)
              .call(zoom.translate([0, 0]).scale(1).event);
        }

        function zoomed() {
          g.style("stroke-width", 1.5 / d3.event.scale + "px");
          g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        // If the drag behavior prevents the default click,
        // also stop propagation so we don’t click-to-zoom.
        function stopped() {
          if (d3.event.defaultPrevented) d3.event.stopPropagation();
        }

    }

    // Do not modify this line
    return rmvpp;
    

}(rmvpp || {}))