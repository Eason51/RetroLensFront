import React, { useState, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap"
import { Button } from "@mui/material";
import MainBlock from "../RetroLens_Components/MainBlock";
import { ConstraintInputPanel } from "../RetroLens_Components/ConstraintInputPanel";
import { TreeInterface } from "./TreeInterface";
import GlobalContext from "../Context/context";
import { RetroTree } from "./RetroTree";



function MainInterface() {

	const [targetMolecule, updateTargetMolecule] = useState("");
	const [constraints, updateConstraints] = useState({});
	const [show, setShow] = useState(false);
	const [treeData, setTreeData] = useState({});
	const [treeGraph, setTreeGraph] = useState({});
	const [revisePromise, setRevisePromise] = useState({});
	const [RetroTreeComponent, setRetroTreeComponent] = useState([]);
	const [confidence, setConfidence] = useState(-1);
	const [serverIp, setServerIp] = useState("http://192.168.1.8:5000/");

	document.getElementById("drawBoardButton").addEventListener("click", ()=> {
		setShow(true);
	});



	const updateConstraintFromPanel = (price, mssr, excludeSubstructure, excludeSmiles) => {
		updateConstraints({
			price: price,
			mssr: mssr,
			excludeSubstructure: excludeSubstructure,
			excludeSmiles: excludeSmiles
		})
	};

	const updateTreeData = (newTreeData) => {
		setTreeData(newTreeData);
	}

	const updateTreeGraph = (newTreeGraph) => {
		setTreeGraph(newTreeGraph)
	}

	const updateRevisePromise = (newRevisePromise) => {
		setRevisePromise(newRevisePromise);
	}

	const updateConfidence = (newConfidence) => {
		setConfidence(newConfidence);
	}

	const closeDrawBoard = () => {
		setShow(false);
		document.getElementById("drawBoard").style.zIndex = -1;
		document.getElementById("drawBoard").style.visibility = "hidden";
		document.getElementById("main").style.zIndex = 2;
	}

	return (
		<GlobalContext.Provider value={{
			targetMolecule, updateTargetMolecule,
			constraints, updateConstraints, treeData, updateTreeData,
			treeGraph, updateTreeGraph, revisePromise, updateRevisePromise,
			confidence, updateConfidence, serverIp
		}}>
			<div>
				{/* <MainBlock /> */}
				<TreeInterface RetroTreeComponent={RetroTreeComponent} />

				<Modal id="modal" show={show} centered size="lg">
					<div style={{textAlign: "center", paddingTop: "10px", fontSize: "25px"}}>
						Input Constraint for AI RetroSynthetic Route Planning
					</div>

					<div style={{ margin: "40px", marginTop: "20px" }}>
						<ConstraintInputPanel updateConstraintFromPanel={updateConstraintFromPanel} />
					</div>
					<GlobalContext.Consumer>
						{globalContext => {
							return (
								<div>

									<Button style={{ width: "50%" }}
									onClick={() => {
										setShow(false);
									}}>
										cancel
									</Button>

									<Button onClick={
										() => {
											globalContext.updateTargetMolecule(
												document.getElementById("smiles").innerHTML);

											globalContext.updateConstraints(constraints);

											// console.log("constraints", constraints);

											setShow(false);
											document.getElementById("drawBoard").style.zIndex = -1;
											document.getElementById("main").style.zIndex = 2;
											document.getElementById('drawBoard').style.visibility = 'hidden';

											fetch(globalContext.serverIp.concat("initialize"), {
												method: "POST",
												headers: {
													"Accept": "application/json",
													"Content-Type": "application/json"
												},
												body: JSON.stringify({ smiles: document.getElementById("smiles").innerHTML })
											}).then((response) =>
												response.json())
												.then((responseJson) => {
													console.log("initialize_response", responseJson);
													globalContext.updateTreeData(responseJson);
													if ("confidence" in responseJson) {
														globalContext.updateConfidence(responseJson.confidence);
													}
													// globalContext.updateTreeData(treeData2);
													setRetroTreeComponent([<RetroTree constraints={constraints} />]);
													document.getElementById("drawBoardButton").addEventListener("click", closeDrawBoard);
												
													// document.getElementById('ifKetcher').contentWindow.ketcher.setMolecule('');
												})
												.catch(err => {
													console.log("fetching error")
													console.log(err);
												});

											// globalContext.updateTreeData(treeData2);
											// setRetroTreeComponent([<RetroTree />]);
											// document.getElementById("drawBoardButton").addEventListener("click", closeDrawBoard);
										}
									}
										style={{ width: "50%" }}
									>
										confirm
									</Button>
								</div>

							);
						}}
					</GlobalContext.Consumer>
				</Modal>


			</div>
		</GlobalContext.Provider>
	);
}

export { MainInterface };