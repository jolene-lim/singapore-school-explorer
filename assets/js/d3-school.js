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
    d3.json("data/school-info-v4.json", function (d) {
        // save useful variables
        let lat = d[value]["location"]["lat"],
            lng = d[value]["location"]["lng"],
            name = d[value]["name"];
        let entry = null;
        let entryRange = null;
        let vacancy = null;

        // Admission info
        if (Object.keys(d[value]).includes("PsleAggregateHistory")) {
            entry = d[value]["PsleAggregateHistory"];
            entryRange = [90, 300];
        } else if (Object.keys(d[value]).includes("L1R5History")) {
            entry = d[value]["L1R5History"]
            entryRange = [0, 20];
        }

        // vacancy
        if (Object.keys(d[value]).includes("Vacancy")) { vacancy = d[value]["Vacancy"]; }

        // SCHOOL INFO
        schName(name);
        schInfo(d[value]["website"], d[value]["address"], d[value]["telephone"], d[value]["fax"], d[value]["email"],
            d[value]["GeneralInformation"]["School Mission"], d[value]["GeneralInformation"]["School Vision"]);

        // MAP
        schMap(lat, lng, d[value]["bus"], d[value]["mrt"]);

        // PLOTS
        plotRadar(d[value]["Cca"], d[value]["SpecialProgrammes"], d[value]["SubjectOffered"]);
        plotAchieve(d[value]["awards_map"]);
        //plotCCA(d[value]["Cca"]);
        plotEntry(entry, entryRange);
        plotVacancies(vacancy, name);

        // TABLES
        offerTable(d[value]["Cca"], d[value]["SubjectOffered"], d[value]["SpecialProgrammes"]);
        achieveTable(d[value]["awards"]);
    });
}

// school name
function schName(name) {
    document.getElementById("school-name")
        .innerHTML = "<div class='header'>" + name + "</div>";
};

// school info
function schInfo(web, add, phone, fax, email, mission, vision) {
    document.getElementById("school-info")
        .innerHTML = "<b>Mission</b>: " + mission + "<br>" +
        "<b>Vision</b>: " + vision + "<br><br>" +
        '<i class="fas fa-map-marker-alt"></i> ' + add + "<br>" +
        '<i class="fas fa-phone"></i> ' + phone.join(", ") + "<br>" +
        '<i class="fas fa-print"></i> ' + fax.join(", ") + "<br>" +
        '<i class="fas fa-envelope"></i> ' + email + "<br>" +
        '<i class="fas fa-desktop"></i> ' + "<a href='" + web + "'>" + web + "</a><br>"
};

