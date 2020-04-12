// 1. Base Leaflet Map
let interactiveMap = L
    .map("interactive-map")
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
    "PRIMARY": "red",
    "SECONDARY": "blue",
    "JUNIOR COLLEGE": "green",
    "MIXED LEVEL": "yellow",
    "CENTRALISED INSTITUTE": "pink"
}

// 3. Plotting of circles on map

d3.csv("data/general-information-full.csv", function (data) {

    var locations = data
        .map(function (d) {
            return {
                name: d.school_name,
                long: parseFloat(d.lon),
                lat: parseFloat(d.lat),
                level: d.mainlevel_code,
                code: d.code
            }
        })

    d3.select("#interactive-map")
        .select("svg")
        .selectAll("Circles")
        .data(locations)
        .enter()
        .append("circle")
        .attr("id", "homeCircle")
        .attr("style", "pointer-events: visible;")

    var interactiveCircles = d3.selectAll("#homeCircle")
        .attr("cx", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.long]).x })
        .attr("cy", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.long]).y })
        .attr("r", 10)
        .style("fill", function (d) { return levelColours[d.level] })
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill-opacity", .5)
        .attr("text", function (d) { return d.name })

    interactiveCircles.on("mouseover", function () {
        d3.select(this).style("stroke-width", 3).style("opacity", 1)
        var schoolname = d3.select(this).attr("text")
        d3.select("#schoolname").text("School: " + schoolname)
    })

    interactiveCircles.on("mouseout", function () {
        d3.select(this).style("stroke-width", 0).style("opacity", 1)
        d3.select("#schoolname").text("School:")
    })

    interactiveMap.on("moveend", function () {
        d3.selectAll("#homeCircle")
            .attr("cx", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.long]).x })
            .attr("cy", function (d) { return interactiveMap.latLngToLayerPoint([d.lat, d.long]).y })
    })

    d3.selectAll("#homeCircle").on("click", function (d) {
        let value = d.code;
        loadSchool();
        plotSchool(value);
    })

})

function reply_click(clicked_id) {

    d3.selectAll("#homeCircle")
        .filter(function (d) { return d.level == clicked_id })
        .style("visibility", function () {
            if ($(this).css("visibility") == "visible") {
                return "hidden";
            } else {
                return "visible";
            }
        })

    if (document.getElementById(clicked_id).style.background != "white") {
        document.getElementById(clicked_id).style.background = "white"
        document.getElementById(clicked_id).style.color = "gray"
    } else {
        document.getElementById(clicked_id).style.background = "gray"
        document.getElementById(clicked_id).style.color = "white"
    }
}