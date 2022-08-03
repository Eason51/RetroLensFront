import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import GlobalContext from "../Context/context";

function DeleteButtonModal(props) {

	const [show, setShow] = useState(true);

	const globalContext = useContext(GlobalContext);

	return (<Modal id="modal" show={show} centered size="lg">
		<div style={{ height: "200px", textAlign: "center", padding: "0px", margin: "0px" }}>
			<div style={{
				height: "50%", textAlign: "left",
				padding: "10px 20px", paddingTop: "20px"
			}}>
				<text style={{ fontSize: "35px" }}>
					Edit reaction
				</text>
			</div>
			<div style={{
				height: "50%", textAlign: "left",
				padding: "10px 20px", paddingBottom: "30px", paddingLeft: "22px"
			}}>
				<text style={{ fontSize: "20px" }}>
					By modifying this reaction the associated subtree will be lost once edited.
				</text>
			</div>

			<Button style={{
				width: "50%", height: "35%", backgroundColor: "#4c4c4c",
				border: "none", borderRadius: "0px"
			}}
				onClick={() => {
					const setModelArr = props.setModelArr;
					setModelArr([]);
				}}>
				Cancel
			</Button>

			<Button style={{
				width: "50%", height: "35%", backgroundColor: "#2867f3",
				border: "none"
			}}
				onClick={() => {

					const model = props.model;
					const graph = props.graph;
					const setSideButtonVisibility = props.setSideButtonVisibility;
					const setModelArr = props.setModelArr;

					if (model.children) {
						graph.updateChildren([], model.id);
						globalContext.updateTreeData(graph.cfg.data);
						graph.render();
					}

					document.getElementById("drawBoardText").innerHTML = "Please edit the reaction."
					document.getElementById("drawBoardButton").innerHTML = "Save changes"
					document.getElementById("drawBoardButton").style.width = "200px";
					document.getElementById("drawBoardButton").style.left = "80%";
					// document.getElementById('ifKetcher').contentWindow.ketcher.setMolecule(model.smiles);
					window.ketcher.setMolecule(model.smiles);
					document.getElementById("drawBoard").style.visibility = "visible";
					document.getElementById("drawBoard").style.zIndex = 2;
					document.getElementById("main").style.zIndex = -1;
					setSideButtonVisibility("hidden");
					setModelArr([]);

				}}>
				Proceed
			</Button>
		</div>
	</Modal>);

}

export { DeleteButtonModal };