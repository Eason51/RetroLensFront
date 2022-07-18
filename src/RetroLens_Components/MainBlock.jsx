import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from '@material-ui/core/Card'

import GridLayout from 'react-grid-layout';


import 'react-bootstrap-typeahead/css/Typeahead.css';
import { RetroTree } from "./RetroTree";
import GlobalContext from '../Context/context';
import { Button } from '@material-ui/core';




const layout_noSelection = [
	{ i: 'a', x: 0, y: 0, w: 50, h: 2, static: true },
	{ i: 'b', x: 0, y: 2, w: 60, h: 19, static: true },
	{ i: 'c', x: 0, y: 21, w: 30, h: 2, static: true },
	{ i: 'd', x: 30, y: 21, w: 30, h: 2, static: true },
	{ i: 'e', x: 50, y: 0, w: 10, h: 2, static: true }
];

const layout_selection = [
	{ i: 'a', x: 0, y: 0, w: 50, h: 2, static: true },
	{ i: 'b', x: 0, y: 2, w: 50, h: 19, static: true },
	{ i: 'c', x: 0, y: 21, w: 30, h: 2, static: true },
	{ i: 'd', x: 30, y: 21, w: 20, h: 2, static: true },
	{ i: 'e', x: 50, y: 0, w: 10, h: 2, static: true },
	{ i: 'f', x: 50, y: 2, w: 10, h: 21, static: true }
];

const layout_routeCandidate = [
	{ i: 'a', x: 10, y: 0, w: 40, h: 2, static: true },
	{ i: 'b', x: 10, y: 2, w: 50, h: 19, static: true },
	{ i: 'c', x: 10, y: 21, w: 20, h: 2, static: true },
	{ i: 'd', x: 30, y: 21, w: 30, h: 2, static: true },
	{ i: 'e', x: 50, y: 0, w: 10, h: 2, static: true },
	{ i: 'g', x: 0, y: 0, w: 10, h: 21, static: true }
]



class MainBlock extends Component {

	constructor(props) {
		super(props)

		this.state = {
			layout: layout_noSelection,
			renderRoute: 0,
			routeCount: 0,
			displayedTree: {}
		}

		this.changeRouteCount = this.changeRouteCount.bind(this);
		this.changeDisplayedTree = this.changeDisplayedTree.bind(this);

	}

	changeRouteCount = (num) => {
		if (num != this.state.routeCount) {
			this.setState({
				routeCount: num
			});
		}

	}

	changeDisplayedTree = (tree) => {
		if (tree != this.state.displayedTree) {
			this.setState({
				displayedTree: tree
			});
		}
	}

	render() {

		console.log("states: ", this.state.targetMolecule);

		const layout = [
			{ i: 'a', x: 0, y: 0, w: 50, h: 2, static: true },
			{ i: 'b', x: 0, y: 2, w: this.state.w, h: 19, static: true },
			{ i: 'c', x: 0, y: 21, w: 30, h: 2, static: true },
			{ i: 'd', x: 30, y: 21, w: 20, h: 2, static: true },
			{ i: 'e', x: 50, y: 0, w: 10, h: 2, static: true }
		];

		const layout2 = [
			{ i: 'a1', x: 0, y: 0, w: 10, h: 1, static: true },
			{ i: 'b1', x: 10, y: 0, w: 10, h: 1, static: true },
			{ i: 'c1', x: 20, y: 0, w: 10, h: 1, static: true }
		]

		const { innerWidth: width, innerHeight: height } = window;
		const m = 0;
		const rowh = height / 23;
		const upperHeight = rowh * 14, lowerHeight = rowh * 9;





		return (

			<div>
				<GridLayout allowOverlap={true} preventCollision="false" className="layout" layout={this.state.layout} cols={60} rowHeight={rowh} width={width} margin={[3, 0.5]} isResizable={true}>
					<div key="a">
						<Card variant="outlined" style={{ height: rowh * 2 }}>
							<div onClick={(e) => {
								this.setState({
									layout: layout_routeCandidate
								});
							}}>
								<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>route {this.state.renderRoute}</p>
							</div>
						</Card>
					</div>
					<div key="b">
						<Card variant="outlined" style={{ height: rowh * 19 }}>
							{/* <p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Signaling Pathway</p> */}
							<RetroTree renderRoute={this.state.renderRoute} updateRouteCount={this.changeRouteCount}
								updateDisplayedTree={this.changeDisplayedTree}></RetroTree>
						</Card>
					</div>
					<div key="c">
						<Card variant="outlined" style={{ height: rowh * 2 }}>
							<GridLayout allowOverlap={true} preventCollision="false" className="layout" layout={layout2} cols={60} rowHeight={rowh / 2} width={width} margin={[3, 0.5]} isResizable={true}>
								<div key="a1">
									<Card variant="outlined" style={{ height: rowh * 2, backgroundColor: "red" }}>
										<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Red</p>
									</Card>
								</div>
								<div key="b1">
									<Card variant="outlined" style={{ height: rowh * 2, backgroundColor: "green" }}>
										<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Green</p>
									</Card>
								</div>
								<div key="c1">
									<Card variant="outlined" style={{ height: rowh * 2, backgroundColor: "yellow" }}>
										<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Yellow</p>
									</Card>
								</div>
							</GridLayout>
						</Card>
					</div>
					<div key="d">
						<Card variant="outlined" style={{ height: rowh * 2 }}>
							{/* <p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Signaling Pathway</p> */}
						</Card>
					</div>
					<div key="e">
						<Card variant="outlined" style={{ height: rowh * 2 }}>
							{/* <p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>Signaling Pathway</p> */}
							<Button fullWidth={true} style={{ backgroundColor: "#e9ecef", margin: 5 }}
								onClick={(e) => {
									this.setState({
										layout: layout_selection
									})



									fetch("http://localhost:5000/", {
										method: "POST",
										headers: {
											Accept: "Application/json"
										},
										body: "haha",
									}).then(response => {
										console.log("response", response);
									}).catch(err => {
										console.log("fetching error")
									});
								}}>
								revise
							</Button>
							<Button fullWidth={true} style={{ backgroundColor: "#e9ecef", margin: 5 }}
								onClick={(e) => {
									this.setState({
										layout: layout_noSelection
									})

									if (document.getElementById("drawBoard").innerHTML == "")
										document.getElementById("drawBoard").innerHTML = '<iframe src="./standalone/index.html" id=ifKetcher width=800 height=600></iframe>';
									else {
										let ketcher = document.getElementById("ifKetcher").contentWindow.ketcher;
										
										console.log(ketcher.getSmiles());
										// document.getElementById("drawBoard").innerHTML = "";
									}
								}}
							>
								manually design
							</Button>
						</Card>
					</div>
					<div key="f" style={{ overflow: "auto" }}>
						{
							[...Array(20)].map((x, i) =>
								<Card variant="outlined" style={{ height: rowh * 2 }}>
									<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>route {i}</p>
								</Card>
							)
						}

					</div>
					<div key="g" style={{ overflow: "auto" }}>
						{
							[...Array(this.state.routeCount)].map((x, i) =>
								<Card variant="outlined" style={{ height: rowh * 2 }}>
									<div onClick={(e) => {
										this.setState({
											layout: layout_noSelection,
											renderRoute: i
										});
									}}	>
										<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>route {i}</p>
									</div>
								</Card>
							)
						}

					</div>

				</GridLayout>

			</div>

		);
	}
}

export default MainBlock;