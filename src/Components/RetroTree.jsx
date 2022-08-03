import React, { useContext, useEffect, useRef, useState } from 'react';
import G6 from '@antv/g6';
import { Col, Modal, Row } from 'react-bootstrap';
import { createNodeFromReact, appenAutoShapeListener, Text } from '@antv/g6-react-node';
import ReactDOM from "react-dom";
import { RetroTreeNode } from './RetroTreeNode';
import { RetroTreeEdge } from "./RetroTreeEdge";
import GlobalContext from '../Context/context';
import {
	ProSidebar,
	Menu,
	MenuItem,
	SidebarHeader,
	SidebarFooter,
	SidebarContent,
	SubMenu
} from "react-pro-sidebar";

import "./sidebar.scss";
// import "react-pro-sidebar/dist/css/styles.css";

import { parseRoute } from "../Helpers/helpers";
import { AIResult } from "../RetroLens_Components/AIsucess";
import { Card, MuiThemeProvider, Typography } from '@material-ui/core';
import { Box, Button } from "@mui/material";

import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Fab from '@mui/material/Fab';
import { DeleteMoleculeModal } from "./DeleteMoleculeModal";
import { DeleteButtonModal } from "./DeleteButtonModal";
import { EditMoleculeModal } from "./EditMoleculeModal";
import { ConstraintInputPanel } from '../RetroLens_Components/ConstraintInputPanel';
import { EmbedConstraintInputPanel } from './EmbedConstraintInputPanel';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { WeightInputPanel } from './WeightInputPanel';
import useRefs from "react-use-refs";



let graph = null

let selectedModel = null;
let selectedModelParent = null;
let selectedRoute = null;
let previousGraph = null;

let previousReviseSelectedNode = null;

// const [alternativeHighlightArr, setAlternativeHighlightArr] = useState([]);

let alternativeHighlightArr = [];

function setAlternativeHighlightArr(arr) {
	alternativeHighlightArr = arr
}


