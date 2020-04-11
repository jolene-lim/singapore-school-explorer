// initialize map
let schoolMap = L
    .map('school-map')
    .setView(['1.3521', '103.8198'], 11);

L.tileLayer(
    'https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png', {
    minZoom: 11,
    maxZoom: 18,
    bounds: [[1.56073, 104.11475], [1.16, 103.502]],
    attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
}).addTo(schoolMap);

L.svg().addTo(schoolMap);

// value = school code
function plotSchool(value) {
    d3.json("data/all-schools-info.json", function (d) {
        // save useful variables
        let lat = d[value]["location"]["lat"];
        let lng = d[value]["location"]["lng"];
        let name = d[value]["name"];

        // SCHOOL NAME
        d3.select('#school-name').text(name);

        // MAP
        schoolMap.flyTo([lat, lng], zoom=17, {'animate': false});

        // add school point
        d3.select("#school-map")
            .select("svg")
            .append("circle")
            .attr("id", "schPoint")
            .attr("style", "pointer-events: visible;");

        d3.select("#schPoint")
            .attr("cx", schoolMap.latLngToLayerPoint([lat, lng]).x)
            .attr("cy", schoolMap.latLngToLayerPoint([lat, lng]).y)
            .attr("r", 50)
            .attr("stroke", "red")
            .attr("fill", "red")
            .attr("fill-opacity", 0.1);

        var tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("width", "100px")
            .style("height", "100px")
            .style("opacity", "0")
            .style("z-index", "999");

        d3.select("#schPoint")
            .on("mouseover", function () {
                tooltip.transition()
                    .style("opacity", "1")
                tooltip.html("<b>" + name + "</b>")
                    .style("left", (schoolMap.latLngToLayerPoint([lat, lng]).x - 50 + "px"))
                    .style("top", (schoolMap.latLngToLayerPoint([lat, lng]).y - 130 + "px"))

            })
            .on("mouseout", function () {
                d3.select("#tooltip")
                    .style("opacity", "0");
            });

        schoolMap.on("moveend", function() {
            d3.select("#schPoint")
                .attr("cx", schoolMap.latLngToLayerPoint([lat, lng]).x)
                .attr("cy", schoolMap.latLngToLayerPoint([lat, lng]).y);
        });

        // PLOTS

    });

}