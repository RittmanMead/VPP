# Visual Plugin Pack for OBIEE

The Visual Plugin Pack for OBIEE is a Javascript framework that allows developers to quickly and easily add custom visualisations to OBIEE. Report writers can then add and configure these visualisations using a UI within OBIEE itself.

##How Does it Work ?

The framework takes advantage of the OBIEE Narrative view while abstracting away it's complexities allowing plugin developers to focus on visualisation code while the framework takes of the OBIEE integration. 

###Features

* Supports any Javascript library.
* Easy to deploy
* Configuration driven dependancy loading.
* Configuration driven plugin UI's.
* Allows for local plugin development outside of OBIEE.
* Zero code required for OBIEE report writers

###Documentation

* [Installation Guide](https://github.com/RittmanMead/Visual-Plugin-Pack-for-OBIEE/wiki/Installation Guide)
* [Developer's Guide](https://github.com/RittmanMead/Visual-Plugin-Pack-for-OBIEE/wiki/Developer's Guide)

###Sankey Demo

![](https://cloud.githubusercontent.com/assets/4244838/7195502/9100f9dc-e4b8-11e4-84a8-ccf40b3b084a.gif)

###Pivot Table Demo

![](https://cloud.githubusercontent.com/assets/4244838/7195501/91005dba-e4b8-11e4-8d79-58f26900bb31.gif)

###Limitations

* Native OBIEE Export and Print functionality will not work on visualisations rendered with the Visual Plugin Pack. 
* Data set size matters. OBIEE's Narrative view will give you access to as many rows as you ask it to. The Visual Plugin Pack currently defaults to a configurable 50,000 rows. It is a reality of client side visualisations that there is a severe drop off in browser performance once your data set gets too large, usually memory being the bottleneck. Some visualisations perform better than others, it depends on the computational complexities and the number of DOM elements created during the render process. Dependant upon the visualisation don't expect to chuck 200,000 rows at a it and for it be responsive and/or load quickly.

###Contribute

If you'd like to get involved in developing the Visual Plugin Pack further, here are some ways you can help out.

* Browser/OBIEE version testing. Currently only tested and confirmed as functional in Firefox, Safari, Chrome and IE10 using OBIEE 11.1.1.7.140415.
* Plugin Creation
* Extending Existing Plugin Functionality
* Core Framework Development
* Break it for fun and report the bugs ;-)


