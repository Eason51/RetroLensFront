import React, { useContext, useEffect, useState } from 'react';
import G6 from '@antv/g6';
import { Row } from 'react-bootstrap';
import { createNodeFromReact, appenAutoShapeListener, Text } from '@antv/g6-react-node';
import ReactDOM from "react-dom";
import { RetroTreeNode } from './RetroTreeNode';
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
import { Card } from '@material-ui/core';
import { Button } from "@mui/material";
import { style, width } from '@mui/system';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import Tooltip from '@mui/material/Tooltip';


let graph = null

let selectedModel = null;
let selectedModelParent = null;
let selectedRoute = null;
let previousGraph = null;


const RetroTree = () => {

	const [sideMenuCollapsed, setSideMenuCollapsed] = useState(true);
	const [reviseMenuCollapsed, setReviseMenuCollapsed] = useState(true);
	const [routeList, setRouteList] = useState([]);
	const [reviseList, setReviseList] = useState([]);

	const ref = React.useRef(null)

	const globalContext = useContext(GlobalContext);

	const exitDrawBoard = () => {
		setTimeout(updateDrawBoardOutput, 200);
	}

	const updateDrawBoardOutput = () => {

		let model = selectedModel;
		const currentSmiles = document.getElementById("smiles").innerHTML;
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

		fetch("http://192.168.31.118:5000/checkRXN", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(graph.cfg.data)
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


	const displayReviseMenu = () => {
		setReviseMenuCollapsed(false);
		graph.changeSize(1130, 670);
		graph.fitView();
		graph.render();
		// G6.Util.traverseTree(graph.cfg.data, (subTree) => { console.log("subtree", subTree); })

		// setTimeout(() => {
		// 	const revisePromise = globalContext.revisePromise;
		// 	console.log("promise", revisePromise);
		// }, 2000);

	}

	const applyAlternative = () => {
		setSideMenuCollapsed(true);
		graph.changeSize(1400, 670);
		graph.fitView();
		graph.render();
	}

	const cancelAlternative = () => {
		setSideMenuCollapsed(true);
		graph.changeSize(1400, 670);
		globalContext.updateTreeData(previousGraph);
		console.log("previousgraph2", previousGraph);
		graph.read(previousGraph);
	}

	const closeRevise = () => {

		setReviseMenuCollapsed(true);
		graph.changeSize(1400, 670);
		graph.fitView();
		graph.render();
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

				if (model.children) {
					// while (model.children.length != 0) {
					// 	graph.removeChild(model.children[0].id);
					// }
					graph.updateChildren([], model.id);
					globalContext.updateTreeData(graph.cfg.data);
					graph.render();

				}
				// document.getElementById("drawBoardButton").addEventListener("click", updateDrawBoardOutput(model));

				// const prevSmiles = model.smiles;
				// document.getElementById("smiles").innerHTML = prevSmiles;

				document.getElementById('ifKetcher').contentWindow.ketcher.setMolecule(model.smiles);
				document.getElementById("drawBoard").style.visibility = "visible";
				document.getElementById("drawBoard").style.zIndex = 2;
				document.getElementById("main").style.zIndex = -1;

			}
			else if (name === "expandButton") {

				// console.log("selectedModel", selectedModel);
				setRouteList([]);
				if ("AIRoutes" in selectedModel) {
					setSideMenuCollapsed(false);
					previousGraph = JSON.parse(JSON.stringify(graph.cfg.data));
					console.log("previousGraph", previousGraph);
					graph.changeSize(1130, 670);
					graph.fitView();
					graph.render();

					let tempRouteList = [];
					let routeCount = 1;
					selectedModel.AIRoutes.forEach(
						route => {
							tempRouteList.push(
								<MenuItem onClick={
									() => {
										selectedRoute = route;


										selectedModel.children = [];
										selectedModel.children.push(selectedRoute);
										globalContext.updateTreeData(graph.cfg.data);
										graph.read(graph.cfg.data);
									}
								}
								>
									{/* <Card variant="outlined" style={{ height: "50px", backgroundColor: "#e9ecef" }}>
										<Row style={{ position: "relative", left: "39%", top: "20%" }}>
											<Text>Alternative {routeCount}</Text>
										</Row>
									</Card> */}

									<DropdownItem style={{ height: "60px", color: "black" }} size="lg">
										<div style={{
											fontFamily: "consolas",
											fontSize: "20px", justifyItems: "start",
											position: "relative", top: "10px"
										}}>
											<Text>Alternative {routeCount}</Text>

										</div>


									</DropdownItem>
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
				if (model.children) {
					while (model.children.length != 0) {
						graph.removeChild(model.children[0].id);
					}
				}
				graph.removeChild(model.id);
				globalContext.updateTreeData(graph.cfg.data);
				graph.read(graph.cfg.data);
			}
			else if (name === "editMolecule") {
				if (model.children) {
					graph.updateChildren([], model.id);
					globalContext.updateTreeData(graph.cfg.data);
					graph.render();
				}

				document.getElementById("ifKetcher2").contentWindow.ketcher.setMolecule(model.smiles);
				document.getElementById("editMolecule").style.zIndex = 10;
				document.getElementById("editMolecule").style.visibility = "visible";
				document.getElementById("drawBoard").style.visibility = "hidden";
				document.getElementById("main").style.zIndex = -1;
			}
			else if (name === "container" || name === "molecule") {
				model.notAvailable = true;
				globalContext.updateTreeData(graph.cfg.data);
				graph.read(graph.cfg.data);
			}


		})
	}



	const [oldGlobalContext, setOldGlobalContext] = useState({});

	const confirmRevise = () => {

		let reviseNodeFound = false;

		G6.Util.traverseTree(graph.cfg.data,
			(node) => {

				if (reviseNodeFound)
					return;

				if ("reviseSelected" in node && node.reviseSelected) {
					// console.log("node", node);
					if (node.children) {
						graph.updateChildren([], node.id);
						globalContext.updateTreeData(graph.cfg.data);
						graph.read(graph.cfg.data);
					}

					reviseNodeFound = true;
					node.reviseSelected = false;

					document.getElementById('ifKetcher').contentWindow.ketcher.setMolecule(node.smiles);
					document.getElementById("drawBoard").style.zIndex = 2;
					document.getElementById("drawBoard").style.visibility = "visible";
					document.getElementById("main").style.zIndex = -1;
					selectedModel = node;
					setReviseMenuCollapsed(true);
					graph.changeSize(1400, 670);
					graph.fitView();
					graph.render();
				}
			}
		);
	}


	useEffect(() => {

		if (oldGlobalContext.revisePromise != globalContext.revisePromise
			&& globalContext.revisePromise.then) {
			// console.log("reviseContext", globalContext.revisePromise);
			globalContext.revisePromise
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
								console.log("node", node)
								tempReviseList.push(
									[parseInt(node.rank),
									<MenuItem onClick={
										() => {

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

										<DropdownItem style={{ height: "60px", color: "black" }} size="lg">
											<div style={{
												fontFamily: "consolas",
												fontSize: "20px", justifyItems: "start",
												position: "relative", top: "10px"
											}}>
												<Text>Rank {node.rank}</Text>

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

		setOldGlobalContext(globalContext);
	}, [globalContext])



	useEffect(() => {

		document.getElementById("drawBoardButton").addEventListener("click", exitDrawBoard);
		document.getElementById("editMoleculeButton").addEventListener("click", exitEditMolecule);
		document.getElementById("reviseButton").addEventListener("click", displayReviseMenu);

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
								if ("AIRoutes" in model)
									return model.AIRoutes.length + " AI generated routes";
								else
									return "No AI routes generated"
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
					],
				},
				defaultEdge: {
					type: "polyline",
					style: {
						stroke: '#0f62fe',
						// startArrow: true,
						offset: 10
					}
				},
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
					rankSep: 200,      // 每个层级之间的间距
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

	const updateData = () => {
		fetch("http://192.168.31.118:5000/checkRXN", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(graph.cfg.data)
		}).then((response) =>
			response.json())
			.then((responseJson) => {
				console.log("response", responseJson);
				globalContext.updateTreeData(responseJson);
				if ("confidence" in responseJson) {
					globalContext.updateConfidence(responseJson.confidence);
				}
				graph.read(responseJson);
			})
			.catch(err => {
				console.log("fetching error")
				console.log(err);
			});
	}


	return (
		<div style={{ width: "1494px", height: "90%" }} ref={ref}>
			{/* <button onClick={updateData}>update data</button> */}

			<ProSidebar style={{
				position: "absolute", left: "82%", top: "0%",
				// height: "828px",
				// transform: "translate(0, -10%)"
			}}
				collapsed={sideMenuCollapsed}
			>
				<SidebarContent>
					<Menu>
						{routeList}

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

			<ProSidebar style={{
				position: "absolute", left: "82%", top: "0%",
				// height: "828px",
				// transform: "translate(0, -10%)"
				margin: "0",
				padding: "0"
			}}
				collapsed={reviseMenuCollapsed}
			>
				<SidebarContent>
					<Menu style={{
						margin: "0",
						padding: "0"
					}}>
						{/* <MenuItem>
							<Button variant='contained' size='large' onClick={confirmRevise}>revise confirmed</Button>
						</MenuItem> */}
						{reviseList}

					</Menu>
				</SidebarContent>
				<SidebarFooter>

					<Button variant='contained' size='large' onClick={closeRevise}
						style={{ height: "60px", width: "100%", backgroundColor: "grey" }}
					>Close
					</Button>



				</SidebarFooter>

			</ProSidebar>



		</div>
	);
}


export { RetroTree };



