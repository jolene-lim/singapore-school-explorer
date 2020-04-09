// initialize map
let map = L
    .map('school-map')
    .setView([1.3521, 103.8198], 13);

L.tileLayer(
    'https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png', {
        minZoom: 11,
        maxZoom: 18,
        bounds: [[1.56073, 104.11475], [1.16, 103.502]],
        attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
    }).addTo(map);

L.svg().addTo(map);

// value = school code
function plotSchool(value) {
    d3.json("data/all-schools-info.json", function(d) {
        // save useful variables
        let lat = d[value]["location"]["lat"];
        let lng = d[value]["location"]["lng"];
        let name = d[value]["name"];

        // SCHOOL NAME
        d3.select('#school-name').text(name);

        // MAP
        // zoom to point
        map.flyTo([lat, lng], zoom = 17, {animate: false});

        // add school point
        d3.select("#school-map")
            .select("svg")
            .attr("style", "pointer-events: all;")
            .append("circle");

        d3.select("circle")
            .attr("id", "schPoint")
            .attr("cx", map.latLngToLayerPoint([lat, lng]).x)
            .attr("cy", map.latLngToLayerPoint([lat, lng]).y)
            .attr("r", 15);

        var tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("width", "100px")
            .style("height", "100px")
            .style("opacity", "0")
            .style("z-index", "999");

        d3.select("#schPoint")
            .on("mouseover", function() {
                tooltip.transition()
                    .style("opacity", "1")
                tooltip.html("<b>" + name + "</b>")
                    .style("left", (d3.event.pageX + 0 + "px"))
                    .style("top", (d3.event.pageY - 5 + "px"))
      
            })
            .on("mouseout", function() {
                d3.select("#tooltip")
                    .style("opacity", "0");
            });
        
        map.on("moveend", function() {
            d3.select("circle")
            .attr("cx", map.latLngToLayerPoint([lat, lng]).x)
            .attr("cy", map.latLngToLayerPoint([lat, lng]).y);
        });
        
        // PLOTS

    });

}