// school radar
function plotRadar(cca, specialProg, subjects) {
    document.getElementById("sch-overview").innerHTML = "";

    var data = [
        {
            "Special Programs": specialProg.length,
            "CCA": cca.length,
            "Subjects": subjects.length
        }
    ],
        features = { "Special Programs": [-50, -10], "CCA": [-40, 10], "Subjects": [10, 10] },
        margin = { top: 70, right: 60, bottom: 30, left: 40 },
        width = document.getElementById("sch-overview").offsetWidth - margin.left - margin.right,
        height = document.getElementById("sch-overview").offsetHeight - margin.top - margin.bottom;

    var svg = d3.select("#sch-overview")
        .append("svg")
        .attr("height", "100%")
        .attr("width", "100%")

    var max = Math.ceil(d3.max(Object.values(data[0])) / 10) * 10;
    var step = max > 20 ? 10 : 5;

    var radialScale = d3.scaleLinear()
        .domain([0, max])
        .range([0, width / 2]);

    var ticks = d3.range(0, max + 1, step);

    ticks.forEach(t =>
        svg.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("r", radialScale(t))
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
    );

    ticks.forEach(t =>
        svg.append("text")
            .attr("x", width / 2 + radialScale(t))
            .attr("y", height / 2)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
            .text(t.toString())
    );

    function angleToCoordinate(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
    }

    for (var i = 0; i < Object.keys(features).length; i++) {
        let ft_name = Object.keys(features)[i];
        let ft_offset = features[ft_name];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / Object.keys(features).length);
        let line_coordinate = angleToCoordinate(angle, d3.max(ticks));
        let label_coordinate = angleToCoordinate(angle, d3.max(ticks));

        //draw axis line
        svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", line_coordinate.x)
            .attr("y2", line_coordinate.y)
            .attr("stroke", "black")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        //draw axis label
        svg.append("text")
            .attr("x", label_coordinate.x + ft_offset[0])
            .attr("y", label_coordinate.y + ft_offset[1])
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
            .text(ft_name);
    }

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    function getPathCoordinates(data_point) {
        let coordinates = [];
        for (var i = 0; i < Object.keys(features).length; i++) {
            let ft_name = Object.keys(features)[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / Object.keys(features).length);
            let output = angleToCoordinate(angle, data_point[ft_name]);
            output['id'] = ft_name;
            output['value'] = data_point[ft_name];
            coordinates.push(output);
        }
        return coordinates;
    }

    let d = data[0];
    let coordinates = getPathCoordinates(d);
    //let pointData = coordinates.map(function(v, i) { return {'x': v.x, 'y': v.y, 'id': d[i].key} });
    console.log(coordinates);
    //draw the path element
    svg.append("path")
        .datum(coordinates)
        .attr("id", "radar")
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", "#fe982a")
        .attr("fill", "#fe982a")
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    var radarCircle = svg.selectAll("radarPoints")
        .data(coordinates).enter().append("g")

    radarCircle.append("circle")
        .attr("class", function (d) { return d.id.slice(0, 2); })
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", 7)
        .attr("fill", "#fe982a")
        .attr("opacity", 0.75)
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

    radarCircle.append("text")
        .text(function (d) { return d.value; })
        .attr("class", function (d) { return d.id.slice(0, 2); })
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("visibility", "hidden")
        .style("font-size", "1.2em")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + margin.left + ", " + margin.top * 1.07 + ")")

    // animations
    var pie = d3.pie().value(function (d) { return d.value });
    var arcData = [{ 'key': 'Subject', 'value': 1 }, { 'key': 'CCA', 'value': 1 }, { 'key': 'Special Programmes', 'value': 1 }];
    arcData = pie(arcData);
    var arcGenerator = d3.arc()
        .innerRadius(0).outerRadius(width / 2)
        .startAngle(function (d) { return d.startAngle + Math.PI / 3 })
        .endAngle(function (d) { return d.endAngle + Math.PI / 3 });
    svg.selectAll("arcAnimate")
        .data(arcData).enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill-opacity", 0)
        .attr("transform", "translate(" + (width / 2 + margin.left) + ", " + (height / 2 + margin.top) + ")")
        .on("mouseover", function (d) {
            var input = $("#offerTable_filter label input");
            input.val(d.data.key);
            input.trigger("keyup");

            var className = '.' + d.data.key.slice(0, 2);
            d3.select("circle" + className).attr("r", 15).attr("opacity", 1);
            d3.select("text" + className).attr("visibility", "visible");
        })
        .on("mouseout", function (d) {
            var className = '.' + d.data.key.slice(0, 2);
            d3.select("circle" + className).attr("r", 5);
            d3.select("text" + className).attr("visibility", "hidden");
        });

    // title
    svg.append("text")
        .attr("class", "header")
        .attr("x", "5px")
        .attr("y", "20px")
        .attr("text-anchor", "left")
        .text("Programmes Overview");

}

