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

	return (
		<>
			<Container>
				<Grid container spacing={2}>
					<Grid item xs={6} style={{ height: '300px', width: '400px' }}> {/* Adjust height as needed */}
						<ScreePlot intrinsicDimensionalityIndex={intrinsicDimensionalityIndex} handleIntrinsicDimensionalityIndexChange={handleIntrinsicDimensionalityIndexChange} />
					</Grid>
					<Grid item xs={6} style={{ height: '300px', width: '400px' }}> {/* Adjust height as needed */}
						<Biplot numClusters={numClusters} />
					</Grid>
					<Grid item xs={6} style={{ height: '300px', width: '400px' }}> {/* Adjust height as needed */}
						<KMeansBarChart numClusters={numClusters} handleNumClusterChange={handleNumClusterChange} />
					</Grid>
					<Grid item xs={6} style={{ height: '350px', width: '400px' }}> {/* Adjust height as needed */}
						<ScatterplotMatrix numClusters={numClusters} numPrincipleComponents={intrinsicDimensionalityIndex} />
					</Grid>
				</Grid>
			</Container>
		</>
	);
};

export default HomePage;