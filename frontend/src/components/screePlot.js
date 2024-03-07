import * as d3 from "d3";
import { useEffect, useRef } from "react";

function ScreePlot({ intrinsicDimensionalityIndex,
	handleIntrinsicDimensionalityIndexChange }) {
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
			.style("font-size", "20px")
			.style("text-decoration", "underline")
			.text(`Scree Plot`);

		d3.json('/apis/pca/sceePlotData').then((data) => {
			// Calculate the cumulative explained variance
			const cumulativeExplainedVariances = data['explained_variance_ratio'].reduce((acc, curr, i) => {
				if (i === 0) acc.push(curr);
				else acc.push(curr + acc[i - 1]);
				return acc;
			}, []);

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
				.attr("x", (d, i) => { return x(i + 1) })
				.attr("width", x.bandwidth())
				.attr("fill", (d, i) => {
					if (i + 1 == intrinsicDimensionalityIndex) {
						return "crimson"
					}
					else {
						return "steelblue"
					}
				})
				// no bar at the beginning thus:
				.attr("height", d => height - y(0)) // always equal to 0
				.attr("y", d => y(0))
				.on('mouseover', function (event, data) {
					tooltip
						.html(
							`<div>Eigenvalue: ${data}</div>`
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
					d3.select(this).attr('fill', (d) => {
						for (let i = 0; i < data['explained_variance_ratio'].length; i++) {
							if (d == data['explained_variance_ratio'][i]) {
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
				.on('click', function (event, d) {
					for (let i = 0; i < data['explained_variance_ratio'].length; i++) {
						if (data['explained_variance_ratio'][i] == d) {
							handleIntrinsicDimensionalityIndexChange(i+1);
						}
					}
				})

			// Animation
			svg.selectAll("rect")
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
				.style("fill", "yellow") // Fill color
				.style("stroke", "black") // Border color
				.on('mouseover', function (event, d) {
					d3.select(this).style("fill", "purple").style('opacity', 0.7);
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
						.attr("stroke-width", 1)
						.style("stroke-dasharray", ("3, 3"));
					d3.select(this).attr('fill', '#eec42d');
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
					d3.select(this).style("fill", "yellow").style('opacity', 0.7);
				});
		})

	}, [intrinsicDimensionalityIndex])

	return (
		<svg width={600} height={300} id='screePlot' ref={screePlotSvgRef} />
	)
}

export default ScreePlot;