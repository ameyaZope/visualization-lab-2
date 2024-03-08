import * as d3 from "d3";
import { useEffect, useRef } from "react";

function ScreePlot({ intrinsicDimensionalityIndex,
	handleIntrinsicDimensionalityIndexChange,
	component1,
	handleComponent1Change,
	component2,
	handleComponent2Change,
	currAxis = 1,
	handleCurrAxisChange }) {
	const screePlotSvgRef = useRef();
	useEffect(() => {
		// set the dimensions and margins of the graph
		const margin = { top: 30, right: 30, bottom: 50, left: 90 },
			width = 500 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		// below line clears the svg so that next graph can be drawn on it, 
		// else there is overlap of graphs
		var svgSelected = d3.select("#plot");
		svgSelected.selectAll("*").remove();

		// append the svg object to the body of the page
		var svg = d3.select(screePlotSvgRef.current)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
		svg.append("text")
			.attr("x", width / 2)
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("text-decoration", "underline")
			.style("font", "bold 16px Comic Sans MS")
			.text(`Scree Plot`);

		d3.json('/apis/pca/sceePlotData').then((data) => {
			const numeric_column_list = ['instrumentalness', 'acousticness', 'danceability', 'valence',
				'energy', 'liveness', 'speechiness']

			// Calculate the cumulative explained variance
			const cumulativeExplainedVariances = data['explained_variance_ratio'].reduce((acc, curr, i) => {
				if (i === 0) acc.push(curr);
				else acc.push(curr + acc[i - 1]);
				return acc;
			}, []);

			const loadings = data['loadings'].slice(0, intrinsicDimensionalityIndex)
			const squared_sum_loadings = [0, 0, 0, 0, 0, 0, 0]
			for (let i = 0; i < 7; i++) {
				for (let j = 0; j < loadings.length; j++) {
					squared_sum_loadings[i] += loadings[j][i] * loadings[j][i];
				}
			}
			const squared_sum_loadings_map_list = []
			for (let i = 0; i < squared_sum_loadings.length; i++) {
				squared_sum_loadings_map_list.push({
					'feature': i + 1,
					'squared_sum_loading': squared_sum_loadings[i]
				})
			}

			squared_sum_loadings_map_list.sort(
				(a, b) => b.squared_sum_loading - a.squared_sum_loading);

			// Append a group for the table
			var tableGroup = svg.append("g")
				.attr("transform", `translate(0,0 )`);

			const top4 = squared_sum_loadings_map_list.slice(0, 4); // Assuming this gives you the top 4 elements

			// Calculate background size
			const tableHeight = (top4.length + 1) * 20 + 10; // Adjust spacing and padding as necessary
			const tableWidth = 210; // Adjust based on your content width

			// Draw background rectangle with rounded corners
			tableGroup.append("rect")
				.attr("width", tableWidth)
				.attr("height", 100)
				.attr("x", 190)
				.attr("y", 75) // Adjust y position based on title height and padding
				.attr("rx", 15) // Rounded corner x-axis radius
				.attr("ry", 15) // Rounded corner y-axis radius
				.attr("fill", "pink") // Background color
				.style("stroke", "black") // Border color
				.style("stroke-width", "2px"); // Border width

			// Title for the table
			tableGroup.append("text")
				.attr("x", 275) // Center the title
				.attr("y", 70)
				.attr("text-anchor", "middle") // Center align text
				.style("font", "bold 16px Comic Sans MS")
				.text("Top Features");

			const headingYOffset = 90; // Adjust as needed based on your layout

			// Append heading line for "Feature" column
			tableGroup.append("text")
				.attr("x", 200) // Align with the feature column
				.attr("y", headingYOffset)
				.attr("text-anchor", "start") // Align text to the start (left)
				.style("font", "bold 16px Comic Sans MS")
				.text("Feature");

			// Append heading line for "Squared Sum Loading" column
			tableGroup.append("text")
				.attr("x", 340) // Align with the squared sum loading column, adjust according to your layout
				.attr("y", headingYOffset)
				.attr("text-anchor", "start") // Align text to the start (left)
				.style("font", "bold 16px Comic Sans MS")
				.text("Sq Sum");

			// Adjust the starting y position of the rows to account for the heading
			top4.forEach((element, index) => {
				// Adjust the y position for each row to account for the heading line
				const rowYPosition = headingYOffset + 20 + (index * 20); // This now includes the headingYOffset

				// Existing code to append rows, with adjusted y positions using rowYPosition
				// For example:
				tableGroup.append("text")
					.attr("x", 200)
					.attr("y", rowYPosition)
					.style("font", "bold 16px Comic Sans MS")
					.text(`${numeric_column_list[element.feature - 1]}`);

				tableGroup.append("text")
					.attr("x", 340)
					.attr("y", rowYPosition)
					.style("font", "bold 16px Comic Sans MS")
					.text(`${element.squared_sum_loading.toFixed(4)}`);

				if (index < top4.length - 1) { // Add separators between rows, but not after the last row
					tableGroup.append("line") // Append a line for each separator
						.attr("x1", 190) // Start of the line (x)
						.attr("y1", (index + 1) * 20 + 95) // Position the line just below the row of text
						.attr("x2", 190 + tableWidth) // End of the line (x), spanning the width of the table
						.attr("y2", (index + 1) * 20 + 95) // Same as y1 for a horizontal line
						.attr("stroke", "black") // Color of the line
						.attr("stroke-width", 2); // Thickness of the line
				}
			});

			const x = d3.scaleBand()
				.domain(d3.range(1, data['explained_variance_ratio'].length + 1))
				.range([0, width])
				.padding(0.2);

			const xAxis = svg.append('g')
				.attr("transform", `translate(0,${height})`)
				.call(d3.axisBottom(x))
				.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.style("text-anchor", "end");

			svg.append("text")
				.attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
				.style("text-anchor", "middle")
				.style("font", "bold 16px Comic Sans MS")
				.text(`Principle Component`);

			const maxY = Math.max(...cumulativeExplainedVariances); // NEW: Adjust domain to include cumulative max
			const y = d3.scaleLinear()
				.domain([0, maxY])
				.range([height, 0]);
			const yAxis = svg.append('g')
				.transition()
				.duration(1000)
				.call(d3.axisLeft(y));
			svg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				.attr("x", 0 - (height / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.style("font", "bold 16px Comic Sans MS")
				.text("Explained Variance Ratio");

			var tooltip = d3
				.select('body')
				.append('div')
				.attr('class', 'd3-tooltip')
				.style('position', 'absolute')
				.style('z-index', '10')
				.style('visibility', 'hidden')
				.style('padding', '10px')
				.style('background', 'rgba(0,0,0,0.6)')
				.style('border-radius', '4px')
				.style('color', '#fff')
				.text('a simple tooltip');

			let isTransitioning = false;

			// Bars
			svg.selectAll("mybar")
				.data(data['explained_variance_ratio'])
				.join("rect")
				.attr("class", "bar")
				.attr("x", (d, i) => { return x(i + 1) })
				.attr("width", x.bandwidth())
				.attr("fill", (d, i) => {
					if (i == component1 || i == component2) {
						return "crimson";
					}
					else return "steelblue"
				})
				// no bar at the beginning thus:
				.attr("height", d => height - y(0)) // always equal to 0
				.attr("y", d => y(0))
				.on('mouseover', function (event, data) {
					tooltip
						.html(
							`<div>Explained Variance Ratio: ${data}</div>`
						)
						.style('visibility', 'visible');
					d3.select(this).attr('fill', '#eec42d');
				})
				.on('mousemove', function (d) {
					tooltip
						.style('top', d.pageY - 10 + 'px')
						.style('left', d.pageX + 10 + 'px');
				})
				.on('mouseout', function () {
					tooltip.html(``).style('visibility', 'hidden');
					d3.select(this).attr("fill", (d) => {
						let currBar = 0;
						for(let i=0;i<data['explained_variance_ratio'].length;i++) {
							if(data['explained_variance_ratio'][i]==d) {
								if (i == component1 || i == component2) {
									return "crimson";
								}
								else return "steelblue"
							}
						}
					});
				})
				.on('click', function (event, d) {
					let newComponent = 0;
					for (let i = 0; i < data['explained_variance_ratio'].length; i++) {
						if (d == data['explained_variance_ratio'][i]) {
							newComponent = i;
						}
					}
					if (currAxis == 0) {
						handleComponent1Change(newComponent);
						handleCurrAxisChange(1);
					}
					else {
						handleComponent2Change(newComponent);
						handleCurrAxisChange(0);
					}
				})

			// Animation
			svg.selectAll(".bar")
				.transition()
				.duration(800)
				.delay((d, i) => { return i * 20 })
				.attr("y", d => { return y(d) })
				.attr("height", d => { return height - y(d) });

			// Create a line generator
			const line = d3.line()
				.x((d, i) => x(i + 1) + x.bandwidth() / 2) // Position in the center of the bars
				.y(d => y(d));

			// Add the cumulative explained variance line to the plot
			svg.append("path")
				.datum(cumulativeExplainedVariances) // Bind cumulative data
				.attr("fill", "none")
				.attr("stroke", "red")
				.attr("stroke-width", 1.5)
				.attr("d", line);

			// Add dots for each point on the cumulative variance line
			svg.selectAll(".dot")
				.data(cumulativeExplainedVariances)
				.enter().append("circle") // Uses the enter().append() method
				.attr("class", "dot") // Assign a class for styling
				.attr("cx", (d, i) => x(i + 1) + x.bandwidth() / 2)
				.attr("cy", d => y(d))
				.attr("r", 5) // Radius size, could be adjusted
				.style("fill", (d, i) => {
					if (i + 1 == intrinsicDimensionalityIndex) {
						return "crimson"
					}
					else {
						return "steelblue"
					}
				}) // Fill color
				.style("stroke", "black") // Border color
				.on('mouseover', function (event, d) {
					d3.select(this).style("fill", "purple");
					tooltip
						.html(
							`<div>PC: ${cumulativeExplainedVariances.indexOf(d) + 1}<br/> Value: ${d.toFixed(4)}</div>`
						)
						.style('visibility', 'visible');

					// NEW: Add a dashed vertical line
					svg.append("line")
						.attr("class", "hover-line") // Use a class to easily remove it later
						.attr("x1", x(cumulativeExplainedVariances.indexOf(d) + 1) + x.bandwidth() / 2)
						.attr("x2", x(cumulativeExplainedVariances.indexOf(d) + 1) + x.bandwidth() / 2)
						.attr("y1", y(d))
						.attr("y2", height)
						.attr("stroke", "black")
						.attr("stroke-width", 2)
						.attr("stroke-dasharray", ("10, 3"));
				})
				.on('mousemove', function (d) {
					tooltip
						.style('top', d.pageY - 10 + 'px')
						.style('left', d.pageX + 10 + 'px');
				})
				.on("mouseout", function (d) {
					tooltip.html(``).style('visibility', 'hidden');
					// Remove the dashed line on mouseout
					svg.selectAll(".hover-line").remove();
					d3.select(this).style("fill", (d) => {
						for (let i = 0; i < cumulativeExplainedVariances.length; i++) {
							if (d == cumulativeExplainedVariances[i]) {
								if (i + 1 == intrinsicDimensionalityIndex) {
									return "crimson"
								}
								else {
									return "steelblue"
								}
							}
						}
					});
				})
				.on('click', function (event, data) {
					for (let i = 0; i < cumulativeExplainedVariances.length; i++) {
						if (cumulativeExplainedVariances[i] == data) {
							handleIntrinsicDimensionalityIndexChange(i + 1);
						}
					}
				});
		})

	}, [intrinsicDimensionalityIndex, component1, component2, currAxis])

	return (
		<svg width={600} height={300} id='screePlot' ref={screePlotSvgRef} />
	)
}

export default ScreePlot;