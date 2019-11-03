//set svg and chart dimensions
//set svg dimensions
var svgWidth = 1000;
var svgHeight = 800;

//set borders 
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

//chart size
var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

var chart = d3.select("#scatter").append("div").classed("chart", true);

var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//append an svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var userXAxis = "poverty";
var userYAxis = "healthcare";

//function used for updating scale  
function xScale(govData, userXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(govData, d => d[userXAxis]) * 0.8,
            d3.max(govData, d => d[userXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

function yScale(govData, userYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(govData, d => d[userYAxis]) * 0.8,
            d3.max(govData, d => d[userYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function for updating circles 
function renderCircles(circlesGroup, newXScale, userXAxis, newYScale, userYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[userXAxis]))
        .attr("cy", data => newYScale(data[userYAxis]));

    return circlesGroup;
}

//function for updating states  
function renderText(textGroup, newXScale, userXAxis, newYScale, userYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[userXAxis]))
        .attr("y", d => newYScale(d[userYAxis]));

    return textGroup;
}
//function to stylize x-axis values for tooltips
function styleX(value, userXAxis) {

    //poverty  
    if (userXAxis === 'poverty') {
        return `${value}%`;
    }
    //income  
    else if (userXAxis === 'income') {
        return `$${value}`;
    }
    //age  
    else {
        return `${value}`;
    }
}

// function for updating circles with tooltip
function updateToolTip(userXAxis, userYAxis, circlesGroup) {

    if (userXAxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    //income  
    else if (userXAxis === 'income') {
        var xLabel = "Median Income:";
    }
    //age  
    else {
        var xLabel = "Age:";
    }

    //lack healthcare
    if (userYAxis === 'healthcare') {
        var yLabel = "No Healthcare:"
    }
    //obesity
    else if (userYAxis === 'obesity') {
        var yLabel = "Obesity:"
    }
    //smoking  
    else {
        var yLabel = "Smokers:"
    }

    //create tooltip  http://bl.ocks.org/davegotz/bd54b56723c154d25eedde6504d30ad7
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[ userXAxis],  userXAxis)}<br>${yLabel} ${d[ userYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    //events
    circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circlesGroup;
}

//d3.csv data 
d3.csv("./assets/data/data.csv").then(function (govData) {

    console.log(govData);

    //parse
    govData.forEach(function (data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    var xLinearScale = xScale(govData, userXAxis);
    var yLinearScale = yScale(govData, userYAxis);


    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(govData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[userXAxis]))
        .attr("cy", d => yLinearScale(d[userYAxis]))
        .attr("r", 12)
        .attr("opacity", ".5");

    var textGroup = chartGroup.selectAll(".stateText")
        .data(govData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[userXAxis]))
        .attr("y", d => yLinearScale(d[userYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function (d) {
            return d.abbr
        });

    //create group for labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokers (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obesity (%)");

    var circlesGroup = updateToolTip(userXAxis, userYAxis, circlesGroup);

    //x axis labels listen
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            //get value of selection
            var value = d3.select(this).attr("value");

            if (value != userXAxis) {

                userXAxis = value;

                xLinearScale = xScale(govData, userXAxis);

                xAxis = renderAxesX(xLinearScale, xAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, userXAxis, yLinearScale, userYAxis);
                textGroup = renderText(textGroup, xLinearScale, userXAxis, yLinearScale, userYAxis);

                //update tooltips with new info
                circlesGroup = updateToolTip(userXAxis, userYAxis, circlesGroup);

                //change to bold  
                if (userXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);
                } else if (userXAxis === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);
                } else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    //y axis labels listen 
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");

            //check if value is same  
            if (value != userYAxis) {

                userYAxis = value;

                yLinearScale = yScale(govData, userYAxis);

                yAxis = renderAxesY(yLinearScale, yAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, userXAxis, yLinearScale, userYAxis);

                textGroup = renderText(textGroup, xLinearScale, userXAxis, yLinearScale, userYAxis)

                //update tooltips  
                circlesGroup = updateToolTip(userXAxis, userYAxis, circlesGroup);

                //change classes to change bold  
                if (userYAxis === "obesity") {
                    obesityLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                } else if (userYAxis === "smokes") {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                } else {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);
                }
            }
        });


});