function plotAchieve(award) {
    var margin = { top: 70, right: 25, bottom: 30, left: 50 },
        width = document.getElementById("sch-achievement").offsetWidth - margin.left - margin.right,
        height = document.getElementById("sch-achievement").offsetHeight - margin.top - margin.bottom;

    document.getElementById("sch-achievement").innerHTML = "";

    // append the svg object to the body of the page
    var canvas = d3.select("#sch-achievement")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    var svg = canvas.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    var myGroups = d3.map(award, function (d) { return d.Year; }).keys()
    var myVars = d3.map(award, function (d) { return d.Category; }).keys()

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.05);
    svg.append("g")
        .style("font-family", "Open Sans")
        .style("font-size", "1.1em")
        .call(d3.axisTop(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.05);
    var yAxis = svg.append("g")
        .style("font-family", "Open Sans")
        .call(d3.axisLeft(y).tickSize(0))

    yAxis.selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "1em")
    yAxis.select(".domain").remove()

    // Build color scale

    var myColor = d3.scaleSequential(d3.schemeAccent)
        .interpolator(d3.interpolateRgb('#f2f5f7', '#29586c'))
        .domain([1, d3.max(d3.map(award, function (d) { return d.Total; }).keys())])



    // create a tooltip
    var tooltip = d3.select("#sch-achievement")
        .append("div")
        .attr("class", "tooltip");

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        tooltip
            .style("opacity", 1)

        var tooltipText = "";
        for (let award of d.Details) {
            tooltipText = tooltipText.concat("<b>", award["Award"], "</b>: ", award["Count"], "<br>")
        };
        tooltip
            .html(tooltipText)
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY) + "px")

        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)

        var className = ".Y" + d.Year + "." + d.Category.slice(0, 2);
        d3.selectAll(className)
            .style("font-weight", "bold");

        $('#achieveTable').DataTable().row(className).scrollTo();

    }
    var mouseout = function (d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)

        var className = ".Y" + d.Year + "." + d.Category.slice(0, 2);
        d3.selectAll(className).style("font-weight", "normal");
    }

    // add the squares
    svg.selectAll()
        .data(award, function (d) { return d.Year + ':' + d.Category; })
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.Year) })
        .attr("y", function (d) { return y(d.Category) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) { return myColor(d.Total) })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // title
    canvas.append("text")
        .attr("class", "header")
        .attr("x", "5px")
        .attr("y", "20px")
        .attr("text-anchor", "left")
        .text("Achievement History");

};

// CCA plot
function plotCCA(cca) {
    document.getElementById("sch-cca").innerHTML = "";

    // parse data
    var data = Object.keys(cca).map(function (key) {
        return {
            "type": key,
            "count": cca[key].length
        };
    });

    // initialize svg
    var margin = { top: 0, right: 30, bottom: 70, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#sch-cca")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // x axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d.type; }))
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.count; })])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // bars
    svg.selectAll("ccaBar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.type); })
        .attr("y", function (d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.count); })
        .attr("fill", "#69b3a2")

    // loading animation
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function (d) { return y(d.count); })
        .attr("height", function (d) { return height - y(d.count); })
        .delay(function (d, i) { console.log(i); return (i * 100) })

};

// offerings table
function offerTable(cca, subject, specialProgs) {
    var offerData = cca.concat(subject, specialProgs);

    var tableWidth = document.getElementById("sch-offerings").offsetWidth;
    var tableHeight = document.getElementById("sch-offerings").offsetHeight;

    var table = $('#offerTable').DataTable({
        destroy: true,
        data: offerData,
        columns: [
            { "data": "Type", "title": "Type" },
            { "data": "Category", "title": "Category" },
            { "data": "Offering", "title": "Offering" }
        ],
        //"searching": false,
        "paging": false,
        "info": "",
        scroller: false
    });

    $("#offerTable > tbody > tr:odd").css("background-color", "red");
};

