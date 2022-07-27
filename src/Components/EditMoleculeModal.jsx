import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import GlobalContext from "../Context/context";

function EditMoleculeModal(props) {

	const [show, setShow] = useState(true);

	const globalContext = useContext(GlobalContext);

	return (<Modal id="modal" show={show} centered size="lg">
		<div style={{ height: "200px", textAlign: "center", padding: "0px", margin: "0px" }}>
			<div style={{
				height: "50%", textAlign: "left",
				padding: "10px 20px", paddingTop: "20px"
			}}>
				<text style={{ fontSize: "35px" }}>
					Edit molecule
				</text>
			</div>
			<div style={{
				height: "50%", textAlign: "left",
				padding: "10px 20px", paddingBottom: "30px", paddingLeft: "22px"
			}}>
				<text style={{ fontSize: "20px" }}>
					By modifying this molecule the associated subtree will be lost once edited.
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

					document.getElementById("editMoleculeText").innerHTML = "Please edit the molecule.";
					document.getElementById("ifKetcher2").contentWindow.ketcher.setMolecule(model.smiles);
					document.getElementById("editMolecule").style.zIndex = 10;
					document.getElementById("editMolecule").style.visibility = "visible";
					document.getElementById("drawBoard").style.visibility = "hidden";
					document.getElementById("main").style.zIndex = -1;
					setSideButtonVisibility("hidden");
					setModelArr([]);

				}}>
				Proceed
			</Button>
		</div>
	</Modal>);

}

export { EditMoleculeModal };