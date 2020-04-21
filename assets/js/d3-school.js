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
        let lat = d[value]["location"]["lat"],
            lng = d[value]["location"]["lng"],
            name = d[value]["name"],
            web = d[value]["website"],
            add = d[value]["address"],
            phone = d[value]["telephone"],
            fax = d[value]["fax"],
            email = d[value]["email"];
        let entry = null;
        let entryRange = null;

        if (Object.keys(d[value]).includes("PsleAggregateHistory")) {
            entry = d[value]["PsleAggregateHistory"];
            entryRange = [90, 300];
        } else if (Object.keys(d[value]).includes("L1R5History")) {
            entry = d[value]["L1R5History"]
            entryRange = [0, 20];
        }

        // SCHOOL INFO
        schName(name);
        schInfo(web, add, phone, fax, email);

        // MAP
        schMap(lat, lng, name);

        // PLOTS
        plotRadar();
        //plotCCA(d[value]["Cca"]);
        entryScore(entry, entryRange);
    });
}

// school name
function schName(name) {
    document.getElementById("school-name")
    .innerHTML = name;
};

// school info
function schInfo(web, add, phone, fax, email) {
    document.getElementById("school-info")
    .innerHTML = "<b>Website</b>: " + "<a href='" + web + "'>" + web + "</a><br>" +
                 "<b>Address</b>: " + add + "<br>" +
                 "<b>Phone</b>: " + phone.join(", ") + "<br>" +
                 "<b>Fax</b>: " + fax.join(", ") + "<br>" +
                 "<b>Email</b>: " + email 

};

// school radar
function plotRadar() {
    document.getElementById("sch-overview").innerHTML = "";

    var data = [
        {
            "Special Programs": 2,
            "CCA": 10,
            "Subjects": 5 // HI RMB TO ADD LEVEL FOR COLOR
        }
    ],
    features = {"Special Programs": [-50, -10], "CCA": [-40, 10], "Subjects": [10, 10]},
    width = 0.7 * document.getElementById("sch-overview").offsetWidth,
    height = 0.7 * document.getElementById("sch-overview").offsetHeight
    margin = 0.15 * width;

    var svg = d3.select("#sch-overview")
        .append("svg")
        .attr("height", "100%")
        .attr("width", "100%")

    var radialScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(data[0]))])
        .range([0, width / 2]);

    var ticks = [2,4,6,8,10];
    
    ticks.forEach(t =>
        svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("r", radialScale(t))
        .attr("transform", "translate(" + margin + ", " + margin + ")")
    );
    
    ticks.forEach(t =>
        svg.append("text")
        .attr("x", width / 2 + radialScale(t))
        .attr("y", height / 2)
        .attr("transform", "translate(" + margin + ", " + margin + ")")
        .text(t.toString())
    );

    function angleToCoordinate(angle, value){
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": width / 2 + x, "y": height / 2 - y};
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
        .attr("stroke","black")
        .attr("transform", "translate(" + margin + ", " + margin + ")");
    
        //draw axis label
        svg.append("text")
        .attr("x", label_coordinate.x + ft_offset[0])
        .attr("y", label_coordinate.y + ft_offset[1])
        .attr("transform", "translate(" + margin + ", " + margin + ")")
        .text(ft_name);
    }

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
    let colors = ["darkorange", "gray", "navy"];

    function getPathCoordinates(data_point){
        let coordinates = [];
        for (var i = 0; i < Object.keys(features).length; i++){
            let ft_name = Object.keys(features)[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / Object.keys(features).length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
    }

    for (var i = 0; i < data.length; i ++){
        let d = data[i];
        let color = colors[i];
        let coordinates = getPathCoordinates(d);
    
        //draw the path element
        svg.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
        .attr("transform", "translate(" + margin + ", " + margin + ")");
    }
    
}

// CCA plot
function plotCCA(cca) {
    document.getElementById("sch-cca").innerHTML = "";

    // parse data
    var data = Object.keys(cca).map(function(key) {
        return {
            "type": key, 
            "count": cca[key].length
        };
    });

    // initialize svg
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
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
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.type; }))
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
    
    // y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.count; })])
        .range([ height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));
    
    // bars
    svg.selectAll("ccaBar")
    .data(data)
    .enter()
    .append("rect")
        .attr("x", function(d) { return x(d.type); })
        .attr("y", function(d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.count); })
        .attr("fill", "#69b3a2")

    // loading animation
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); })
        .delay(function(d,i){console.log(i) ; return(i*100)})
      
};

