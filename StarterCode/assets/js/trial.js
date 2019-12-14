// @TODO: YOUR CODE HERE!
  var svgWidth = 960;
  var svgHeight = 500;

  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 120
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  //Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .classed("chart", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("./assets/data/data.csv").then(function(stateData) {
    console.log(stateData);

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function(data) {
      data.healthcareLow = +data.healthcareLow;
      data.poverty = +data.poverty;
      //2nd chart
			data.age = +data.age;
			data.smokes = +data.smokes;
			//3rd chart
			data.income = +data.income;
			data.obesity = +data.obesity;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear().range([0, width]);
    var yLinearScale = d3.scaleLinear().range([height, 0]);
    
    // create a function that stores the min and max x and y values
    
    var xmin;
    var xmax;
    var ymin;
    var ymax;

    function minMaxValue(Data) {
      xmin = d3.min(Data, d => d.poverty) * 0.8;
      xmax = d3.max(Data, d => d.poverty) * 1.2;
      ymin = d3.min(Data, d => d.healthcareLow) * 1.5;
      ymax = d3.min(Data, d => d.healthcareLow) * 0.3;
    }
    var chosenXAxis = "In Poverty (%)";
		var chosenYAxis = "Lacks Healthcare (%)";

		// Call function() with 'poverty' as default
		minMaxValue(chosenXAxis);
    minMaxValue(chosenYAxis);


    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // Scale the domain X and Y
		xLinearScale.domain([xmin,xmax]);
    yLinearScale.domain([ymin,ymax]);
    
    var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
            //data points
						var state = d.state;
            var xLabel;
            var yLabel;

						// 1st scatter chart data fields
						var Poverty = +d.poverty;
						var lacksHealthcare = +d.healthcareLow;

						// 2nd scatter chart data fields
						var age = +d.age;
						var smokes = +d.smokes;

						// 3rd scatter chart data fields
						var householdIncome =  +d.income;
						var obese = +d.obesity;

						// tool tip based on which X-AXIS is active

						if (chosenXAxis === "In Poverty (%)") {
							xLabel = `Poverty: ${Poverty}`;
						}
						else if (chosenXAxis === "Age (median)") {
							xLabel = `Age (median): ${age}`;
						}
						else { 
							xLabel = `Household Income (median): ${householdIncome}`;
						}

						// return (state + xinfo + xdata). tool tip based on which Y-AXIS is active

						if (chosenYAxis === 'Lacks Healthcare (%)') {
              yLabel= `Lack Healthcare (%): ${lacksHealthcare}`;
            }
						else if(chosenYAxis === 'Smokes (%)'){
							yLabel = `Smokes (%): ${smokes}`;
						}
						else{
							yLabel = `Obese (%): ${obese}`;
						}
            
           return (`${state} <hr> ${xLabel} <br> ${yLabel}`);
          });
    chartGroup.call(toolTip);
    //  creating circles
    chartGroup.selectAll("circle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx",d => xLinearScale(+d[chosenXAxis]))
      .attr("cy",d => yLinearScale(+d[chosenYAxis]))
      .attr("r", "10")
      .attr("fill", "teal")
      .attr("opacity", ".5")
      // on mouseover eventlistner
      .on("mouseover", function(data) {
        toolTip.show(data);
      })

      // on mouseout eventlistener
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      }); 
    //  updating taxt 
    chartGroup.selectAll("text")
			.data(stateData)
			.enter()
			.append("text")
			.attr("class", "labels")
			.attr("x", d => xLinearScale(d[chosenXAxis]-0.01))
			.attr("y",d => yLinearScale(d[chosenYAxis]-0.3))
      .text(d => d.abbr);
    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
    .call(leftAxis);

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y",30)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty (%");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 70)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (median)");  
    
    
    //  append y label on y axis
    var healthLabel =   chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left +70)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcareLow") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    //  append y axis for second label
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 1.7))
    .attr("dy", "1em")
    .classed("yinactive", true)
    .attr("data-axis-name", "Smokes (%)")
    .text("Smokes (%)");
    
    // append 3rd label for y-axis
    //  append y axis for second label
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - (height / 1.7))
    .attr("dy", "1em")
    .classed("yinactive", true)
    .attr("data-axis-name", "Obese (%)")
    .text("Obese (%)");

    // x axis labels event listener
    // labelsGroup.selectAll("text")
    // .on("click", function() {
    //   // get value of selection
    //   var value = d3.select(this).attr("value");
    //   if (value !== chosenXAxis) {

    //     // replaces chosenXAxis with value
    //     chosenXAxis = value;

    //     console.log(chosenXAxis);

    //     // functions here found above csv import
    //     // updates x scale for new data
    //     xLinearScale = xScale(stateData, chosenXAxis);

    //     // updates x axis with transition
    //     xAxis = renderAxes(xLinearScale, xAxis);

    //     // updates circles with new x values
    //     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

    //     // updates tooltips with new info
    //     circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //     // changes classes to change bold text
    //     if (chosenXAxis === "num_albums") {
    //       albumsLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //       hairLengthLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //     }
    //     else {
    //       albumsLabel
    //         .classed("active", false)
    //         .classed("inactive", true);
    //       hairLengthLabel
    //         .classed("active", true)
    //         .classed("inactive", false);
    //     }
    //   }
    // });

  }).catch(function(error) {
    console.log(error);
  });
  // chart.selectAll("circle")  


    // // Step 4: Append Axes to the chart
    // // ============================== 
    
    // chartGroup.append("g")
    //   .attr("transform", `translate(0, ${height})`)
    //   .call(bottomAxis);

    // chartGroup.append("g")
    //   .call(leftAxis);
    
    // Step 5: Create Circles
    // ==============================
    
  

// // Initial Params
// // var chosenXAxis = "hair_length";
// var chosenXAxis = "poverty";  // Default initial x-axis label
// var chosenYAxis = "healthcareLow";  // Default initial y-axis label

// // function used for updating x-scale var upon click on axis label
// function xScale(stateData, chosenXAxis) {
//   // create scales
//   var xLinearScale = d3.scaleLinear()
//     .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
//       d3.max(stateData, d => d[chosenXAxis]) * 1.2
//     ])
//     .range([0, width]);

//   return xLinearScale;

// }
// // function used for updating xAxis var upon click on axis label
// function renderAxes(newXScale, xAxis) {
//   var bottomAxis = d3.axisBottom(newXScale);

//   xAxis.transition()
//     .duration(1000)
//     .call(bottomAxis);

//   return xAxis;
// }
// // function used for updating circles group with a transition to
// // new circles
// function renderCircles(circlesGroup, newXScale, chosenXAxis) {

//   circlesGroup.transition()
//     .duration(1000)
//     .attr("cx", d => newXScale(d[chosenXAxis]));

//   return circlesGroup;
// }

// // function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, circlesGroup) {

//   

  

//   circlesGroup.call(toolTip);

//   circlesGroup.on("mouseover", function(data) {
//     toolTip.show(data);
//   })
//     // onmouseout event
//     .on("mouseout", function(data, index) {
//       toolTip.hide(data);
//     });

//   return circlesGroup;
// }


