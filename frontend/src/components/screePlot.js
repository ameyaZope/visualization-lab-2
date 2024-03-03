import * as d3 from "d3";
import { useEffect, useRef } from "react";

function ScreePlot({ intrinsicDimensionalityIndex,
	handleIntrinsicDimensionalityIndexChange }) {
	const screePlotSvgRef = useRef();
	useEffect(() => {
		// set the dimensions and margins of the graph
		const margin = { top: 30, right: 30, bottom: 90, left: 90 },
			width = 500 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

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

		d3.json('/apis/pca/sceePlotData').then((screePlotData) => {
			const x = d3.scaleBand()
				.domain(d3.range(1, screePlotData['eigenvalues'].length + 1))
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

			const y = d3.scaleLinear()
				.domain([0,
					screePlotData['eigenvalues'][0] * 1.3])
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
				.text("Eigen Values");

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
				.data(screePlotData['eigenvalues'])
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
						for (let i = 0; i < screePlotData['eigenvalues'].length; i++) {
							if (d == screePlotData['eigenvalues'][i]) {
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
					for(let i=0;i<screePlotData['eigenvalues'].length;i++) {
						if (screePlotData['eigenvalues'][i] == d) {
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
		})

	}, [intrinsicDimensionalityIndex])

	return (
		<svg width={600} height={600} id='screePlot' ref={screePlotSvgRef} />
	)
}

export default ScreePlot;