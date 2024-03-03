import { Container, Grid } from "@mui/material";
import Biplot from "components/biplot";
import KMeansBarChart from "components/KMeansBarChart";
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
		<Container>
			<Grid>
				<Grid xs={12} item={true} alignItems="center" justifyContent="center">
					<ScreePlot intrinsicDimensionalityIndex={intrinsicDimensionalityIndex} handleIntrinsicDimensionalityIndexChange={handleIntrinsicDimensionalityIndexChange}/>
					<Biplot numClusters={numClusters} />
					<KMeansBarChart handleNumClusterChange={handleNumClusterChange} />
					<ScatterplotMatrix numClusters={numClusters} numPrincipleComponents={intrinsicDimensionalityIndex}/>
					{/* {chartType === 'screePlot' && <ScreePlot />}
					{chartType === 'biPlot' && <Biplot />}
					{chartType === 'kMeansBarChart' && <KMeansBarChart />} */}
				</Grid>
			</Grid>
		</Container>
	)
};

export default HomePage;