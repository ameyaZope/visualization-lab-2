import * as d3 from "d3";
import { useEffect, useRef } from "react";

function Biplot({ numClusters = 3 }) {
	const biPlotSvgRef = useRef();
	useEffect(() => {
		// set the dimensions and margins of the graph
		const margin = { top: 30, right: 200, bottom: 90, left: 90 },
			width = 1000 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

		// below line clears the svg so that next graph can be drawn on it, 
		// else there is overlap of graphs
		var svgSelected = d3.select("#plot");
		svgSelected.selectAll("*").remove();

		// append the svg object to the body of the page
		var svg = d3.select(biPlotSvgRef.current)
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
			.text(`PCA Based Biplot`);

		d3.json('/apis/pca/biPlotData').then((biPlotData) => {
			var minX = 10, maxX = 0;
			for (let i = 0; i < biPlotData['components'].length; i++) {
				minX = Math.min(minX, biPlotData['components'][i][0])
				maxX = Math.max(maxX, biPlotData['components'][i][0])
			}
			const x = d3.scaleLinear()
				.domain([minX, maxX])
				.range([0, width])

			const xAxis = svg.append('g')
				.attr("transform", `translate(0,${height})`)
				.call(d3.axisBottom(x))
				.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.style("text-anchor", "end");

			svg.append("text")
				.attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
				.style("text-anchor", "middle")
				.text(`Principle Component 1`);

			var minY = 10, maxY = 0;
			for (let i = 0; i < biPlotData['components'].length; i++) {
				minY = Math.min(minY, biPlotData['components'][i][1])
				maxY = Math.max(maxY, biPlotData['components'][i][1])
			}
			const y = d3.scaleLinear()
				.domain([minY, maxY])
				.range([height, 0])
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
				.text("Principle Component 2");

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

			// Define the color scale.
			const color = d3.scaleOrdinal()
				.domain(biPlotData['display_data'].map(d => d['clusters'][numClusters - 1]))
				.range(d3.schemeCategory10.slice(0, numClusters));

			// Add dots
			svg.append('g')
				.selectAll("dot")
				.data(biPlotData['display_data'])
				.enter()
				.append("circle")
				.attr("cx", function (d) {
					// Return position with optional jitter
					return x(d['pcs'][0]);
				})
				.attr("cy", function (d) {
					// Return position with optional jitter
					return y(d['pcs'][1]);
				})
				.attr("r", 5)
				.attr("fill-opacity", 0.7)
				.attr("fill", function (d) {
					return color(d['clusters'][numClusters - 1])
				})
				.on('mouseover', function (event, data) {
					tooltip
						.html(
							`<div> ${"PC1"} : ${data['pcs'][0]} <br> ${"PC2"} : ${data['pcs'][1]} </div>`
						)
						.style('visibility', 'visible');
					d3.select(this).style('fill', 'black');
				})
				.on('mousemove', function (d) {
					tooltip
						.style('top', d.pageY - 10 + 'px')
						.style('left', d.pageX + 10 + 'px');
				})
				.on('mouseout', function (event, d) {
					tooltip.html(``).style('visibility', 'hidden');
					d3.select(this).transition().style('fill', color(d['clusters'][numClusters - 1])); // Use the original fill color
				})

			// Legend setup
			var legendSpace = 20; // Spacing between legend items
			var legendRectSize = 14; // The size of the legend color squares
			var legendHeight = height + (margin.bottom / 2); // Positioning of the legend

			// Legend labels - adjust these based on your actual clusters or categories
			var legendLabels = ["Cluster 1", "Cluster 2", "Cluster 3", "Cluster 4", "Cluster 5", "Cluster 6", "Cluster 7", "Cluster 8", "Cluster 9", "Cluster 10"];

			// Add one dot in the legend for each name
			var legend = svg.selectAll("legend")
				.data(color.range())
				.enter()
				.append("g")
				.attr("transform", function (d, i) { return "translate(0," + i * legendSpace + ")"; });

			// Add the color squares to the legend
			legend.append("rect")
				.attr("x", width + 10)
				.attr("y", 0)
				.attr("width", legendRectSize)
				.attr("height", legendRectSize)
				.style("fill", function (d) { return d; });

			// Add the text labels to the legend
			legend.append("text")
				.attr("x", width + 30)
				.attr("y", 10)
				.text(function (d, i) { return legendLabels[i]; });
		})

	}, [numClusters]);

	return (
		<svg width={1000} height={600} id='biPlot' ref={biPlotSvgRef} />
	)
}

export default Biplot;