// CCA table
function ccaTable(cca) {
    var table = d3.select('body').append('table').attr('id', 'cca-table');
    var thead = table.append('thead');
    var	tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
        return columns.map(function (column) {
            return {column: column, value: row[column]};
        });
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value; });

    return table;

}

// entry score
function entryScore(entry, entryRange) {

    document.getElementById("sch-entry").innerHTML = "";

    if (entry != null) {
        var data = Object.keys(entry["2018"]).map(function(key) {
            return {
                "type": key, 
                "range": [ entry["2018"][key][0], entry["2018"][key][1] ]
            };
        });

        // initialize svg
        var width = document.getElementById("sch-entry").offsetWidth,
        height = document.getElementById("sch-entry").offsetHeight,
        axisTranslate = 0.9 * height;

        var svg = d3.select("#sch-entry")
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%")

        // x axis
        var x = d3.scaleLinear()
            .domain(entryRange)
            .range([0, 0.9 * width]);

        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", "translate(5," + axisTranslate + ")");
        
        // y axis
        var y = d3.scaleBand()
            .domain(data.map(function(d) { return d.type; }))
            .range([0, height / 2]);
        
        // color scale
        var color = d3.scaleOrdinal()
            .domain(Object.keys(entry["2018"]))
            .range(["gold", "blue", "red"]);
        
        // line
        var element = svg.selectAll("entryLine")
        .data(data)
        .enter()
        .append("g")

        element.append("line")
            .attr("x1", function(d) { return x(d.range[0]); })
            .attr("y1", function(d) { return y(d.type) + height / 2; })
            .attr("x2", function(d) { return x(d.range[1]); })
            .attr("y2", function(d) { return y(d.type) + height / 2; })
            .attr("stroke", function(d) { return color(d.type); })
            .attr("stroke-width", 5)

        // left circle
        element.append("circle")
            .attr("cx", function(d) { return x(d.range[0]); })
            .attr("cy", function(d) { return y(d.type) + height / 2; })
            .attr("r", 7)
            .attr("fill", function(d) { return color(d.type); })

        element.append("text")
            .attr("x", function(d) { return x(d.range[0]); })
            .attr("y", function(d) { return y(d.type) + height / 2; })
            .text(function(d) { return d.range[0]; })
            .style("font-size", "0.7em")
            .style("font-weight", "bold")
            .style("text-anchor", "middle")
            .style("visibility", "hidden")

        // right circle
        element.append("circle")
            .attr("cx", function(d) { return x(d.range[1]); })
            .attr("cy", function(d) { return y(d.type) + height / 2; })
            .attr("r", 7)
            .attr("fill", function(d) { return color(d.type); })

        element.append("text")
            .attr("x", function(d) { return x(d.range[1]); })
            .attr("y", function(d) { return y(d.type) + height / 2; })
            .text(function(d) { return d.range[1]; })
            .style("font-size", "0.7em")
            .style("font-weight", "bold")
            .style("text-anchor", "middle")
            .style("visibility", "hidden")

        element.on("mouseover", function() {
            d3.select(this).selectAll("circle")
                .attr("r", 15);
            
            d3.select(this).selectAll("text")
                .style("visibility", "visible")
        }).on("mouseout", function() {
            d3.select(this).selectAll("circle")
                .attr("r", 7);
            
            d3.select(this).selectAll("text")
                .style("visibility", "hidden")
        })
        
        // legend
        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(0,10)');

        var lg = legend.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function(d,i) { return "translate(0," + i * 30 + ")" });

        lg.append('rect')
            .style('fill', function(d) { return color(d.type); })
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10);

        lg.append('text')
            .attr('x', 17.5)
            .attr('y', 10)
            .text(function(d) { return d.type; });
    }
}

// map
function schMap(lat, lng, name) {

    // zoom to point
    schoolMap.flyTo([lat, lng], zoom=17, {'animate': false});
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
        .style("z-index", "999")
        .style("left", (schoolMap.latLngToLayerPoint([lat, lng]).x - 50 + "px"))
        .style("top", (schoolMap.latLngToLayerPoint([lat, lng]).y - 130 + "px"))
        .html("<b>" + name + "</b>");

    d3.select("#schPoint")
        .on("mouseover", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", "1");
                
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", "0");
        });

    schoolMap.on("moveend", function() {
        d3.select("#schPoint")
            .attr("cx", schoolMap.latLngToLayerPoint([lat, lng]).x)
            .attr("cy", schoolMap.latLngToLayerPoint([lat, lng]).y);
    });
};