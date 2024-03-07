import * as d3 from "d3";
import { useEffect, useRef } from "react";



function ScatterplotMatrix({ numClusters = 2, numPrincipleComponents = 3 }) {
	const scatterplotMatrixSvgRef = useRef();


	useEffect(() => {

		d3.json('/apis/pca/scatterplotMatrix').then(data => {
			const width = 380;
			const height = 350;
			const padding = 28;
			const columns = [1, 2, 3, 4, 5, 6, 7].slice(0, numPrincipleComponents)
			const size = (width - (columns.length + 1) * padding) / columns.length + padding;
			const margin = { top: 10, right: 100, bottom: 50, left: 20 }

			// Define the horizontal scales (one for each row).
			const x = columns.map(c => d3.scaleLinear()
				.domain(d3.extent(data['display_data'], (d) => { return d['pcs'][c - 1] }))
				.rangeRound([padding / 2, size - padding / 2]))

			// Define the companion vertical scales (one for each column).
			const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));

			// Define the horizontal axis (it will be applied separately for each column).
			const axisx = d3.axisBottom()
				.ticks(6)
				.tickSize(size * columns.length);
			const xAxis = g => g.selectAll("g").data(x).join("g")
				.attr("transform", (d, i) => `translate(${i * size},0)`)
				.each(function (d) { return d3.select(this).call(axisx.scale(d)); })
				.call(g => g.select(".domain").remove())
				.call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

			// Define the vertical axis (it will be applied separately for each row).
			const axisy = d3.axisLeft()
				.ticks(6)
				.tickSize(-size * columns.length);
			const yAxis = g => g.selectAll("g").data(y).join("g")
				.attr("transform", (d, i) => `translate(0,${i * size})`)
				.each(function (d) { return d3.select(this).call(axisy.scale(d)); })
				.call(g => g.select(".domain").remove())
				.call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

			// below line clears the svg so that next graph can be drawn on it, 
			// else there is overlap of graphs
			var svgSelected = d3.select("#scatterplotMatrix");
			svgSelected.selectAll("*").remove();

			// append the svg object to the body of the page
			var svg = d3.select(scatterplotMatrixSvgRef.current)
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform",
					"translate(" + margin.left + "," + margin.top + ")")
				.attr("viewBox", [-padding, 0, width, height]);

			// Define the color scale.
			const color = d3.scaleOrdinal()
				.domain(data['display_data'].map(d => d['clusters'][numClusters - 1]))
				.range(d3.schemeCategory10.slice(0, numClusters));

			// Legend setup
			var legendSpace = 20; // Spacing between legend items
			var legendRectSize = 14; // The size of the legend color squares
			var legendHeight = height / 2; // Positioning of the legend

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
				.attr("x", width)
				.attr("y", 0)
				.attr("width", legendRectSize)
				.attr("height", legendRectSize)
				.style("fill", function (d) { return d; });

			// Add the text labels to the legend
			legend.append("text")
				.attr("x", width + legendRectSize * 2)
				.attr("y", 10)
				.text(function (d, i) { return legendLabels[i]; });

			svg.append("style")
				.text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);

			svg.append("g")
				.call(xAxis);

			svg.append("g")
				.call(yAxis);


			const cell = svg.append("g")
				.selectAll("g")
				.data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
				.join("g")
				.attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

			cell.append("rect")
				.attr("fill", "none")
				.attr("stroke", "#aaa")
				.attr("x", padding / 2 + 0.5)
				.attr("y", padding / 2 + 0.5)
				.attr("width", size - padding)
				.attr("height", size - padding);

			cell.each(function ([i, j]) {
				d3.select(this).selectAll("circle")
					.data(data['display_data'])
					.join("circle")
					.attr("cx", (d) => { return x[i](0) })
					.attr("cy", (d) => { return y[j](d['pcs'][columns[j] - 1]) });

				d3.select(this).selectAll("circle")
					.transition()
					.delay(function (d, ii) { return (ii * 3) })
					.duration(2000)
					.attr("cx", (d) => { return x[i](d['pcs'][columns[i] - 1]) })
					.attr("cy", (d) => { return y[j](d['pcs'][columns[j] - 1]) })
			});

			const circle = cell.selectAll("circle")
				.attr("r", 3.5)
				.attr("fill-opacity", 0.7)
				.attr("fill", (d) => { return color(d['clusters'][numClusters-1]) });



			//brushing logic 
			function brush(cell, circle, svg, { padding, size, x, y, columns }) {
				const brush = d3.brush()
					.extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
					.on("start", brushstarted)
					.on("brush", brushed)
					.on("end", brushended);

				cell.call(brush);

				let brushCell;

				// Clear the previously-active brush, if any.
				function brushstarted() {
					if (brushCell !== this) {
						d3.select(brushCell).call(brush.move, null);
						brushCell = this;
					}
				}

				// Highlight the selected circles.
				function brushed({ selection }, [i, j]) {
					let selected = [];
					if (selection) {
						const [[x0, y0], [x1, y1]] = selection;
						circle.classed("hidden",
							d => x0 > x[i](d['pcs'][columns[i] - 1])
								|| x1 < x[i](d['pcs'][columns[i] - 1])
								|| y0 > y[j](d['pcs'][columns[j] - 1])
								|| y1 < y[j](d['pcs'][columns[j] - 1]));
						selected = data['display_data'].filter(
							d => x0 < x[i](d['pcs'][columns[i] - 1])
								&& x1 > x[i](d['pcs'][columns[i] - 1])
								&& y0 < y[j](d['pcs'][columns[j] - 1])
								&& y1 > y[j](d['pcs'][columns[j] - 1]));
					}
					svg.property("value", selected).dispatch("input");
				}

				// If the brush is empty, select all circles.
				function brushended({ selection }) {
					if (selection) return;
					svg.property("value", []).dispatch("input");
					circle.classed("hidden", false);
				}
			}
			// Ignore this line if you don't need the brushing behavior.
			cell.call(brush, circle, svg, { padding, size, x, y, columns });

			svg.append("g")
				.style("font", "bold 16px Comic Sans MS")
				.style("pointer-events", "none")
				.selectAll("text")
				.data(columns)
				.join("text")
				.attr("transform", (d, i) => `translate(${i * size},${i * size})`)
				.attr("x", padding)
				.attr("y", padding)
				.attr("dy", ".71em")
				.text(d => `PC #${d}`);

			svg.property("value", [])
		})
	}, [numClusters, numPrincipleComponents])

	return (
		<svg width={500} height={350} id='scatterplotMatrix' ref={scatterplotMatrixSvgRef} />
	)
}

export default ScatterplotMatrix;