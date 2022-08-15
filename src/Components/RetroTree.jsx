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
import { Box, Button, CircularProgress } from "@mui/material";

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
import { FailureSmilesModal } from './FailureSmilesModal';
import LoadingButton from '@mui/lab/LoadingButton';



let graph = null

let selectedModel = null;
let selectedModelParent = null;
let selectedRoute = null;
let previousGraph = null;
let previousClick = "";
let moleculePreviousClick = "";

let previousReviseSelectedNode = null;
let comboCount = -1;

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
	const [moleculeList, setMoleculeList] = useState([]);
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
	const [showLoading, setShowLoading] = useState(false);
	const [loadingText, setLoadingText] = useState("");

	const [openCandidateMenu, setOpenCandidateMenu] = useState(false);
	const [openMoleculeMenu, setOpenMoleculeMenu] = useState(false);


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
		setTimeout(updateDrawBoardOutput, 1000);
	}

	const updateDrawBoardOutput = () => {

		let model = selectedModel;
		const currentSmiles = document.getElementById("smiles").innerHTML;
		// console.log("disconnection", document.getElementById("smiles").innerHTML);
		const smilesArr = currentSmiles.split(".");


		window
			.initRDKitModule()
			.then(function (RDKit) {

				let failureSmiles = "";

				smilesArr.forEach(smiles => {
					var mol = RDKit.get_mol(smiles);
					if (mol.is_valid() == false)
						failureSmiles = smiles
				})

				if (failureSmiles !== "") {

					setModelArr([<FailureSmilesModal model={model}
						graph={graph} setSideButtonVisibility={setSideButtonVisibility}
						setModelArr={setModelArr} failureSmiles={failureSmiles}
						currentSmiles={currentSmiles}
					/>]);
				}
				else {

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

					setShowLoading(true);
					setLoadingText("Analysing Reactants");

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
							setShowLoading(false);
							console.log("checkRXN_response", responseJson);
							globalContext.updateTreeData(responseJson);
							graph.read(responseJson);
						})
						.catch(err => {
							console.log("fetching error")
							console.log(err);
						});
				}


			})
			.catch((e) => {
				console.log("render error", e);
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
		graph.changeSize(width * 0.705, rowh * 18.9);
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
		graph.changeSize(width * 0.705, rowh * 18.9);
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
			console.log("node clicked", model);
			selectedModel = model;
			selectedModelParent = item.get("parent");


			if ("reviseSelected" in model && model.reviseSelected) {
				model.reviseSelected = false;
			}


			if (name === "deleteButton") {

				if ("children" in model && model.children != null && model.children.length != 0)
					setModelArr([<DeleteButtonModal model={model}
						graph={graph} setSideButtonVisibility={setSideButtonVisibility}
						setModelArr={setModelArr}
					/>]);
				else {
					if (model.children) {
						graph.updateChildren([], model.id);
						globalContext.updateTreeData(graph.cfg.data);
						graph.render();

						model.children = []
					}

					if ("handledByAI" in model && model.handledByAI == true)
						model.handledByAI = false;

					if ("AIFailed" in model && model.AIFailed == true)
						model.AIFailed = false;

					document.getElementById("drawBoardText").innerHTML = "Please edit the reaction."
					document.getElementById("drawBoardButton").innerHTML = "Save changes"
					document.getElementById("drawBoardButton").style.width = "200px";
					document.getElementById("drawBoardButton").style.left = "80%";
					// document.getElementById('ifKetcher').contentWindow.ketcher.setMolecule(model.smiles);
					window.ketcher.setMolecule(model.smiles);
					document.getElementById("drawBoard").style.visibility = "visible";
					document.getElementById("drawBoard").style.zIndex = 2;
					document.getElementById("main").style.zIndex = -1;
				}

			}
			else if (name === "expandButton") {

				// console.log("selectedModel", selectedModel);

				setRouteList([]);
				if ("AIRoutes" in selectedModel && "handledByAI" in selectedModel
					&& selectedModel.handledByAI == true) {

					setSideMenuCollapsed(false);
					setSideButtonVisibility("hidden")
					previousGraph = JSON.parse(JSON.stringify(graph.cfg.data));
					console.log("previousGraph", previousGraph);
					graph.changeSize(width * 0.705, rowh * 18.9);
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
							console.log("route", route);
							const DropdownItemComponent =
								<DropdownItem
									id={id}
									style={{ height: "80px", color: "black" }} size="lg">
									<div style={{
										fontFamily: "Roboto",
										fontSize: "20px", justifyItems: "start",
										position: "relative", top: "10px",
									}}>
										<Text>Alternative {routeCount}</Text>

									</div>

									<div style={{
										fontFamily: "Roboto",
										fontSize: "12px", justifyItems: "start",
										position: "relative", top: "10px"
									}}>
										<Text>
											<div>
												<span>Confidence: {route.confidence}  </span>
											</div>
										</Text>

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
										if ("children" in selectedRoute) {
											selectedRoute.children.forEach(child => {
												selectedModel.children.push(child)
											})
										}
										selectedModel.confidence = route.confidence;
										// selectedModel.children.push(selectedRoute);
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
								if ("handledByAI" in model && model.handledByAI == true &&
									"AIRoutes" in model && model.AIRoutes.length != 0) {
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

								return false;

								// const element = e.target;
								// if (element.get("name") === "container" ||
								// 	element.get("name") === "Image" ||
								// 	// element.get("name") === "Text" ||
								// 	element.get("name") === "molecule") {

								// 	const model = e.item.getModel();
								// 	if (("isAvailable" in model && model.isAvailable == false
								// 		|| "notAvailable" in model && model.notAvailable)
								// 		&& "failureCause" in model) {
								// 		// console.log("display");
								// 		return true;
								// 	}
								// 	else
								// 		return false;
								// }
								// else
								// 	return false;
							},
							offset: 10,
						},
						{
							type: "zoom-canvas",
							minZoom: 0.0001
						},
						{
							type: "drag-canvas"
						}
					],
				},
				defaultEdge: {
					type: "retroTreeEdge",
					style: {
						// stroke: '#0f62fe',
						// startArrow: true,
						offset: 25
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
		graph.setMinZoom(0.0001);

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
				position: "absolute", left: "77%", top: "0%",
				height: rowh * 21,
				// transform: "translate(0, -10%)"
			}}
				collapsed={sideMenuCollapsed}
			>
				<SidebarHeader>
					<Row>
						<div style={{
							height: rowh * 2, fontSize: "22px", display: "flex",
							alignContent: "center", alignItems: "center", marginLeft: "40px",
							color: "black"
						}}>
							AI Generated Route
						</div>
					</Row>


				</SidebarHeader>
				<SidebarContent>
					<Menu>
						<ScrollView style={styles.routeView}>
							{routeList}
						</ScrollView>

					</Menu>
				</SidebarContent>

				<SidebarFooter>

					<Button variant='contained' size='large' onClick={cancelAlternative}
						style={{ height: rowh * 2, width: "50%", backgroundColor: "grey" }}
					>Cancel
					</Button>
					<Button variant='contained' size='large' onClick={applyAlternative}
						style={{ height: rowh * 2, width: "50%" }}
					>Apply
					</Button>


				</SidebarFooter>
			</ProSidebar>

			<ProSidebar id="reviseSideBar" style={{
				position: "absolute", left: "77%", top: "0%",
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
							height: rowh * 2, fontSize: "22px", display: "flex",
							alignContent: "center", alignItems: "center", marginLeft: "20px",
							color: "black", fontFamily: "Roboto"
						}}>
							Recommended Revision
						</div>
						<div style={{
							height: rowh * 2, fontSize: "22px", display: "flex",
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
					}}
						iconShape="square">
						<SubMenu title={
							<div style={{
								height: rowh * 1.3, color: "black",
								padding: "0px"
							}}>
								<div style={{
									fontFamily: "Roboto",
									fontSize: "20px", justifyItems: "start",
									position: "relative", top: "10px", left: "15px"
								}}>
									Revision for All Failed Moelcule
								</div>
							</div>
						}
							open={openCandidateMenu}
							onOpenChange={
								(e) => {
									if (openCandidateMenu)
										setOpenCandidateMenu(false);
									else {
										setOpenMoleculeMenu(false);
										setOpenCandidateMenu(true);
									}
								}
							}
						>
							<ScrollView style={styles.scrollView}>
								{reviseList}
							</ScrollView>
						</SubMenu>
						<SubMenu title={
							<div style={{
								height: rowh * 1.3, color: "black",
								padding: "0px"
							}}>
								<div style={{
									fontFamily: "Roboto",
									fontSize: "20px", justifyItems: "start",
									position: "relative", top: "10px", left: "15px"
								}}>
									Revision for Each Failed Molecule
								</div>
							</div>
						}
							open={openMoleculeMenu}
							onOpenChange={
								(e) => {
									if (openMoleculeMenu)
										setOpenMoleculeMenu(false);
									else {
										setOpenCandidateMenu(false);
										setOpenMoleculeMenu(true);
									}
								}
							}
						>
							<ScrollView style={styles.scrollView}>
								{moleculeList}
							</ScrollView>
						</SubMenu>

					</Menu>
				</SidebarContent>
				<SidebarFooter>
					<Button variant='contained' size='large' onClick={closeRevise}
						style={{ height: rowh * 2, width: "100%", backgroundColor: "grey" }}
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
				<div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
					<div style={{ textAlign: "center", paddingTop: "10px", fontSize: "25px" }}>
						Constraints for AI RetroSynthetic Route Planning
					</div>
					<div style={{
						height: rowh * 2, fontSize: "22px", display: "flex",
						alignContent: "center", alignItems: "center"
					}}>
						<NoMaxWidthTooltip
							title={
								<React.Fragment>
									<div id="criteriaTooltip" style={{
										display: "flex", flexDirection: "column",
										fontSize: "15px", flexWrap: "nowrap"
									}}>
										<div><b>Price Threshold:</b>  maximum price in USD per g/ml of commercially available <br />compounds that will be considered available precursors for the retrosynthesis. <br />Defaults to no price threshold</div>
										<div style={{ height: "7px" }}></div>
										<div><b>Maximum Steps:</b> maximum number of retrosynthetic steps <br /> Defaults to 15 steps</div>
										<div style={{ height: "7px" }}></div>
										<div><b>Exclude Substructure(s):</b>  SMILES of substructures to exclude from precursors <br />Defaults to None, a.k.a., no excluded substructures. </div>
										<div style={{ height: "7px" }}></div>
										<div><b>Exclude Molecule(s):</b>  SMILES of molecules to exclude from the set of precursors. <br />Defaults to None, a.k.a., no excluded molecules. </div>
									</div>
								</React.Fragment>
							}>
							<IconButton>
								<InfoIcon />
							</IconButton>
						</NoMaxWidthTooltip>
					</div>
				</div>
				<div style={{ textAlign: "center", paddingTop: "0px", fontSize: "15px" }}>
					Unselect constraints to apply NO constraints
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

							setShowLoading(true);
							setLoadingText("Rerun AI Route Planning")

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
									setShowLoading(false);
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

				{/* <div style={{ textAlign: "center", paddingTop: "10px", fontSize: "25px" }}>
					Adjust Criteria Weighting
				</div> */}


				<div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
					<div style={{ textAlign: "center", paddingTop: "10px", fontSize: "25px" }}>
						Adjust Criteria Weighting
					</div>
					<div style={{
						height: rowh * 2, fontSize: "22px", display: "flex",
						alignContent: "center", alignItems: "center"
					}}>
						<NoMaxWidthTooltip
							title={
								<React.Fragment>
									<div id="criteriaTooltip" style={{
										display: "flex", flexDirection: "column",
										fontSize: "15px", flexWrap: "nowrap"
									}}>
										<div style={{ height: "30px", textAlign: "center", fontSize: "17px" }}>
											<b>Unselect all weights to assign equal weights to each criteria</b>
										</div>
										<div style={{ height: "14px" }}></div>
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
				</div>
				<div style={{ textAlign: "center", padding: "0px", fontSize: "15px" }}>
					Unselect all criteria to apply equal weighting
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
							setReviseList([]);

							setShowLoading(true);
							setLoadingText("Analysing Revise Steps");

							previousReviseSelectedNode = null;


							G6.Util.traverseTree(graph.cfg.data,
								(innerNode) => {
									if ("failureNodeSelected" in innerNode
										&& innerNode.failureNodeSelected == true) {
										innerNode.failureNodeSelected = false;
									}
								}
							);

							setOpenCandidateMenu(false);
							setOpenMoleculeMenu(false);


							console.log("currentWeight", weights);

							fetch(globalContext.serverIp.concat("revise"), {
								method: "POST",
								headers: {
									"Accept": "application/json",
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									graph: graph.cfg.data,
									weights: weights
								})
							})
								.then((response) =>
									response.json())
								.then((responseJson) => {

									setShowLoading(false);

									console.log("revise_response", responseJson);
									let responseGraph = responseJson.graph;
									let comboSawArr = responseJson.comboSawArr;
									comboCount = comboSawArr.length;
									globalContext.updateTreeData(responseGraph);
									graph.read(responseGraph);

									setReviseList([]);
									let tempReviseList = [];
									let comboRank = 1;
									comboSawArr.forEach(comboSaw => {
										let comboArr = comboSaw.combo;
										let comboSawScore = comboSaw.SAW;

										const comboId = "selectedCombo" + comboRank;

										let submenuTitle =
											<div style={{
												height: "50px", color: "black",
												padding: "0px"
											}}>
												<div className="comboSubMenu" style={{
													fontFamily: "Roboto",
													fontSize: "20px", justifyItems: "start",
													position: "relative", top: "10px", left: "30px"
												}}
												>
													Option {comboRank} (Score: {comboSawScore.toFixed(3)})
												</div>
											</div>


										let reviseStepList = []
										let nodeCount = 1;
										comboArr.forEach(
											nodeId => {
												let node = graph.findById(nodeId).get("model");

												const id = comboId + "selectedRoute" + nodeCount;

												let firstRow = [];
												let secondRow = [];
												let thirdRow = [];
												if (weightRef.current.influence == null &&
													weightRef.current.complexity == null &&
													weightRef.current.convergence == null &&
													weightRef.current.reactionConfidence == null &&
													weightRef.current.associatedSubtreeConfidence == null) {
													firstRow.push(<span>influence: {node.normalizedInfluence.toFixed(3)} </span>);
													firstRow.push(<span>{'\u00A0'}{'\u00A0'}reaction confidence: {node.reactionConfidence.toFixed(3)} </span>);
													secondRow.push(<span>complexity: {node.complexity.toFixed(3)} </span>);
													secondRow.push(<span>{'\u00A0'}{'\u00A0'}convergence: {node.convergence.toFixed(3)}</span>);
													thirdRow.push(<span>associated subtree confidence: {
														node.associatedSubtreeConfidence.toFixed(3)
													}</span>);
												}
												else {
													if (weightRef.current.influence != null)
														firstRow.push(<span>influence: {node.normalizedInfluence.toFixed(3)} </span>);
													if (weightRef.current.reactionConfidence != null)
														firstRow.push(<span>reaction confidence: {node.reactionConfidence.toFixed(3)} </span>);
													if (weightRef.current.complexity != null)
														secondRow.push(<span>complexity: {node.complexity.toFixed(3)} </span>);
													if (weightRef.current.convergence != null)
														secondRow.push(<span>convergence: {node.convergence.toFixed(3)}</span>);
													if (weightRef.current.associatedSubtreeConfidence != null)
														thirdRow.push(<span>associated subtree confidence: {
															node.associatedSubtreeConfidence.toFixed(3)
														}</span>);
												}


												reviseStepList.push(
													<MenuItem
														onClick={
															(e) => {

																let failureNodeIndex = 1;
																let nodeIndex = 1;
																while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {

																	document.getElementById("failureNode" + failureNodeIndex)
																		.style.backgroundColor = "inherit";

																	while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {
																		document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex)
																			.style.backgroundColor = "inherit";

																		nodeIndex += 1;
																	}
																	failureNodeIndex += 1;
																	nodeIndex = 1;
																}


																G6.Util.traverseTree(graph.cfg.data,
																	(innerNode) => {
																		if ("failureNodeSelected" in innerNode
																			&& innerNode.failureNodeSelected == true) {
																			innerNode.failureNodeSelected = false;
																		}
																	}
																);

																for (let i = 0; i != comboCount; ++i) {
																	let count = 1;
																	while (document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count) != null) {
																		document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count)
																			.style.backgroundColor = "inherit";

																		count += 1;
																	}
																}

																// console.log("selectedRoute", document.getElementById("selectedRoute" + node.rank));
																// console.log("id", comboId + "selectedRoute" + nodeCount);
																// if(document.getElementById(comboId + "selectedRoute" + nodeCount) != null)
																// 	document.getElementById(comboId + "selectedRoute" + nodeCount)
																// 		.style.backgroundColor = "#e9ecef";

																document.getElementById(id).style.backgroundColor = "#d7d5d5";


																G6.Util.traverseTree(graph.cfg.data,
																	(innerNode) => {
																		if ("reviseSelected" in innerNode
																			&& innerNode.reviseSelected == true) {
																			innerNode.reviseSelected = false;
																		}
																	}
																);

																node.reviseSelected = true;
																globalContext.updateTreeData(graph.cfg.data);
																graph.read(graph.cfg.data);

																previousClick = "node";
															}
														}
													>

														<DropdownItem
															id={id}
															style={{
																height: "100px", color: "black",
																padding: "0px", backgroundColor: "inherit",
															}} size="lg">
															<div style={{ position: "relative", left: "30px" }}>

																<div style={{
																	fontFamily: "Roboto",
																	fontSize: "20px", justifyItems: "start",
																	position: "relative", top: "10px", left: "10px"
																}}>
																	<Text>Reaction {nodeCount} (Score: {node.SAW.toFixed(3)})</Text>

																</div>

																<div style={{
																	fontFamily: "Roboto",
																	fontSize: "12px", justifyItems: "start",
																	position: "relative", top: "10px", left: "10px"
																}}>
																	<Text>
																		<div>
																			{firstRow}
																		</div>
																		<div>
																			{secondRow}
																		</div>
																		<div>
																			{thirdRow}
																		</div>

																	</Text>

																</div>

															</div>
														</DropdownItem>

													</MenuItem>
												);

												nodeCount += 1;
											}
										);

										tempReviseList.push(
											[parseFloat(comboSawScore),
											<SubMenu
												id={comboId}
												className={"combo"}
												title={submenuTitle}
												onClick={(e) => {

													let failureNodeIndex = 1;
													let nodeIndex = 1;
													while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {

														document.getElementById("failureNode" + failureNodeIndex)
															.style.backgroundColor = "inherit";

														while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {
															document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex)
																.style.backgroundColor = "inherit";

															nodeIndex += 1;
														}
														failureNodeIndex += 1;
														nodeIndex = 1;
													}

													G6.Util.traverseTree(graph.cfg.data,
														(innerNode) => {
															if ("failureNodeSelected" in innerNode
																&& innerNode.failureNodeSelected == true) {
																innerNode.failureNodeSelected = false;
															}
														}
													);

													for (let i = 0; i != comboCount; ++i) {
														document.getElementById("selectedCombo" + (i + 1))
															.style.backgroundColor = "#f4f5f7";
													}


													document.getElementById(comboId)
														.style.backgroundColor = "#e9ecef";


													if (previousClick !== "node") {

														for (let i = 0; i != comboCount; ++i) {
															let count = 1;
															while (document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count) != null) {
																document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count)
																	.style.backgroundColor = "inherit";

																count += 1;
															}
														}

														G6.Util.traverseTree(graph.cfg.data,
															(innerNode) => {
																if ("reviseSelected" in innerNode
																	&& innerNode.reviseSelected == true) {
																	innerNode.reviseSelected = false
																}
															}
														);

														comboArr.forEach(
															nodeId => {
																let node = graph.findById(nodeId).get("model");
																node.reviseSelected = true;
															}
														);

														// node.reviseSelected = true;
														globalContext.updateTreeData(graph.cfg.data);
														graph.read(graph.cfg.data);
													}

													previousClick = "combo";
												}}
											>
												{reviseStepList}
											</SubMenu>
											]
										);

										comboRank += 1;
									});

									// tempReviseList.sort();
									let tempReviseList2 = [];
									tempReviseList.forEach(([rank, component]) => {
										tempReviseList2.push(component);
									});
									setReviseList(tempReviseList2);




									// console.log("graph", graph);
									setMoleculeList([]);
									let tempMoleculeList = [];
									let failureNodeCount = 1;
									G6.Util.traverseTree(graph.cfg.data,
										(failureNode) => {
											if (("isAvailable" in failureNode && !failureNode.isAvailable)
												|| ("notAvailable" in failureNode && failureNode.notAvailable)) {

												const failureNodeId = "failureNode" + failureNodeCount


												let sawStatusArr = [];
												let sawNode = graph.findById(failureNode.id).get("parent");
												while (sawNode != null) {

													let node = sawNode.get("model");
													if ("candidate" in node && node.candidate) {
														sawStatusArr.push([node.SAW.toFixed(3), {
															saw: node.SAW.toFixed(3),
															visited: false
														}]);
													}
													sawNode = sawNode.get("parent");
												}
												sawStatusArr.sort();
												let sawStatusArr2 = []
												sawStatusArr.forEach(([index, saw]) => {
													sawStatusArr2.push(saw);
												});
												sawStatusArr = sawStatusArr2;

												console.log("sawStatusArr", sawStatusArr);


												let moleculeCandidateList = [];
												let candidateNode = graph.findById(failureNode.id).get("parent");
												let nodeCount = 1;
												while (candidateNode != null) {

													let node = candidateNode.get("model");
													if ("candidate" in node && node.candidate) {

														console.log("nodeCount", nodeCount);
														const id = failureNodeId + "selectedRoute" + nodeCount;

														let reactionIndex = 0;
														for (; reactionIndex != sawStatusArr.length; ++reactionIndex) {
															if (node.SAW.toFixed(3) == sawStatusArr[reactionIndex].saw
																&& sawStatusArr[reactionIndex].visited == false) {

																sawStatusArr[reactionIndex].visited = true;
																break;
															}
														}
														console.log("saw", node.SAW.toFixed(3));
														console.log("reactionIndex", reactionIndex);

														let firstRow = [];
														let secondRow = [];
														let thirdRow = [];
														if (weightRef.current.influence == null &&
															weightRef.current.complexity == null &&
															weightRef.current.convergence == null &&
															weightRef.current.reactionConfidence == null &&
															weightRef.current.associatedSubtreeConfidence == null) {
															firstRow.push(<span>influence: {node.normalizedInfluence.toFixed(3)} </span>);
															firstRow.push(<span>{'\u00A0'}{'\u00A0'}reaction confidence: {node.reactionConfidence.toFixed(3)} </span>);
															secondRow.push(<span>complexity: {node.complexity.toFixed(3)} </span>);
															secondRow.push(<span>{'\u00A0'}{'\u00A0'}convergence: {node.convergence.toFixed(3)}</span>);
															thirdRow.push(<span>associated subtree confidence: {
																node.associatedSubtreeConfidence.toFixed(3)
															}</span>);
														}
														else {
															if (weightRef.current.influence != null)
																firstRow.push(<span>influence: {node.normalizedInfluence.toFixed(3)} </span>);
															if (weightRef.current.reactionConfidence != null)
																firstRow.push(<span>reaction confidence: {node.reactionConfidence.toFixed(3)} </span>);
															if (weightRef.current.complexity != null)
																secondRow.push(<span>complexity: {node.complexity.toFixed(3)} </span>);
															if (weightRef.current.convergence != null)
																secondRow.push(<span>convergence: {node.convergence.toFixed(3)}</span>);
															if (weightRef.current.associatedSubtreeConfidence != null)
																thirdRow.push(<span>associated subtree confidence: {
																	node.associatedSubtreeConfidence.toFixed(3)
																}</span>);
														}


														moleculeCandidateList.push([
															node.SAW.toFixed(3),
															<MenuItem
																onClick={
																	(e) => {

																		for (let i = 0; i != comboCount; ++i) {

																			document.getElementById("selectedCombo" + (i + 1))
																				.style.backgroundColor = "inherit";

																			let count = 1;
																			while (document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count) != null) {
																				document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count)
																					.style.backgroundColor = "inherit";

																				count += 1;
																			}
																		}
																		<div style={{ textAlign: "center", paddingTop: "0px", fontSize: "15px" }}>
																			Unselect constraints to apply NO constraint
																		</div>

																		let failureNodeIndex = 1;
																		let nodeIndex = 1;
																		while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {

																			document.getElementById("failureNode" + failureNodeIndex)
																				.style.backgroundColor = "inherit";

																			while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {
																				document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex)
																					.style.backgroundColor = "inherit";

																				nodeIndex += 1;
																			}
																			failureNodeIndex += 1;
																			nodeIndex = 1;
																		}

																		document.getElementById(id).style.backgroundColor = "#d7d5d5";


																		G6.Util.traverseTree(graph.cfg.data,
																			(innerNode) => {
																				if ("reviseSelected" in innerNode
																					&& innerNode.reviseSelected == true) {
																					innerNode.reviseSelected = false;
																				}
																			}
																		);

																		node.reviseSelected = true;
																		globalContext.updateTreeData(graph.cfg.data);
																		graph.read(graph.cfg.data);

																		moleculePreviousClick = "node";
																	}
																}
															>

																<DropdownItem
																	id={id}
																	style={{
																		height: "100px", color: "black",
																		padding: "0px", backgroundColor: "inherit"
																	}} size="lg">
																	<div style={{position: "relative", left: "30px"}}>

																		<div style={{
																			fontFamily: "Roboto",
																			fontSize: "20px", justifyItems: "start",
																			position: "relative", top: "10px", left: "10px"
																		}}>
																			<Text>Reaction {reactionIndex + 1} (Score: {node.SAW.toFixed(3)})</Text>

																		</div>

																		<div style={{
																			fontFamily: "Roboto",
																			fontSize: "12px", justifyItems: "start",
																			position: "relative", top: "10px", left: "10px"
																		}}>
																			<Text>
																				<div>
																					{firstRow}
																				</div>
																				<div>
																					{secondRow}
																				</div>
																				<div>
																					{thirdRow}
																				</div>

																			</Text>

																		</div>

																	</div>
																</DropdownItem>

															</MenuItem>
														]);

														nodeCount += 1;

													}

													candidateNode = candidateNode.get("parent");
												}


												let moleculeCandidateList2 = [];
												moleculeCandidateList.sort();
												moleculeCandidateList.forEach(([saw, component]) => {
													moleculeCandidateList2.push(component)
												});



												let submenuTitle =
													<div style={{
														height: "50px", color: "black",
														padding: "0px"
													}}>
														<div className="comboSubMenu" style={{
															fontFamily: "Roboto",
															fontSize: "20px", justifyItems: "start",
															position: "relative", top: "10px", left: "30px"
														}}
														>
															Failed Molecule {failureNodeCount}
														</div>
													</div>


												tempMoleculeList.push(
													[failureNode.id,
													<SubMenu
														className={"failureNode"}
														id={failureNodeId}
														title={submenuTitle}
														onClick={(e) => {
															// for (let i = 0; i != comboCount; ++i) {
															// 	document.getElementById("failureNode" + (i + 1))
															// 		.style.backgroundColor = "#f4f5f7";
															// }
															for (let i = 0; i != comboCount; ++i) {

																document.getElementById("selectedCombo" + (i + 1))
																	.style.backgroundColor = "inherit";

																let count = 1;
																while (document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count) != null) {
																	document.getElementById("selectedCombo" + (i + 1) + "selectedRoute" + count)
																		.style.backgroundColor = "inherit";

																	count += 1;
																}
															}



															if (moleculePreviousClick !== "node") {
																let failureNodeIndex = 1;
																let nodeIndex = 1;
																while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {

																	document.getElementById("failureNode" + failureNodeIndex)
																		.style.backgroundColor = "inherit";

																	while (document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex) != null) {
																		document.getElementById("failureNode" + failureNodeIndex + "selectedRoute" + nodeIndex)
																			.style.backgroundColor = "inherit";

																		nodeIndex += 1;
																	}
																	failureNodeIndex += 1;
																	nodeIndex = 1;
																}

																G6.Util.traverseTree(graph.cfg.data,
																	(innerNode) => {
																		if ("reviseSelected" in innerNode
																			&& innerNode.reviseSelected == true) {
																			innerNode.reviseSelected = false
																		}
																	}
																);
															}

															document.getElementById(failureNodeId)
																.style.backgroundColor = "#e9ecef";

															G6.Util.traverseTree(graph.cfg.data,
																(innerNode) => {
																	if ("failureNodeSelected" in innerNode
																		&& innerNode.failureNodeSelected == true) {
																		innerNode.failureNodeSelected = false
																	}
																}
															);

															failureNode.failureNodeSelected = true;
															// node.reviseSelected = true;
															globalContext.updateTreeData(graph.cfg.data);
															graph.read(graph.cfg.data);

															moleculePreviousClick = "molecule";
														}}
													>
														{moleculeCandidateList2}
													</SubMenu>
													]
												);

												failureNodeCount += 1;
											}
										}
									);

									let tempMoleculeList2 = [];
									tempMoleculeList.forEach(([rank, component]) => {
										tempMoleculeList2.push(component);
									});
									setMoleculeList(tempMoleculeList2);











									// setReviseList([]);
									// tempReviseList = [];
									G6.Util.traverseTree(graph.cfg.data,
										(node) => {
											if ("rank" in node && node.rank > 0) {

												const id = "selectedRoute" + node.rank;

												let firstRow = [];
												let secondRow = [];
												let thirdRow = [];
												if (weightRef.current.influence == null &&
													weightRef.current.complexity == null &&
													weightRef.current.convergence == null &&
													weightRef.current.reactionConfidence == null &&
													weightRef.current.associatedSubtreeConfidence == null) {
													firstRow.push(<span>influence: {node.normalizedInfluence.toFixed(3)} </span>);
													firstRow.push(<span>{'\u00A0'}{'\u00A0'}reaction confidence: {node.reactionConfidence.toFixed(3)} </span>);
													secondRow.push(<span>complexity: {node.complexity.toFixed(3)} </span>);
													secondRow.push(<span>{'\u00A0'}{'\u00A0'}convergence: {node.convergence.toFixed(3)}</span>);
													thirdRow.push(<span>associated subtree confidence: {
														node.associatedSubtreeConfidence.toFixed(3)
													}</span>);
												}
												else {
													if (weightRef.current.influence != null)
														firstRow.push(<span>influence: {node.normalizedInfluence.toFixed(3)} </span>);
													if (weightRef.current.reactionConfidence != null)
														firstRow.push(<span>{'\u00A0'}{'\u00A0'}reaction confidence: {node.reactionConfidence.toFixed(3)} </span>);
													if (weightRef.current.complexity != null)
														secondRow.push(<span>complexity: {node.complexity.toFixed(3)} </span>);
													if (weightRef.current.convergence != null)
														secondRow.push(<span>{'\u00A0'}{'\u00A0'}convergence: {node.convergence.toFixed(3)}</span>);
													if (weightRef.current.associatedSubtreeConfidence != null)
														thirdRow.push(<span>associated subtree confidence: {
															node.associatedSubtreeConfidence.toFixed(3)
														}</span>);
												}


												tempReviseList.push(
													[parseInt(node.rank),
													<MenuItem
														// style={{
														// 	backgroundColor: node.reviseSelected ? "#e9ecef" : ""
														// }}	
														onClick={
															(e) => {


																if (previousReviseSelectedNode != null) {
																	document.getElementById("selectedRoute" + previousReviseSelectedNode.rank)
																		.style.backgroundColor = "#f4f5f7";
																}



																// console.log("selectedRoute", document.getElementById("selectedRoute" + node.rank));
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
																fontFamily: "Roboto",
																fontSize: "20px", justifyItems: "start",
																position: "relative", top: "10px", left: "10px"
															}}>
																<Text>Option {node.rank} (Score: {node.SAW.toFixed(3)})</Text>

															</div>

															<div style={{
																fontFamily: "Roboto",
																fontSize: "12px", justifyItems: "start",
																position: "relative", top: "10px", left: "10px"
															}}>
																<Text>
																	<div>
																		{firstRow}
																	</div>
																	<div>
																		{secondRow}
																	</div>
																	<div>
																		{thirdRow}
																	</div>

																</Text>

															</div>


														</DropdownItem>

													</MenuItem>
													]
												);
											}
										});
									// tempReviseList.sort();
									// let tempReviseList2 = [];
									// tempReviseList.forEach(([rank, component]) => {
									// 	tempReviseList2.push(component);
									// })
									// setReviseList(tempReviseList2);
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

			<Modal id="modal" show={showLoading} centered size="lg">
				<div style={{ height: "200px", textAlign: "center", padding: "0px", margin: "0px" }}>
					<div style={{
						height: "40%", textAlign: "center",
						padding: "10px 20px", paddingTop: "20px", paddingBottom: "0px"
					}}>
						<text style={{ fontSize: "35px" }}>
							{loadingText}
						</text>
					</div>
					<div style={{
						height: "20%", textAlign: "center",
						margin: "0px", padding: "0px"
					}}>
						<text style={{ fontSize: "18px" }}>
							This process might take up to 10 minutes
						</text>
					</div>

					<LoadingButton loading variant="outlined" size="large"
						style={{
							width: "50%", height: "35%",
							border: "none"
						}}
						loadingIndicator={<CircularProgress color="inherit" size={50} />}
					>
					</LoadingButton>

				</div>
			</Modal>

		</div>
	);
}


const styles = StyleSheet.create({
	container: {
	},
	scrollView: {
		maxHeight: rowh * 13.4
	},
	routeView: {
		maxHeight: rowh * 16.3
	}
});


export { RetroTree };



