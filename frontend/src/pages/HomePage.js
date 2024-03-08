import { Container, Grid } from "@mui/material";
import KMeansBarChart from "components/KMeansBarChart";
import Biplot from "components/biplot";
import ScatterplotMatrix from "components/scatterplotMatrix";
import ScreePlot from "components/screePlot";
import * as React from 'react';

function HomePage() {
	const [chartType, setChartType] = React.useState('biPlot');
	
	const [numClusters, setNumClusters] = React.useState(3);
	const handleNumClusterChange = (numClusters) => {
		console.log(`Changing clusters to ${numClusters}`)
		setNumClusters(numClusters)
	}

	const [intrinsicDimensionalityIndex, setIntrinsicDimensionalityIndex] = React.useState(3);
	const handleIntrinsicDimensionalityIndexChange = (intrinsicDimensionalityIndex) => {
		console.log(`Changing intrinsic dimensionality index to ${intrinsicDimensionalityIndex}`)
		setIntrinsicDimensionalityIndex(intrinsicDimensionalityIndex);
	}

	const [component1, setComponent1] = React.useState(0);
	const handleComponent1Change = (newComponent1) => {
		setComponent1(newComponent1)
	}

	const [component2, setComponent2] = React.useState(1);
	const handleComponent2Change = (newComponent2) => {
		setComponent2(newComponent2)
	}

	const [currAxis, setCurrAxis] = React.useState(0);
	const handleCurrAxisChange = (newCurrAxis) => {
		setCurrAxis(newCurrAxis);
	}

	return (
		<>
			<Container>
				<Grid container spacing={2}>
					<Grid item xs={6} style={{ height: '300px', width: '400px' }}> {/* Adjust height as needed */}
						<ScreePlot intrinsicDimensionalityIndex={intrinsicDimensionalityIndex} 
						handleIntrinsicDimensionalityIndexChange={handleIntrinsicDimensionalityIndexChange} 
						component1={component1} 
						handleComponent1Change={handleComponent1Change} 
						component2={component2} 
						handleComponent2Change={handleComponent2Change} 
						currAxis={currAxis}
						handleCurrAxisChange={handleCurrAxisChange}/>
					</Grid>
					<Grid item xs={6} style={{ height: '300px', width: '400px' }}> {/* Adjust height as needed */}
						<Biplot numClusters={numClusters} component1={component1} component2={component2} />
					</Grid>
					<Grid item xs={6} style={{ height: '300px', width: '400px' }}> {/* Adjust height as needed */}
						<KMeansBarChart numClusters={numClusters} handleNumClusterChange={handleNumClusterChange} />
					</Grid>
					<Grid item xs={6} style={{ height: '400px', width: '500px' }}> {/* Adjust height as needed */}
						<ScatterplotMatrix numClusters={numClusters} numPrincipleComponents={intrinsicDimensionalityIndex} />
					</Grid>
				</Grid>
			</Container>
		</>
	);
};

export default HomePage;