 rmvpp = (function(rmvpp){


    /**
     *  Plugin Configuration
     */
    var pluginName = "rmvpp-sankey"
    var pluginDescription = "Sankey Diagram"
    var rowLimit = 50000;


    // Do not modify these lines
    rmvpp[pluginName] = {};
    rmvpp[pluginName].pluginDescription = pluginDescription;
    rmvpp[pluginName].rowLimit = rowLimit;



    rmvpp[pluginName].testData = [
                                        ["Source 1", "Target 1", "1,000.34"],
                                        ["Source 1", "Target 2", "1,034,000.11"],
                                        ["Source 1", "Target 3", "6,656"],
                                        ["Source 2", "Target 1", "3,400"],
                                        ["Source 2", "Target 2", "2,344.73"],
                                        ["Source 2", "Target 3", "7,700"],
                                        ["Source 3", "Target 1", "2,300"],
                                        ["Source 3", "Target 1", "6,300"],
                                        ["Source 4", "Target 3", "7,400"],
    ]


    rmvpp[pluginName].columnMappingParameters = [
            {
                targetProperty:"source",
                formLabel:"Source"
            },
            {
                targetProperty:"target",
                formLabel:"Target"
            },
            {
                targetProperty:"measure",
                formLabel:"Measure"
            },
    ]

    rmvpp[pluginName].configurationParameters = [
        {
            "targetProperty":"width",
            "label":"Width",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": "1500"
            }
        },
        {
            "targetProperty":"height",
            "label":"Height",
            "inputType":"textbox",
            "inputOptions": {
                "defaultValue": "600"
            }
        }
    ]

    rmvpp[pluginName].render = function(data, columnNames, config, container)   {

        pluginData = data
        // Prepare Data
        function cloneRows(rows) {
            return _.map(rows.slice(0), function(d) {
                return _.clone(d);
            });
        }

        function parseRows(_rows) {
            var rows = cloneRows(_rows);

            var targets = _.chain(rows)
                .pluck('source')
                .uniq()
                .value();
            var sources = _.chain(rows)
                .pluck('target')
                .uniq()
                .value();
            var nodes = _.map(sources.concat(targets), function(name) {
                return {
                    name: name
                };
            });

            return {
                nodes: nodes,
                links: rows
            };
        }

        var rawdata=[];

        for ( row in pluginData )   {

            if ( pluginData[row].source != pluginData[row].target )    {
                rawdata.push(
                            {
                                source: pluginData[row].source,
                                target: pluginData[row].target,
                                value: +pluginData[row].measure.replace(/,/g,'')
                            }
                )
            }
        }

        var data = {"nodes" : [], "links" : []};
        rawdata.forEach(function (d) {
         
            if ( d.value > 0 ) {
                data.nodes.push({ "name": d.source });
                data.nodes.push({ "name": d.target });
                data.links.push({ "source": d.source,
                                   "target": d.target,
                                   "value": d.value });
                       }
           });

           // return only the distinct / unique nodes
           data.nodes = d3.keys(d3.nest()
             .key(function (d) { return d.name; })
             .map(data.nodes));


           // loop through each link replacing the text with its index from node
           data.links.forEach(function (d, i) {
             data.links[i].source = data.nodes.indexOf(data.links[i].source);
             data.links[i].target = data.nodes.indexOf(data.links[i].target);
           });

           //now loop through each nodes to make nodes an array of objects
           // rather than an array of strings
           data.nodes.forEach(function (d, i) {
             data.nodes[i] = { "name": d };
           });

        //var data = parseRows(rawdata)


        // Render Visual
        var margin = {top: 5, right: 200, bottom: 5, left: 200},
            width  = config.width - margin.left - margin.right,
            height = config.height - margin.top - margin.bottom;


        var color = d3.scale.category20();


        var svg = d3.select(container).append("svg")
            //.attr("id", visualisationContainerID)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(15)
            .size([width,height])
//            .schema({
//              id: "name",
//              source: "source",
//              target: "target",
//              value: "measure"
//        });

        var path = sankey.link();

        sankey
            .nodes(data.nodes)
            .links(data.links)
            .layout(2);

        // Setup tooltips
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) {
                var content = '<p><strong>Value: $' + d3.format(",")(d.value) + '</strong></p>';
                return content;
            })
            .offset(function() {
                return [this.getBBox().height / 2, 0];
            });


        // Draw links
        var link = svg.append("g").selectAll(".link")
            .data(data.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style('stroke', function(d) {
                // Convert to HSL, then desaturate the node color to get the link color
                var c = d3.hsl(color(d.source.name));
                d.bright = d3.rgb(c).darker(1);
                c.s = c.s * 10;
                c.l = Math.min(c.l, 0.9);
                d.light = c;
                return d3.rgb(c);
            })
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy);
            })
            .sort(function(a, b) { return b.dy - a.dy; })
            .call(tip)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // Draw nodes
        var node = svg.append("g").selectAll(".node")
            .data(data.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() {
		  this.parentNode.appendChild(this); })
      .on("drag", dragmove))

            .on("mouseenter", function(d) {
                var filterTargets;
                if(d.targetLinks.length > 0) {
                    filterTargets = 'target';
                } else {
                    filterTargets = 'source';
                }

                // Pass an array with all linked nodes
                var linked = d.sourceLinks.concat(d.targetLinks).map(function(d) {
                    var t = ((filterTargets === 'source') ? 'target' : 'source');
                    return d[t].name;
                });
                linked.push(d.name);

                // Filter
                filterByEntity(d.name, filterTargets, linked);
            })
            .on('mouseleave', filterClear);

        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", nodeWidth)
            .style("fill", function(d) {
                if(d.sourceLinks.length > 0) {
                    d.color = color(d.name);
                    return d.color;
                }
                d.color = '#EEE';
                return d.color;
            })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(1);
            });

        function nodeWidth(d) {
            if(d.sourceLinks.length > 0) {
                return sankey.nodeWidth();
            }
            return sankey.nodeWidth() / 1.5;
        }

        // Label nodes
        var labels = node.append("text")
            .attr("x", sankey.nodeWidth() + 3)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .text(function(d) { return d.name; });

        labels.filter(function(d) { return d.x < width / 2; })
            .attr("x", -1 * sankey.nodeWidth())
            .attr("text-anchor", "end");

        function filterByEntity(entity, targets, linked) {
            link.classed('inactive', function(d) {
              if(d[targets].name !== entity) {
                return 'inactive';
              }
            });
            link.classed('active', function(d) {
              if(d[targets].name === entity) {
                return 'active';
              }
            });
            link.style('stroke', function(d) {
              if(d[targets].name === entity) {
                return d.bright;
              }
              else {
                return d.light;
              }
            });
            node.classed('inactive', function(d) {
              return linked.indexOf(d.name) === -1;
            });

            //node.selectAll('.node').data(filtered).exit().remove();
        }

        function filterClear() {
            link.classed("inactive", false);
            link.classed("active", false);
            node.classed('inactive', false);

            link.style('stroke', function(d) {
              return d.light;
            });
        }



          function dragmove(d) {
            d3.select(this).attr("transform",
                "translate(" + (
                           d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
                        ) + "," + (
                           d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                    ) + ")");
            sankey.relayout();
            link.attr("d", path);
          }

    }


    return rmvpp;


}(rmvpp || {}))