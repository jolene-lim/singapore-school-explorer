var width = document.getElementById("networks").offsetWidth,
    height = document.getElementById("networks").offsetHeight,
    subW = width / 2,
    subH = height / 2,
    r = 3;

var svg = d3.select("#networks")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
/*
width = document.getElementById("networks").offsetWidth,
height = document.getElementById("networks").offsetHeight;
*/

var subSVG = d3.select("#networks-subgraph")
    .append("svg")
    .attr("width", subW)
    .attr("height", subH)

var mapColors = {
    "PRIMARY": "#e2211c",
    "SECONDARY": "#0056b8",
    "JUNIOR COLLEGE": "#ff9e1a",
    "MIXED LEVEL": "#00943a",
    "CENTRALISED INSTITUTE": "#9e27b5"
};

var simulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 4))
    .force("y", d3.forceY(height / 4))
    .force("link", d3.forceLink().id(function (d) { return d.name; }))
    .force("charge", d3.forceManyBody().strength(-15))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(r + 1));

d3.json("data/network_data.json", function (error, graph) {
    if (error) throw error;
    console.log(graph);
    var link = svg.append("g")
        .selectAll("line")
        .data(graph.links).enter()
        .append("line")
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; })
        .attr("stroke", "Gray")
        .style("opacity", 1.0);

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", function (d) { return mapColors[d.level]; })
        .attr("fill-opacity", 0.85)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
    };


    node
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "black").attr("r", 15);

            d3.select("#networkSchoolName").text("School: " + d.name);

            var cluster = d.cluster;
            if (cluster != 0) {
                var subNodes = graph.nodes.filter(function (d) { return d.cluster == cluster; })
                var subLinks = graph.links.filter(function (d) { return d.cluster == cluster; })
                var subNodes = [...subNodes]
                var subLinks = [...subLinks]

                var offsetX = subW / 2 - subNodes[0].x;
                var offsetY = subH / 2 - subNodes[0].y;

                document.querySelector("#networks-subgraph svg").innerHTML = "";

                var subLink = subSVG
                    .selectAll("subLine")
                    .data(subLinks).enter()
                    .append("line")
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; })
                    .attr("stroke", "LightGray")
                    .style("opacity", 0.5)
                    .attr("transform", function () {
                        return "translate (" + offsetX + ", " + offsetY + ")"
                    });

                var subNodeG = subSVG
                    .selectAll("subG")
                    .data(subNodes)
                    .enter()
                    .append("g")

                var subNode = subNodeG.append("circle")
                    .attr("r", 5)
                    .attr("fill", function (d) { return mapColors[d.level]; })
                    .attr("fill-opacity", 0.5)
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; })
                    .attr("transform", function () {
                        return "translate (" + offsetX + ", " + offsetY + ")"
                    });

                subNodeG.append("text")
                    .text(function (d) { return d.name; })
                    .style("font-size", "0.30em")
                    .attr("x", function (d) { return d.x; })
                    .attr("y", function (d) { return d.y; })
                    .attr("transform", function () {
                        return "translate (" + offsetX + ", " + offsetY + ")"
                    });

                subSVG
                    .attr("width", subW)
                    .attr("height", subH)
                    .attr("transform", "translate(" + width / 5 + "," + height / 6 + ") scale(" + 2.5 + ")")
            }
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke", false)
                .attr("r", 5);
        })

});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
