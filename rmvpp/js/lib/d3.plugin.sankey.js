d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [],
	  // cycle features
	  cycleLaneNarrowWidth = 4,
	  cycleLaneDistFromFwdPaths = -10,  // the distance above the paths to start showing 'cycle lanes'
	  cycleDistFromNode = 30,      // linear path distance before arcing from node
          cycleControlPointDist = 30,  // controls the significance of the cycle's arc
	  cycleSmallWidthBuffer = 2  // distance between 'cycle lanes'
	  ;

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  // cycle related attributes
  sankey.cycleLaneNarrowWidth = function(_) {
    if (!arguments.length) return cycleLaneNarrowWidth;
    cycleLaneNarrowWidth = +_;
    return sankey;
  }

  sankey.cycleSmallWidthBuffer = function(_) {
    if (!arguments.length) return cycleSmallWidthBuffer;
    cycleSmallWidthBuffer = +_;
    return sankey;
  }

  sankey.cycleLaneDistFromFwdPaths = function(_) {
    if (!arguments.length) return cycleLaneDistFromFwdPaths;
    cycleLaneDistFromFwdPaths = +_;
    return sankey;
  }

  sankey.cycleDistFromNode = function(_) {
    if (!arguments.length) return cycleDistFromNode;
    cycleDistFromNode = +_;
    return sankey;
  }

  sankey.cycleControlPointDist = function(_) {
    if (!arguments.length) return cycleControlPointDist;
    cycleControlPointDist = +_;
    return sankey;
  }

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    markCycles();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
    if( d.causesCycle ) {
      // cycle node; reaches backward

      /*
      The path will look like this, where
      s=source, t=target, ?q=quadratic focus point
     (wq)-> /-----n-----\
            |w          |
            |           e
            \-t         |
                     s--/ <-(eq)
      */
      // Enclosed shape using curves n' stuff
      var smallWidth = cycleLaneNarrowWidth,

	    s_x = d.source.x + d.source.dx,
	    s_y = d.source.y + d.sy + d.dy,
		t_x = d.target.x,
        t_y = d.target.y,
		se_x = s_x + cycleDistFromNode,
		se_y = s_y,
		ne_x = se_x,
		ne_y = cycleLaneDistFromFwdPaths - (d.cycleIndex * (smallWidth + cycleSmallWidthBuffer) ),  // above regular paths, in it's own 'cycle lane', with a buffer around it
		nw_x = t_x - cycleDistFromNode,
		nw_y = ne_y,
		sw_x = nw_x,
		sw_y = t_y + d.ty + d.dy;

      // start the path on the outer path boundary
	  return "M" + s_x + "," + s_y
		+ "L" + se_x + "," + se_y
		+ "C" + (se_x + cycleControlPointDist) + "," + se_y + " " + (ne_x + cycleControlPointDist) + "," + ne_y + " " + ne_x + "," + ne_y
		+ "H" + nw_x
		+ "C" + (nw_x - cycleControlPointDist) + "," + nw_y + " " + (sw_x - cycleControlPointDist) + "," + sw_y + " " + sw_x + "," + sw_y
		+ "H" + t_x
		//moving to inner path boundary
		+ "V" + ( t_y + d.ty )
		+ "H" + sw_x
		+ "C" + (sw_x - (cycleControlPointDist/2) + smallWidth) + "," + t_y + " " +
		        (nw_x - (cycleControlPointDist/2) + smallWidth) + "," + (nw_y + smallWidth) + " " +
				nw_x + "," + (nw_y + smallWidth)
		+ "H" + (ne_x - smallWidth)
		+ "C" + (ne_x + (cycleControlPointDist/2) - smallWidth) + "," + (ne_y + smallWidth) + " " +
		        (se_x + (cycleControlPointDist/2) - smallWidth) + "," + (se_y - d.dy) + " " +
				se_x + "," + (se_y - d.dy)
		+ "L" + s_x + "," + (s_y - d.dy);

    } else {
      // regular forward node
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
		  if( !link.causesCycle ) {
            nextNodes.push(link.target);
		  }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  /* Cycle Related computations */
  function markCycles() {
    // ideally, find the 'feedback arc set' and remove them.
    // This way is expensive, but should be fine for small numbers of links
    var cycleMakers = [];
    var addedLinks = new Array();
    links.forEach(function(link) {
      if( createsCycle( link.source, link.target, addedLinks ) ) {
	    link.causesCycle=true;
		link.cycleIndex = cycleMakers.length;
        cycleMakers.push( link );
      } else {
        addedLinks.push(link);
      }
    });
  };


  function createsCycle( originalSource, nodeToCheck, graph ) {
    if( graph.length == 0 ) {
      return false;
    }

    var nextLinks = findLinksOutward( nodeToCheck, graph );
    // leaf node check
    if( nextLinks.length == 0 ) {
      return false;
    }

    // cycle check
    for( var i = 0; i < nextLinks.length; i++ ) {
      var nextLink = nextLinks[i];

      if( nextLink.target === originalSource ) {
        return true;
      }

      // Recurse
      if( createsCycle( originalSource, nextLink.target, graph ) ) {
        return true;
      }
    }

    // Exhausted all links
    return false;
  };

  /* Given a node, find all links for which this is a source
     in the current 'known' graph  */
  function findLinksOutward( node, graph ) {
    var children = [];

    for( var i = 0; i < graph.length; i++ ) {
      if( node == graph[i].source ) {
        children.push( graph[i] );
      }
    }

    return children;
  }


  return sankey;
};