function achieveTable(award) {

    var tableWidth = document.getElementById("sch-achieve-table").offsetWidth;
    var tableHeight = document.getElementById("sch-achieve-table").offsetHeight;

    var table = $('#achieveTable').DataTable({
        destroy: true,
        data: award,
        columns: [
            { "data": "Year", "title": "Year" },
            { "data": "Category", "title": "Category" },
            { "data": "CCA", "title": "CCA" },
            { "data": "Award", "title": "Award" }
        ],
        "info": "",
        "paging": true,
        scroller: true,
        scrollY: 0.7 * tableHeight,
        "createdRow": function (row, data, dataIndex) {
            $(row).addClass("Y" + data.Year.toString());
            $(row).addClass(data.Category.slice(0, 2));
        },
    });

    $("#achieveTable > tbody > tr:odd").css("background-color", "yellow");
};

function plotVacancies(data, name) {

    if (data != null) {
        document.getElementById("sch-entry").innerHTML = "";

        var margin = { top: 50, right: 30, bottom: 70, left: 30 },
            width = document.getElementById("sch-entry").offsetWidth - margin.left - margin.right,
            height = document.getElementById("sch-entry").offsetHeight - margin.top - margin.bottom;

        var canvas = d3.select("#sch-entry")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        var svg = canvas.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var subgroups = ["Vacancies", "Applicants"];
        var groups = d3.map(data, function (d) { return (d.Phase) }).keys()

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .attr("transform", "translate(-10,5) rotate(30)")
            .style("text-anchor", "start")
            .style("font-family", "Open Sans");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, data[0].Vacancies])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-family", "Open Sans");

        // Another scale for subgroup position?
        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#e21737', '#0b648f'])

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in data = loop group per group
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d) { return "translate(" + x(d.Phase) + ",0)"; })
            .selectAll("rect")
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
            .enter().append("rect")
            .attr("x", function (d) { return xSubgroup(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) { return color(d.key); })
            .attr("opacity", 0.75);

        var legend = svg.selectAll(".legend")
            .data(subgroups)
            .enter()
            .append("g")
            .attr("transform", "translate(" + (width * 0.75) + "," + (margin.top) + ")")

        legend.append("rect")
            .attr("fill", color)
            .attr("width", 10)
            .attr("height", 10)
            .attr("y", function (d, i) {
                return i * 25 - 60;
            })
            .attr("x", 0)
            .attr("opacity", 0.85);

        legend.append("text")
            .attr("class", "label")
            .attr("y", function (d, i) {
                return i * 25 - 50;
            })
            .attr("x", 15)
            .attr("text-anchor", "start")
            .text(function (d, i) {
                return subgroups[i];
            });

        // title
        canvas.append("text")
            .attr("class", "header")
            .attr("x", "5px")
            .attr("y", "20px")
            .attr("text-anchor", "left")
            .text("Application Statistics");

    };
};

