var fill = color = d3.scaleLinear()
    .domain([1, 100])
    .range(["#26747c", "#ffd166"]);

d3.csv("data/data/mission.csv", function (data) {
    var mission = data
        .map(function (d) { return { text: d.word, size: d.n } })

    d3.layout.cloud().size([800, 800])
        .words(mission)
        .rotate(function () { return ~~(Math.random() * 2) * 90; })
        .font("Open Sans")
        .fontSize(function (d) { return Math.sqrt(d.size) * 6; })
        .on("end", drawMission)
        .start();
})

function drawMission(words) {
    d3.select("#word-cloud-mission").append("svg")
        .attr("width", 800)
        .attr("height", 800)
        .append("g")
        .attr("transform", "translate(500,500)")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .transition()
        .duration(2000)
        .style("font-size", function (d) { return d.size + "px"; })
        .style("font-family", "Open Sans")
        .style("fill", function (d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) { return d.text; });
}