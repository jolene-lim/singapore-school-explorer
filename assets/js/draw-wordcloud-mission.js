var wordCloudM = false

$("#wordCloudPage").mouseover(function () {

    if (wordCloudM === false) {
        var fill = color = d3.scaleLinear()
            .domain([1, 100])
            .range(["#26747c", "#ffd166"]);

        d3.csv("data/mission.csv", function (data) {

            var width = document.getElementById("wordCloudMission").offsetWidth;
            var height = document.getElementById("wordCloudMission").offsetHeight;

            var mission = data
                .map(function (d) { return { text: d.word, size: d.n * 0.75 * width / 486 } })

            d3.layout.cloud().size([width * 0.975, height * 0.975])
                .words(mission)
                .rotate(function () { return ~~(Math.random() * 2) * 90; })
                .font("Open Sans")
                .fontSize(function (d) { return Math.sqrt(d.size) * 6; })
                .on("end", drawMission)
                .start();
        })

        function drawMission(words) {

            var width = document.getElementById("wordCloudMission").offsetWidth;
            var height = document.getElementById("wordCloudMission").offsetHeight;

            d3.select("#wordCloudMission").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .attr("opacity", 0)
                .transition()
                .duration(2000)
                .style("font-size", function (d) { return d.size + "px"; })
                .style("font-family", "Open Sans")
                .style("fill", function (d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; })
                .attr("opacity", 1);
        }

        wordCloudM = true
    }


})