// entry score
function plotEntry(entry, entryRange) {

    document.getElementById("sch-entry").innerHTML = "";

    if (entry != null) {
        var data = Object.keys(entry["2018"]).map(function (key) {
            return {
                "type": key,
                "range": [entry["2018"][key][0], entry["2018"][key][1]]
            };
        });

        // initialize svg
        var margin = { top: 0, right: 10, bottom: 10, left: 10 },
            width = document.getElementById("sch-entry").offsetWidth - margin.left - margin.right,
            height = document.getElementById("sch-entry").offsetHeight - margin.top - margin.bottom;

        /*
        var width = document.getElementById("sch-entry").offsetWidth,
            height = document.getElementById("sch-entry").offsetHeight,
            yAxisTranslate = 0.9 * height;
            xAxisTranslate = 0.05 * width;
        */

        var svg = d3.select("#sch-entry")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // x axis
        var x = d3.scaleLinear()
            .domain(entryRange)
            .range([0, width - 20]);

        svg.append("g")
            .style("font-family", "Open Sans")
            .call(d3.axisBottom(x))
            .attr("transform", "translate(" + margin.left + "," + (height - 20) + ")");

        // y axis
        var y = d3.scaleBand()
            .domain(data.map(function (d) { return d.type; }))
            .range([height / 3, 0])

        // color scale
        var color = d3.scaleOrdinal()
            .domain(Object.keys(entry["2018"]))
            .range(["gold", "blue", "red"]);

        // line
        var element = svg.selectAll("entryLine")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (height * (2 / 3) - 20) + ")");

        element.append("line")
            .attr("x1", function (d) { return x(d.range[0]); })
            .attr("y1", function (d) { return y(d.type); })
            .attr("x2", function (d) { return x(d.range[1]); })
            .attr("y2", function (d) { return y(d.type); })
            .attr("stroke", function (d) { return color(d.type); })
            .attr("stroke-width", 5);

        // left circle
        element.append("circle")
            .attr("cx", function (d) { return x(d.range[0]); })
            .attr("cy", function (d) { return y(d.type); })
            .attr("r", 7)
            .attr("fill", function (d) { return color(d.type); });

        element.append("text")
            .attr("x", function (d) { return x(d.range[0]); })
            .attr("y", function (d) { return y(d.type); })
            .text(function (d) { return d.range[0]; })
            .style("font-size", "0.7em")
            .style("font-weight", "bold")
            .style("text-anchor", "middle")
            .style("visibility", "hidden");

        // right circle
        element.append("circle")
            .attr("cx", function (d) { return x(d.range[1]); })
            .attr("cy", function (d) { return y(d.type); })
            .attr("r", 7)
            .attr("fill", function (d) { return color(d.type); });

        element.append("text")
            .attr("x", function (d) { return x(d.range[1]); })
            .attr("y", function (d) { return y(d.type); })
            .text(function (d) { return d.range[1]; })
            .style("font-size", "0.7em")
            .style("font-weight", "bold")
            .style("text-anchor", "middle")
            .style("visibility", "hidden");

        element.on("mouseover", function () {
            d3.select(this).selectAll("circle")
                .attr("r", 15);

            d3.select(this).selectAll("text")
                .style("visibility", "visible")
        }).on("mouseout", function () {
            d3.select(this).selectAll("circle")
                .attr("r", 7);

            d3.select(this).selectAll("text")
                .style("visibility", "hidden")
        })

        // legend
        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(0,' + height / 6 + ')');

        var lg = legend.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function (d, i) { return "translate(0," + i * 30 + ")" });

        lg.append('rect')
            .style('fill', function (d) { return color(d.type); })
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10);

        lg.append('text')
            .attr('x', 17.5)
            .attr('y', 10)
            .text(function (d) { return d.type; });

        // title
        svg.append("text")
            .attr("class", "header")
            .attr("x", "0px")
            .attr("y", "20px")
            .attr("text-anchor", "left")
            .text("Admission Statistics");
    }
}

// map
function schMap(lat, lng, bus, mrt) {

    // zoom to point
    schoolMap.flyTo([lat, lng], zoom = 17, { 'animate': false });
    schoolMap.options.minZoom = 15;

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
        .attr("stroke", "#005236")
        .attr("fill", "#005236")
        .attr("fill-opacity", 0.2);

    var tooltip = d3.select("#school").append("div")
        .attr("class", "tooltip");

    d3.select("#schPoint")
        .on("mouseover", function (d) {
            tooltip
                .style("opacity", "1")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY) + "px")

            tooltip.html("<b>Nearest Train Stations</b>: " + mrt + "<br>" +
                "<b>Nearest Bus Stations</b>: " + bus + "<br>");
        })
        .on("mousemove", function () {
            tooltip
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY) + "px")
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", "0");
        });

    schoolMap.on("moveend", function () {
        d3.select("#schPoint")
            .attr("cx", schoolMap.latLngToLayerPoint([lat, lng]).x)
            .attr("cy", schoolMap.latLngToLayerPoint([lat, lng]).y);
    });
};

function nameToCode(value) {
    d3.json("data/data/translationDictionary.json", function (d) {
        return (d[value]["code"][0])
    })
};