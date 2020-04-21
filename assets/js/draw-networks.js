var canvas = d3.select("#networks")
    .append("canvas")
    .attr("width", 600)
    .attr("height", 600),
    width = canvas.attr("width"),
    height = canvas.attr("height"),
    ctx = canvas.node().getContext("2d"),
    r = 3,
    color = d3.scaleOrdinal() // D3 Version 4
        .domain(["PRIMARY", "SECONDARY", "JUNIOR COLLEGE", "MIXED LEVEL", "CENTRALISED INSTITUTE"])
        .range(["red", "blue", "green", "yellow", "pink"]),
    simulation = d3.forceSimulation()
        .force("x", d3.forceX(width / 2))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(r + 1))
        .force("charge", d3.forceManyBody()
            .strength(-20))
        .force("link", d3.forceLink()
            .id(function (d) { return d.name; })),
    nested = 0;

d3.json("assets/js/graphFile.json", function (err, graph) {
    if (err) throw err;

    simulation.nodes(graph.nodes);
    simulation.force("link")
        .links(graph.links);
    simulation.on("tick", update);

    canvas
        .call(d3.drag()
            .container(canvas.node())
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    function update() {
        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#aaa";
        graph.links.forEach(drawLink);
        ctx.stroke();


        ctx.globalAlpha = 1.0;
        graph.nodes.forEach(drawNode);
    }

    function dragsubject() {
        return simulation.find(d3.event.x, d3.event.y);
    }

});

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;

    // Appending Name
    var currentNode = d3.event.subject;
    d3.select("#networkschoolname").text("School: " + currentNode.name)

    if (nested == 0) {
        // Subgraph
        d3.json("assets/js/graphFile.json", function (data) {

            output_nodes = data.nodes.filter(function (d) {
                return d.cluster == currentNode.cluster
            })

            output_links = data.links.filter(function (d) { //not working properly, need to refilter
                return d.source in output_nodes
            })

            filtered_output = {
                "nodes": output_nodes,
                "links": output_links
            };

            console.log(filtered_output)

            var subcanvas = d3.select("#networks-subgraph")
                .append("canvas")
                .attr("width", 600)
                .attr("height", 600),
                width = subcanvas.attr("width"),
                height = subcanvas.attr("height"),
                ctx2 = subcanvas.node().getContext("2d"),
                r = 3,
                color = d3.scaleOrdinal() // D3 Version 4
                    .domain(["PRIMARY", "SECONDARY", "JUNIOR COLLEGE", "MIXED LEVEL", "CENTRALISED INSTITUTE"])
                    .range(["red", "blue", "green", "yellow", "pink"]),
                simulation2 = d3.forceSimulation()
                    .force("x", d3.forceX(width / 2))
                    .force("y", d3.forceY(height / 2))
                    .force("collide", d3.forceCollide(r + 1))
                    .force("charge", d3.forceManyBody()
                        .strength(-20))
                    .force("link", d3.forceLink()
                        .id(function (d) { return d.name; }));

            simulation2.nodes(filtered_output.nodes);
            simulation2.force("link")
                .links(filtered_output.links);
            simulation2.on("tick", function () {
                ctx2.clearRect(0, 0, width, height);

                ctx2.beginPath();
                ctx2.globalAlpha = 0.5;
                ctx2.strokeStyle = "#aaa";
                filtered_output.links.forEach(function (l) {
                    ctx2.moveTo(l.source.x, l.source.y);
                    ctx2.lineTo(l.target.x, l.target.y);
                });
                ctx2.stroke();


                ctx2.globalAlpha = 1.0;
                filtered_output.nodes.forEach(drawNode);
            });
        });

        nested = 1
    }

}

function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}



function drawNode(d) {
    ctx.beginPath();
    //ctx.fillText(d.name, d.x + 10, d.y + 3);
    ctx.fillStyle = color(d.level);
    ctx.moveTo(d.x, d.y);
    ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawLink(l) {
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
}