const NoMaxWidthTooltip = styled(({ className, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))({
	[`& .${tooltipClasses.tooltip}`]: {
		maxWidth: 'none',
	},
});


const { innerWidth: width, innerHeight: height } = window;
const rowh = height / 23;


const RetroTree = (props) => {

	const [sideMenuCollapsed, setSideMenuCollapsed] = useState(true);
	const [reviseMenuCollapsed, setReviseMenuCollapsed] = useState(true);
	const [routeList, setRouteList] = useState([]);
	const [reviseList, setReviseList] = useState([]);
	const [sideButtonVisibility, setSideButtonVisibility] = useState("hidden");
	const [modalArr, setModelArr] = useState([]);
	const [constraints, updateConstraints] = useState(props.constraints);
	const [savedConstraints, updateSavedConstraints] = useState(props.constraints);
	const [showConstraintInput, setShowConstraintInput] = useState(false);
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	const [weights, updateWeights] = useState({
		influence: null,
		complexity: null,
		convergence: null,
		reactionConfidence: null,
		associatedSubtreeConfidence: null
	});
	const [savedWeights, updateSavedWeights] = useState({
		influence: null,
		complexity: null,
		convergence: null,
		reactionConfidence: null,
		associatedSubtreeConfidence: null
	});
	const [showWeightInput, setShowWeightInput] = useState(false);

	// const stateRef = useRef();
	// stateRef.current = savedConstraints;

	const [stateRef, weightRef] = useRefs();
	stateRef.current = savedConstraints;
	weightRef.current = savedWeights;


	const updateConstraintFromPanel = (price, mssr, excludeSubstructure, excludeSmiles) => {
		updateConstraints({
			price: price,
			mssr: mssr,
			excludeSubstructure: excludeSubstructure,
			excludeSmiles: excludeSmiles
		})
	};

	const updateWeightFromPanel = (influence, complexity, convergence, reactionConfidence, associatedSubtreeConfidence) => {
		updateWeights({
			influence: influence,
			complexity: complexity,
			convergence: convergence,
			reactionConfidence: reactionConfidence,
			associatedSubtreeConfidence: associatedSubtreeConfidence
		});

	}


	const ref = React.useRef(null)

	const globalContext = useContext(GlobalContext);

	const exitDrawBoard = () => {
		setTimeout(updateDrawBoardOutput, 200);
	}

	const updateDrawBoardOutput = () => {

		let model = selectedModel;
		const currentSmiles = document.getElementById("smiles").innerHTML;
		// console.log("disconnection", document.getElementById("smiles").innerHTML);
		const smilesArr = currentSmiles.split(".");
		let id = "";
		model.children = [];
		smilesArr.forEach(smiles => {
			id = `n-${Math.random()}`;
			model.children.push({
				smiles: smiles,
				handledByAI: true,
				id
			});
		});

		graph.updateChildren(model.children, model.id);
		globalContext.updateTreeData(graph.cfg.data);
		graph.read(graph.cfg.data);


		const currentConstraints = stateRef.current;
		console.log("currentConstraints", currentConstraints);

		fetch(globalContext.serverIp.concat("checkRXN"), {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				graph: graph.cfg.data,
				constraints: currentConstraints
			})
		}).then((response) =>
			response.json())
			.then((responseJson) => {
				console.log("checkRXN_response", responseJson);
				globalContext.updateTreeData(responseJson);
				graph.read(responseJson);
			})
			.catch(err => {
				console.log("fetching error")
				console.log(err);
			});
	}


	const exitEditMolecule = () => {
		setTimeout(updateEditMoleculeOutput, 200);
		document.getElementById("editMolecule").style.zIndex = -2;
		document.getElementById("editMolecule").style.visibility = "hidden";
		// document.getElementById("drawBoard").style.visibility = "visible";
		document.getElementById("main").style.zIndex = 1;
	};

	const updateEditMoleculeOutput = () => {
		let model = selectedModel;
		// let parent = selectedModelParent._cfg.model;


		const currentSmiles = document.getElementById("editMoleculeSmiles").innerHTML;

		model.smiles = currentSmiles;

		globalContext.updateTreeData(graph.cfg.data);
		graph.read(graph.cfg.data);
		// console.log("graph", graph);
	}


	const reopenReviseMenu = () => {
		setReviseMenuCollapsed(false);
		setSideButtonVisibility("hidden");
		graph.changeSize(width * 0.7315, rowh * 18.9);
		graph.fitView();
		graph.render();
	}


	const displayReviseMenu = () => {

		G6.Util.traverseTree(graph.cfg.data,
			(innerNode) => {
				if ("reviseSelected" in innerNode
					&& innerNode.reviseSelected == true) {
					innerNode.reviseSelected = false
				}
			}
		);
		setReviseMenuCollapsed(false);
		setSideButtonVisibility("hidden");
		graph.changeSize(width * 0.7315, rowh * 18.9);
		graph.fitView();
		graph.render();
	}

	const applyAlternative = () => {
		setSideMenuCollapsed(true);
		setSideButtonVisibility("visible")
		graph.changeSize(width * 0.95, rowh * 18.9);
		graph.fitView();
		graph.render();
		setSideButtonVisibility("hidden");
	}

	const cancelAlternative = () => {
		setSideMenuCollapsed(true);
		setSideButtonVisibility("visible")
		graph.changeSize(width * 0.95, rowh * 18.9);
		if (previousGraph == null)
			return;
		globalContext.updateTreeData(previousGraph);
		graph.read(previousGraph);
	}

	const closeRevise = () => {

		setReviseMenuCollapsed(true);
		setSideButtonVisibility("visible")
		graph.changeSize(width * 0.95, rowh * 18.9);
		graph.fitView();
		graph.render();
	}

	const displayConstraintInputPanel = () => {
		setShowConstraintInput(true);
	}

	const displayWeightInputPanel = () => {
		setShowWeightInput(true);
	}


	const bindEvents = () => {



		graph.on('node:click', evt => {


			const { item, target } = evt;
			const targetType = target.get("type");
			const name = target.get("name");

			const model = item.getModel();
			selectedModel = model;
			selectedModelParent = item.get("parent");


			if ("reviseSelected" in model && model.reviseSelected) {
				model.reviseSelected = false;
			}


			if (name === "deleteButton") {

				setModelArr([<DeleteButtonModal model={model}
					graph={graph} setSideButtonVisibility={setSideButtonVisibility}
					setModelArr={setModelArr}
				/>]);

			}
			else if (name === "expandButton") {

				// console.log("selectedModel", selectedModel);

				setRouteList([]);
				if ("AIRoutes" in selectedModel) {

					setSideMenuCollapsed(false);
					setSideButtonVisibility("hidden")
					previousGraph = JSON.parse(JSON.stringify(graph.cfg.data));
					console.log("previousGraph", previousGraph);
					graph.changeSize(width * 0.7315, rowh * 18.9);
					graph.fitView();
					graph.render();

					let tempRouteList = [];
					let routeCount = 1;


					let tempAlternativeHighlightArr = [];
					for (let i = 0; i != selectedModel.AIRoutes.length; ++i) {
						if (i == selectedModel.AIRoutesIndex) {
							tempAlternativeHighlightArr.push(true);
							continue;
						}
						tempAlternativeHighlightArr.push(false);
					}
					setAlternativeHighlightArr(tempAlternativeHighlightArr);


					selectedModel.AIRoutes.forEach(
						route => {

							const id = 'selectedDropDownItem' + selectedModel.AIRoutes.indexOf(route);

							const DropdownItemComponent =
								<DropdownItem
									id={id}
									style={{ height: "60px", color: "black" }} size="lg">
									<div style={{
										fontFamily: "consolas",
										fontSize: "20px", justifyItems: "start",
										position: "relative", top: "10px",
									}}>
										<Text>Alternative {routeCount}</Text>

									</div>
								</DropdownItem>

							tempRouteList.push(
								<MenuItem style={{
									backgroundColor: selectedModel.AIRoutesIndex == selectedModel.AIRoutes.indexOf(route) ?
										"#e9ecef" : ""
								}} onClick={
									() => {

										document.getElementById("selectedDropDownItem" + selectedModel.AIRoutesIndex)
											.style.backgroundColor = "#f4f5f7";

										document.getElementById("selectedDropDownItem" + selectedModel.AIRoutes.indexOf(route))
											.style.backgroundColor = "#e9ecef";

										selectedRoute = route;

										selectedModel.AIRoutesIndex = selectedModel.AIRoutes.indexOf(route);
										setAlternativeHighlightArr([]);
										forceUpdate();

										selectedModel.children = [];
										selectedModel.children.push(selectedRoute);
										globalContext.updateTreeData(graph.cfg.data);
										graph.read(graph.cfg.data);

									}
								}
								>
									{DropdownItemComponent}

								</MenuItem>
							);
							routeCount += 1;
						}
					);
					// console.log("routeList", routeList);
					setRouteList(tempRouteList);
				}
			}
			else if (name === "deleteMolecule") {

				setModelArr([<DeleteMoleculeModal model={model}
					graph={graph} setSideButtonVisibility={setSideButtonVisibility}
					setModelArr={setModelArr}
				/>]);

			}
			else if (name === "editMolecule") {

				setModelArr([<EditMoleculeModal model={model}
					graph={graph} setSideButtonVisibility={setSideButtonVisibility}
					setModelArr={setModelArr}
				/>]);

			}
			else if (name === "container" || name === "molecule") {
				if ("isAvailable" in model && model.isAvailable == false)
					return;
				else {
					model.notAvailable = true;
					globalContext.updateTreeData(graph.cfg.data);
					graph.read(graph.cfg.data);
				}

			}


		})
	}



	const [oldGlobalContext, setOldGlobalContext] = useState({});


	// useEffect(() => {

	// 	if (oldGlobalContext.revisePromise != globalContext.revisePromise
	// 		&& globalContext.revisePromise.then) {
	// 		// console.log("reviseContext", globalContext.revisePromise);
	// 		globalContext.revisePromise
	// 			.then((response) =>
	// 				response.json())
	// 			.then((responseJson) => {
	// 				console.log("revise_response", responseJson);
	// 				globalContext.updateTreeData(responseJson);
	// 				graph.read(responseJson);

	// 				setReviseList([]);
	// 				let tempReviseList = [];
	// 				G6.Util.traverseTree(graph.cfg.data,
	// 					(node) => {
	// 						if ("rank" in node && node.rank > 0) {

	// 							const id = "selectedRoute" + node.rank;

	// 							tempReviseList.push(
	// 								[parseInt(node.rank),
	// 								<MenuItem
	// 									// style={{
	// 									// 	backgroundColor: node.reviseSelected ? "#e9ecef" : ""
	// 									// }}	
	// 									onClick={
	// 										(e) => {

	// 											if (previousReviseSelectedNode)
	// 												document.getElementById("selectedRoute" + previousReviseSelectedNode.rank)
	// 													.style.backgroundColor = "#f4f5f7";

	// 											document.getElementById("selectedRoute" + node.rank)
	// 												.style.backgroundColor = "#e9ecef";

	// 											previousReviseSelectedNode = node;

	// 											G6.Util.traverseTree(graph.cfg.data,
	// 												(innerNode) => {
	// 													if ("reviseSelected" in innerNode
	// 														&& innerNode.reviseSelected == true) {
	// 														innerNode.reviseSelected = false
	// 													}
	// 												}
	// 											);

	// 											node.reviseSelected = true;
	// 											globalContext.updateTreeData(graph.cfg.data);
	// 											graph.read(graph.cfg.data);
	// 										}
	// 									}
	// 								>

	// 									<DropdownItem
	// 										id={id}
	// 										style={{
	// 											height: "100px", color: "black",
	// 											padding: "0px"
	// 										}} size="lg">

	// 										<div style={{
	// 											fontFamily: "consolas",
	// 											fontSize: "20px", justifyItems: "start",
	// 											position: "relative", top: "10px", left: "10px"
	// 										}}>
	// 											<Text>Rank {node.rank} (Score: {node.SAW})</Text>

	// 										</div>

	// 										<div style={{
	// 											fontFamily: "consolas",
	// 											fontSize: "12px", justifyItems: "start",
	// 											position: "relative", top: "10px", left: "10px"
	// 										}}>
	// 											<Text>
	// 												<div>
	// 													<span>influence: {node.influence} </span>
	// 													<span>reaction confidence: {node.reactionConfidence} </span>
	// 												</div>
	// 												<div>
	// 													<span>complexity: {node.complexity} </span>
	// 													<span>convergence: {node.convergence}</span>
	// 												</div>
	// 												<div>
	// 													<span>associated subtree confidence: {
	// 														node.associatedSubtreeConfidence
	// 													}</span>
	// 												</div>

	// 											</Text>

	// 										</div>


	// 									</DropdownItem>

	// 								</MenuItem>
	// 								]
	// 							);
	// 						}
	// 					});
	// 				tempReviseList.sort();
	// 				let tempReviseList2 = [];
	// 				tempReviseList.forEach(([rank, component]) => {
	// 					tempReviseList2.push(component);
	// 				})
	// 				setReviseList(tempReviseList2);
	// 			})
	// 			.catch(err => {
	// 				console.log("fetching error")
	// 				console.log(err);
	// 			});
	// 	}

	// 	setOldGlobalContext(globalContext);
	// }, [globalContext])



	useEffect(() => {

		document.getElementById("drawBoardButton").addEventListener("click", exitDrawBoard);
		// document.getElementById("editMoleculeButton").addEventListener("click", exitEditMolecule);
		// document.getElementById("reviseButton").addEventListener("click", displayReviseMenu);
		document.getElementById("reviseButton").addEventListener("click", displayWeightInputPanel);
		document.getElementById("constraintButton").addEventListener("click", displayConstraintInputPanel);

		const data = globalContext.treeData;

		if (!graph) {

			graph = new G6.TreeGraph({
				container: ReactDOM.findDOMNode(ref.current),
				// width: graphWidth,
				// height: 670,
				modes: {
					default: [
						{
							type: 'tooltip',
							formatText(model) {
								if ("AIRoutes" in model) {
									const outputString = (model.AIRoutes.length + " AI generated routes"
										+ "<br/>(Alternative " + (model.AIRoutesIndex + 1) + " is currently displayed)");

									return outputString
								}
								else
									return "No AI generated routes"
							},
							shouldBegin(e) {
								const element = e.target;
								if (element.get("name") === "expandButton")
									return true;
								else
									return false;
							},
							offset: 10,
						},
						{
							type: 'tooltip',
							formatText(model) {
								return "Edit reaction"
							},
							shouldBegin(e) {
								const element = e.target;
								if (element.get("name") === "deleteButton")
									return true;
								else
									return false;
							},
							offset: 10,
						},
						{
							type: 'tooltip',
							formatText(model) {
								return "Edit the molecule"
							},
							shouldBegin(e) {
								const element = e.target;
								if (element.get("name") === "editMolecule")
									return true;
								else
									return false;
							},
							offset: 10,
						},
						{
							type: 'tooltip',
							formatText(model) {
								return "Delete the molecule"
							},
							shouldBegin(e) {
								const element = e.target;
								if (element.get("name") === "deleteMolecule")
									return true;
								else
									return false;
							},
							offset: 10,
						},
						{
							type: 'tooltip',
							formatText(model) {
								return "Mark the molecule as <br/> not usable/accessible";
							},
							shouldBegin(e) {

								const element = e.target;

								if (graph.cfg.data == e.item.getModel())
									return false;

								if (element.get("name") === "container" ||
									element.get("name") === "Image" ||
									// element.get("name") === "Text" ||
									element.get("name") === "molecule") {

									const model = e.item.getModel();
									if ("isAvailable" in model && model.isAvailable == false
										|| "notAvailable" in model && model.notAvailable) {
										return false;
									}
									else
										return true;
								}
								else
									return false;
							},
							offset: 10,
						},
						{
							type: 'tooltip',
							formatText(model) {

								if (model.failureCause) {
									const textLength = model.failureCause.length;
									let textArr = model.failureCause.split(" ");
									let returnText = "";

									let letterCount = 0;
									let passedHalf = false;
									textArr.forEach((text) => {
										if (letterCount >= textLength / 2 && passedHalf == false) {
											returnText = returnText.concat("<br/>");
											passedHalf = true;
										}
										returnText = returnText.concat(text, " ");
										letterCount += (text.length + 1);
									})

									return returnText;
								}


							},
							shouldBegin(e) {

								const element = e.target;
								if (element.get("name") === "container" ||
									element.get("name") === "Image" ||
									// element.get("name") === "Text" ||
									element.get("name") === "molecule") {

									const model = e.item.getModel();
									if (("isAvailable" in model && model.isAvailable == false
										|| "notAvailable" in model && model.notAvailable)
										&& "failureCause" in model) {
										// console.log("display");
										return true;
									}
									else
										return false;
								}
								else
									return false;
							},
							offset: 10,
						},
						"drag-canvas",
						"zoom-canvas"
					],
				},
				defaultEdge: {
					type: "retroTreeEdge",
					style: {
						// stroke: '#0f62fe',
						// startArrow: true,
						offset: 20
					}
				},
				// edgeStateStyles: {
				// 	reviseSelected: {
				// 		stroke: "yellow",
				// 		lineWidth: 1
				// 	}
				// },
				defaultNode: {
					type: "retroTreeNode",
					labelCfg: {
						style: {
							fill: 'red',
							fontSize: 10
						}
					},
					style: {
						stroke: '#72CC4A',
						width: 150
					}
				},
				layout: {
					type: 'compactBox', // 布局类型
					direction: 'TB',    // 自左至右布局，可选的有 H / V / LR / RL / TB / BT
					nodeSep: 250,      // 节点之间间距
					rankSep: 160,      // 每个层级之间的间距
					getHGap: (d) => {
						return 100;
					},
					getVGap: (d) => {
						return 100;
					}
				},
				fitView: true,
				renderer: "canvas",
				autoPaint: true,
				animate: false
			})
		}

		bindEvents();


		globalContext.updateTreeGraph(graph);
		graph.data(data);
		graph.render();

	}, [])

	// const handleChangeData = () => {
	// 	const node = graph.findById('SubTreeNode1')
	// 	graph.updateItem(node, {
	// 		label: 'xxx',
	// 		style: {
	// 			fill: 'red'
	// 		}
	// 	})
	// }


	return (
		<div style={{ width: width * 0.95, height: rowh * 18.9, position: "relative", left: "2.5%" }} ref={ref}>
			{/* <button onClick={updateData}>update data</button> */}

			<ProSidebar style={{
				position: "absolute", left: "80%", top: "0%",
				height: rowh * 21,
				// transform: "translate(0, -10%)"
			}}
				collapsed={sideMenuCollapsed}
			>
				<SidebarHeader>
					<Row>
						<div style={{
							height: "60px", fontSize: "22px", display: "flex",
							alignContent: "center", alignItems: "center", marginLeft: "40px",
							color: "black"
						}}>
							AI Generated Route
						</div>
					</Row>


				</SidebarHeader>
				<SidebarContent>
					<Menu>
						<ScrollView style={styles.scrollView}>
							{routeList}
						</ScrollView>

					</Menu>
				</SidebarContent>

				<SidebarFooter>

					<Button variant='contained' size='large' onClick={cancelAlternative}
						style={{ height: "60px", width: "50%", backgroundColor: "grey" }}
					>Cancel
					</Button>
					<Button variant='contained' size='large' onClick={applyAlternative}
						style={{ height: "60px", width: "50%" }}
					>Apply
					</Button>


				</SidebarFooter>
			</ProSidebar>

			<ProSidebar id="reviseSideBar" style={{
				position: "absolute", left: "80%", top: "0%",
				height: rowh * 21,
				// transform: "translate(0, -10%)"
				margin: "0",
				padding: "0",
			}}
				collapsed={reviseMenuCollapsed}
			>
				<SidebarHeader>
					<Row>
						<div style={{
							height: "60px", fontSize: "22px", display: "flex",
							alignContent: "center", alignItems: "center", marginLeft: "20px",
							color: "black"
						}}>
							Recommended Revise Step
						</div>
						<div style={{
							height: "60px", fontSize: "22px", display: "flex",
							alignContent: "center", alignItems: "center"
						}}>
							<NoMaxWidthTooltip
								title={
									<React.Fragment>
										<div id="criteriaTooltip" style={{
											display: "flex", flexDirection: "column",
											fontSize: "15px", flexWrap: "nowrap"
										}}>
											<div><b>Influence:</b>  the number of molecules affected by revising the step</div>
											<div style={{ height: "7px" }}></div>
											<div><b>Reaction confidence:</b> the confidence in the step of disconnection</div>
											<div style={{ height: "7px" }}></div>
											<div><b>Complexity:</b>  the reduction of the complexity of the step's reactants compared to its product</div>
											<div style={{ height: "7px" }}></div>
											<div><b>Convergence:</b> the number of reactants in the step and their relative sizes</div>
											<div style={{ height: "7px" }}></div>
											<div><b>Associated subtree confidence:</b> the confidence in the associated subtrees in the step <br />
												other than the subtree containing the molecule(s) that are not able to find a retrosynthetic <br />
												route by AI or not usable/accessible</div>
										</div>
									</React.Fragment>
								}>
								<IconButton>
									<InfoIcon />
								</IconButton>
							</NoMaxWidthTooltip>
						</div>
					</Row>


				</SidebarHeader>
				<SidebarContent>
					<Menu style={{
						margin: "0",
						padding: "0",
					}}>
						<ScrollView style={styles.scrollView}>
							{reviseList}
						</ScrollView>

					</Menu>
				</SidebarContent>
				<SidebarFooter>
					<Button variant='contained' size='large' onClick={closeRevise}
						style={{ height: "60px", width: "100%", backgroundColor: "grey" }}
					>Close
					</Button>
				</SidebarFooter>

			</ProSidebar>

			<Box style={{
				position: "absolute", top: "40%", left: "99%", width: 150,
				margin: "0px", padding: "0px"
			}} visibility={sideButtonVisibility}>
				<Fab
					onClick={reopenReviseMenu}
				// variant="extended"
				// style={{ height: 150, display: "flex", flexDirection: "column",
				// 	alignItems: "center", margin: "0px", paddingLeft: "10px", paddingRight: "20px"}}
				>

					<MenuOpenIcon sx={{ mr: 1 }} />
					{/* <Text>Revise</Text>
						<Text>List</Text> */}
				</Fab>
			</Box>
			{modalArr}


			<Modal id="modal" show={showConstraintInput} centered size="lg">
				<div style={{ textAlign: "center", paddingTop: "10px", fontSize: "25px" }}>
					Constraints for AI RetroSynthetic Route Planning
				</div>

				<div style={{ margin: "40px", marginTop: "20px" }}>
					<EmbedConstraintInputPanel updateConstraintFromPanel={updateConstraintFromPanel}
						currentConstraints={stateRef.current} />

				</div>

				<div>

					<Button style={{ width: "50%" }}
						onClick={() => {
							setShowConstraintInput(false);
						}}>
						cancel
					</Button>

					<Button onClick={
						() => {
							updateSavedConstraints(constraints);
							setShowConstraintInput(false);

							console.log("currentConstraints", constraints);

							fetch(globalContext.serverIp.concat("reconfigureConstraints"), {
								method: "POST",
								headers: {
									"Accept": "application/json",
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									graph: graph.cfg.data,
									constraints: constraints
								})
							}).then((response) =>
								response.json())
								.then((responseJson) => {
									console.log("reconfigureConstraints_response", responseJson);
									globalContext.updateTreeData(responseJson);
									graph.read(responseJson);
								})
								.catch(err => {
									console.log("fetching error")
									console.log(err);
								});
						}
					}
						style={{ width: "50%" }}
					>
						confirm
					</Button>
				</div>
			</Modal>


			<Modal id="modal" show={showWeightInput} centered size="lg">
				<div style={{ textAlign: "center", paddingTop: "10px", fontSize: "25px" }}>
					Adjust Criteria Weighting
				</div>

				<div style={{ margin: "40px", marginTop: "20px" }}>
					<WeightInputPanel updateWeightFromPanel={updateWeightFromPanel}
						currentWeights={weightRef.current}
					/>
				</div>

				<div>

					<Button style={{ width: "50%" }}
						onClick={() => {
							setShowWeightInput(false);
						}}>
						cancel
					</Button>

					<Button onClick={
						() => {
							updateSavedWeights(weights);
							setShowWeightInput(false);

							displayReviseMenu();

							console.log("currentWeight", weights);

							fetch(globalContext.serverIp.concat("revise"), {
								method: "POST",
								headers: {
									"Accept": "application/json",
									"Content-Type": "application/json"
								},
								body: JSON.stringify(graph.cfg.data)
							})
								.then((response) =>
									response.json())
								.then((responseJson) => {
									console.log("revise_response", responseJson);
									globalContext.updateTreeData(responseJson);
									graph.read(responseJson);

									setReviseList([]);
									let tempReviseList = [];
									G6.Util.traverseTree(graph.cfg.data,
										(node) => {
											if ("rank" in node && node.rank > 0) {

												const id = "selectedRoute" + node.rank;

												tempReviseList.push(
													[parseInt(node.rank),
													<MenuItem
														// style={{
														// 	backgroundColor: node.reviseSelected ? "#e9ecef" : ""
														// }}	
														onClick={
															(e) => {

																if (previousReviseSelectedNode)
																	document.getElementById("selectedRoute" + previousReviseSelectedNode.rank)
																		.style.backgroundColor = "#f4f5f7";

																document.getElementById("selectedRoute" + node.rank)
																	.style.backgroundColor = "#e9ecef";

																previousReviseSelectedNode = node;

																G6.Util.traverseTree(graph.cfg.data,
																	(innerNode) => {
																		if ("reviseSelected" in innerNode
																			&& innerNode.reviseSelected == true) {
																			innerNode.reviseSelected = false
																		}
																	}
																);

																node.reviseSelected = true;
																globalContext.updateTreeData(graph.cfg.data);
																graph.read(graph.cfg.data);
															}
														}
													>

														<DropdownItem
															id={id}
															style={{
																height: "100px", color: "black",
																padding: "0px"
															}} size="lg">

															<div style={{
																fontFamily: "consolas",
																fontSize: "20px", justifyItems: "start",
																position: "relative", top: "10px", left: "10px"
															}}>
																<Text>Rank {node.rank} (Score: {node.SAW})</Text>

															</div>

															<div style={{
																fontFamily: "consolas",
																fontSize: "12px", justifyItems: "start",
																position: "relative", top: "10px", left: "10px"
															}}>
																<Text>
																	<div>
																		<span>influence: {node.influence} </span>
																		<span>reaction confidence: {node.reactionConfidence} </span>
																	</div>
																	<div>
																		<span>complexity: {node.complexity} </span>
																		<span>convergence: {node.convergence}</span>
																	</div>
																	<div>
																		<span>associated subtree confidence: {
																			node.associatedSubtreeConfidence
																		}</span>
																	</div>

																</Text>

															</div>


														</DropdownItem>

													</MenuItem>
													]
												);
											}
										});
									tempReviseList.sort();
									let tempReviseList2 = [];
									tempReviseList.forEach(([rank, component]) => {
										tempReviseList2.push(component);
									})
									setReviseList(tempReviseList2);
								})
								.catch(err => {
									console.log("fetching error")
									console.log(err);
								});
						}
					}
						style={{ width: "50%" }}
					>
						confirm
					</Button>
				</div>
			</Modal>

		</div>
	);
}


const styles = StyleSheet.create({
	container: {
	},
	scrollView: {
		maxHeight: "635px"
	},
});


export { RetroTree };



