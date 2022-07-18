import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
// import { setConfiguration } from 'react-grid-system';
import Card from '@material-ui/core/Card'
// import { CardContent } from '@material-ui/core';
// import CardHeader from '@material-ui/core/CardHeader';
import GridLayout from 'react-grid-layout';
import 'react-bootstrap-typeahead/css/Typeahead.css';

class SelectionBox extends Component {


	render() {

		const layout = [
			{ i: 'a', x: 400, y: 0, w: 10, h: 10, static: true },
		];

		const { innerWidth: width, innerHeight: height } = window;
		const rowh = height / 23;
		console.log("rowh", rowh)

		return (
			<div>
				<GridLayout className="layout" layout={layout} cols={60} rowHeight={rowh} width={width} margin={[3, 0.5]} isResizable={true}>
					<div key="a">
						<Card variant="outlined" style={{ height: rowh * 2 }}>
							<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Signaling Pathway</p>

						</Card>
					</div>
				</GridLayout>

			</div>
		);
	}
}

export default SelectionBox;