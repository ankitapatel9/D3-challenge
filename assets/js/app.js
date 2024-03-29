var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 10,
  right: 40,
  bottom: 100,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(stateHealthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateHealthData, d => d[chosenXAxis]) * 0.9,
      d3.max(stateHealthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(stateHealthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateHealthData, d => d[chosenYAxis]) * 0.9,
      d3.max(stateHealthData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height,0]);

  return yLinearScale;

}



// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {

  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1500)
    .ease(d3.easeElastic)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1500)
    .ease(d3.easeElastic)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1500)
    .attr("cx", d => newXScale(+d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1500)
    .attr("cy", d => newYScale(+d[chosenYAxis]));

  return circlesGroup;
}

function renderTexts(textsGroup, newXScale, chosenXAxis) {

  textsGroup.transition()
    .duration(1500)
    .attr("dx", d => newXScale(+d[chosenXAxis]));

  return textsGroup;
}

function renderYTexts(textsGroup, newYScale, chosenYAxis) {

  textsGroup.transition()
    .duration(1500)
    .attr("dy", d => newYScale(+d[chosenYAxis]));

  return textsGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {


  var xLabel;
  if (chosenXAxis === "poverty") {
    xLabel = "In Poverty (%)";
  } else if (chosenXAxis === "age") {
    xLabel = "Age (Median)";
  } else {
    xLabel = "Household Income (Median)";
  }
  var yLabel;
  if (chosenYAxis === "healthCare") {
    yLabel = "Lacks Healthcare (%)";
  } 
  else if (chosenYAxis === "smokes") {
    yLabel = "Smokes (%)";
  } 
  else {
    yLabel = "obesity (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(d => `${d.state} <br />${xLabel}: ${d[chosenXAxis]} <br />${yLabel}: ${d[chosenYAxis]}`);

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
//d3.csv("assets/data/data.csv", function(err, factData) {
d3.csv("assets/data/data.csv").then(function (stateHealthData) {

  console.log(stateHealthData);
  //if (err) throw err;

  // parse data
  stateHealthData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateHealthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateHealthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateHealthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", "1");

  var textsGroup = chartGroup.selectAll("circles")
    .data(stateHealthData)
    .enter()
    // We return the abbreviation to .text, which makes the text the abbreviation.
    .append("text")
    .text(d => d.abbr)
    // Now place the text using our scale.
    .attr("dx", function (d) {
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("dy", function (d) {
      // When the size of the text is the radius,
      // adding a third of the radius to the height
      // pushes it into the middle of the circle.
      return yLinearScale(d[chosenYAxis]) + (10*0.33);
    })
    .attr("class", "stateText")
    .attr("font-size", 9);

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Proverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
// append y axis 
var labelYGroup = chartGroup.append("g")
.attr("transform", `rotate(-90)`)
.attr("dy", "1em");

var healthLabel =   labelYGroup.append("text")
.attr("y", 0 - margin.left+ 60)
.attr("x", 0 - (height / 2))
.attr("value", "healthcare") // value to grab for event listener
.classed("active", true)
.text("Lacks Healthcare (%)");

//  append y axis for second label
var smokeLabel = labelYGroup.append("text")
.attr("y", 0 - margin.left + 40)
.attr("x", 0 - (height / 1.7))
.attr("value", "smokes")
.classed("inactive", true)
.attr("data-axis-name", "Smokes (%)")
.text("Smokes (%)");

// append 3rd label for y-axis
//  append y axis for second label
var obesityLabel = labelYGroup.append("text")
.attr("y", 0 - margin.left + 20)
.attr("x", 0 - (height / 1.7))
.attr("value", "obesity")
.classed("inactive", true)
.text("Obese (%)");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateHealthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

    // y axis labels event listener
    labelYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(stateHealthData, chosenYAxis);

        // updates Y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
        textsGroup = renderYTexts(textsGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
         obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });  
    

});