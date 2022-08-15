import React, { useState, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap"
import { Button, CircularProgress } from "@mui/material";
import MainBlock from "../RetroLens_Components/MainBlock";
import { ConstraintInputPanel } from "../RetroLens_Components/ConstraintInputPanel";
import { TreeInterface } from "./TreeInterface";
import GlobalContext from "../Context/context";
import { RetroTree } from "./RetroTree";
import LoadingButton from '@mui/lab/LoadingButton';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';



const NoMaxWidthTooltip = styled(({ className, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))({
	[`& .${tooltipClasses.tooltip}`]: {
		maxWidth: 'none',
	},
});



let skipCheck = false;

const { innerWidth: width, innerHeight: height } = window;
const rowh = height / 23;

function MainInterface() {

	const [targetMolecule, updateTargetMolecule] = useState("");
	const [constraints, updateConstraints] = useState({});
	const [show, setShow] = useState(false);
	const [treeData, setTreeData] = useState({});
	const [treeGraph, setTreeGraph] = useState({});
	const [revisePromise, setRevisePromise] = useState({});
	const [RetroTreeComponent, setRetroTreeComponent] = useState([]);
	const [confidence, setConfidence] = useState(-1);
	const [serverIp, setServerIp] = useState("http://49.234.10.199:5000/");
	const [showLoading, setShowLoading] = useState(false);
	const [showFailureModal, setShowFailureModal] = useState(false);



	const displayConstraintModal = () => {


		if (skipCheck == true)
			return;

		setShowLoading(true)
		setTimeout(() => {
			window
				.initRDKitModule()
				.then(function (RDKit) {

					setShowLoading(false);

					let smiles = document.getElementById("smiles").innerHTML;
					// console.log("smiles", smiles);
					let mol = RDKit.get_mol(smiles);
					// console.log("mol", mol.is_valid());
					if (mol.is_valid() == false) {
						setShowFailureModal(true);
					}
					else {
						setShow(true);
					}

				})
				.catch((e) => {
					console.log("render error", e);
				});
		}, 600);
	}



	useEffect(() => {
		const drawBoardButton = document.getElementById("drawBoardButton");
		drawBoardButton.addEventListener("click", displayConstraintModal);

		return () => {
			drawBoardButton.removeEventListener("click", displayConstraintModal);
		};
	}, [])


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

											console.log("initial constraints", constraints);

											setShow(false);
											document.getElementById("drawBoard").style.zIndex = -1;
											document.getElementById("main").style.zIndex = 2;
											document.getElementById('drawBoard').style.visibility = 'hidden';

											setShowLoading(true);

											// console.log("initialize", document.getElementById("smiles").innerHTML);

											fetch(globalContext.serverIp.concat("initialize"), {
												method: "POST",
												headers: {
													"Accept": "application/json",
													"Content-Type": "application/json"
												},
												body: JSON.stringify({
													smiles: document.getElementById("smiles").innerHTML,
													constraints: constraints
												})
											}).then((response) =>
												response.json())
												.then((responseJson) => {

													setShowLoading(false);

													console.log("initialize_response", responseJson);
													globalContext.updateTreeData(responseJson);
													if ("confidence" in responseJson) {
														globalContext.updateConfidence(responseJson.confidence);
													}
													// globalContext.updateTreeData(treeData2);
													setRetroTreeComponent([<RetroTree constraints={constraints} />]);
													document.getElementById("drawBoardButton").addEventListener("click", closeDrawBoard);

													// document.getElementById('ifKetcher').contentWindow.ketcher.setMolecule('');
													window.ketcher.setMolecule('');
													skipCheck = true;
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



				<Modal id="modal" show={showLoading} centered size="lg">
					<div style={{ height: "200px", textAlign: "center", padding: "0px", margin: "0px" }}>
						<div style={{
							height: "40%", textAlign: "center",
							padding: "10px 20px", paddingTop: "20px", paddingBottom: "0px",
						}}>
							<text style={{ fontSize: "35px" }}>
								Analysing Target Molecule
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


				<Modal id="modal" show={showFailureModal} centered size="lg">
					<div style={{ height: "200px", textAlign: "center", padding: "0px", margin: "0px" }}>
						<div style={{
							height: "40%", textAlign: "left",
							padding: "10px 20px", paddingTop: "20px", paddingBottom: "0px"
						}}>
							<text style={{ fontSize: "35px" }}>
								Molecule Parsing Error
							</text>
						</div>
						<div style={{
							height: "60%", textAlign: "left",
							padding: "10px 20px", paddingBottom: "30px", paddingLeft: "22px", paddingTop: "30px"
						}}>
							<text style={{ fontSize: "20px" }}>
								The target molecule is not valid.
							</text>
						</div>


						<Button style={{
							width: "100%", height: "35%", backgroundColor: "#2867f3",
							border: "none", color: "white"
						}}
							onClick={() => {
								setShowFailureModal(false);
							}}>
							Modify Target Molecule
						</Button>

					</div>
				</Modal>


			</div>
		</GlobalContext.Provider>
	);
}

export { MainInterface };