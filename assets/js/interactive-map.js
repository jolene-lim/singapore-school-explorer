// 1. Base Leaflet Map
let interactiveMap = L
    .map("interactive-map", null, { zoomControl: false })
    .setView([1.3521, 103.8198], 12);

L.tileLayer(
    "https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png", {
    minZoom: 11,
    maxZoom: 18,
    bounds: [[1.56073, 104.11475], [1.16, 103.502]],
    attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
}).addTo(interactiveMap);

L.svg().addTo(interactiveMap);

// 2. Miscellaneous variables

var levelColours = {
    "PRIMARY": "#e2211c",
    "SECONDARY": "#0056b8",
    "JUNIORCOLLEGE": "#ff9e1a",
    "MIXEDLEVEL": "#00943a",
    "CENTRALISEDINSTITUTE": "#9e27b5"
}

// 3. Plotting of circles on map

d3.json("data/map_data.json", function (data) {

    d3.select("#interactive-map")
        .select("svg")
        .selectAll("Circles")
        .data(data)
        .enter()
        .append("circle")
        .attr("id", "homeCircle")
        .attr("style", "pointer-events: visible;")


    var interactiveCircles = d3.selectAll("#homeCircle")
        .attr("cx", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.lon]).x })
        .attr("cy", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.lon]).y })
        .attr("r", 10)
        .style("fill", function (d) { return levelColours[d.mainlevel_code] })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill-opacity", 0)
        .attr("text", function (d) { return d.name })

    interactiveCircles
        .transition()
        .duration(1000) // Waiting for Leaflet to load
        .transition()
        .delay(function (d, i) { return i * 2.5 })
        .duration(1000)
        .attr("fill-opacity", 0.65)

    var tooltip = d3.select("#interactive-map")
        .append("div")
        .attr("class", "tooltip");

    interactiveCircles.on("mouseover", function () {
        d3.select(this).style("stroke-width", 3).style("opacity", 1)
        var schoolname = d3.select(this).attr("text")

        tooltip
            .transition()
            .duration(10)
            .style("opacity", "0.8")
            .style("left", "45px")
            .style("top", "18px")
            .style("box-shadow", " 0px 0px 3px 4px rgba(0,0,0,0.25)")
            .style("border", "none")

        tooltip.html(schoolname);


    })

    interactiveCircles.on("mouseout", function () {
        d3.select(this).style("stroke-width", 0).style("opacity", 1)

        tooltip.transition()
            .duration(10)
            .style("opacity", "0");
    })

    interactiveMap.on("moveend", function () {
        d3.selectAll("#homeCircle")
            .attr("cx", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.lon]).x })
            .attr("cy", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.lon]).y })
    })

    d3.selectAll("#homeCircle").on("click", function (d) {
        let value = d.code;
        loadSchool();
        plotSchool(value);
    })
})

function reply_click(clicked_id) {

    d3.selectAll("#homeCircle")
        .filter(function (d) { return d.mainlevel_code == clicked_id })
        .style("visibility", function () {
            if ($(this).css("visibility") == "visible") {
                return "hidden";
            } else {
                return "visible";
            }
        })

    if (document.getElementById(clicked_id).style.background != "white") {
        document.getElementById(clicked_id).style.background = "white"
        document.getElementById(clicked_id).style.color = "black"
    } else {
        document.getElementById(clicked_id).style.background = levelColours[clicked_id]
        document.getElementById(clicked_id).style.color = "white"
    }
}