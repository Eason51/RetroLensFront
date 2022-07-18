import React, { Component, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from '@material-ui/core/Card'

import GridLayout from 'react-grid-layout';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import GlobalContext from '../Context/context';
import { useContext } from 'react';
import { Button, TextField } from '@material-ui/core';
import Dropdown from 'react-bootstrap/Dropdown';
import { Row } from 'react-bootstrap';
import { fontSize } from '@mui/system';
import { RetroTree } from './RetroTree';


const layout = [
	{ i: 'a', x: 0, y: 0, w: 60, h: 2, static: true },
	{ i: 'b', x: 0, y: 2, w: 60, h: 21, static: true },
];

const { innerWidth: width, innerHeight: height } = window;
const rowh = height / 23;

function TreeInterface(props) {

	const globalContext = useContext(GlobalContext);

	const [confidence, setConfidence] = useState("");
	const [confidenceLevel, setConfidenceLevel] = useState("");

	useEffect(() => {
		const globalConfidence = globalContext.confidence;
		if (globalConfidence < 0)
			setConfidence("");
		else
			setConfidence(globalConfidence);

		if(globalConfidence >= 0.6)
			setConfidenceLevel("High confidence");

	}, [globalContext])

	return (
		<GridLayout allowOverlap={true} preventCollision="false" className="layout"
			layout={layout} cols={60} rowHeight={rowh} width={width}
			margin={[3, 0.5]} isResizable={true}>

			<div key="a">
				<Card variant="outlined" style={{ height: rowh * 2, backgroundColor: "#e9ecef" }}>
					<Row style={{ position: "relative", top: "25%" }}>
						<div style={{
							position: "relative", left: "3%",
							fontSize: "150%", backgroundColor: "#a7f0b9",
							borderRadius: 20, minWidth: "175px",
							textAlign: "center", fontSize: "20px",
							alignItems: "center", justifyContent: "center",
							verticalAlign: "middle", marginTop: "auto", marginBottom: "auto"
						}}>
							{confidenceLevel}
						</div>
						<div style={{
							position: "relative", left: "4%",
							fontSize: "150%",
							fontSize: "20px", marginTop: "auto", marginBottom: "auto"
						}}>
							Confidence: {confidence}
						</div>
						<Button id="reviseButton"
							variant='contained' size='large'
							style={{ position: "relative", left: "68%" }}
							onClick={() => {
								const promise = fetch("http://192.168.31.118:5000/revise", {
									method: "POST",
									headers: {
										"Accept": "application/json",
										"Content-Type": "application/json"
									},
									body: JSON.stringify(globalContext.treeData)
								})

								globalContext.updateRevisePromise(promise);
								//把sidebar的打开关闭在这个component
								// .then((response) =>
								// 	response.json())
								// .then((responseJson) => {
								// 	console.log("revise_response", responseJson);
								// 	globalContext.updateTreeData(responseJson);
								// 	globalContext.treeGraph.read(responseJson);
								// })
								// .catch(err => {
								// 	console.log("fetching error")
								// 	console.log(err);
								// });
							}}
						>
							revise
						</Button>
					</Row>
				</Card>
			</div>
			<div key="b">
				<Card id='treeCard' variant="outlined" style={{ height: rowh * 21 }}>

					{props.RetroTreeComponent}

					<Dropdown show="true" drop='up' style={{ position: "absolute", top: "90%", left: "0%" }}>
						<Dropdown.Item>
							<Row>
								<div style={{
									width: "20px", backgroundColor: "rgb(40, 163, 13)",
									height: "20px"
									, borderRadius: "2px"
								}}></div>
								<div style={{ width: "10px" }}></div>
								Commercially/readily available
							</Row>
						</Dropdown.Item>
						<Dropdown.Item>
							<Row>
								<div style={{
									width: "20px", backgroundColor: "rgb(206, 78, 4)",
									height: "20px",
									borderRadius: "2px"
								}}></div>
								<div style={{ width: "10px" }}></div>
								Not able to find a synthetic path
							</Row>
						</Dropdown.Item>
					</Dropdown>
				</Card>
			</div>
		</GridLayout>
	);
}

export { TreeInterface };