import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import GlobalContext from "../Context/context";

function DeleteMoleculeModal(props) {

	const [show, setShow] = useState(true);

	const globalContext = useContext(GlobalContext);

	return (<Modal id="modal" show={show} centered size="lg">
		<div style={{ height: "200px", textAlign: "center", padding: "0px", margin: "0px" }}>
			<div style={{
				height: "50%", textAlign: "left",
				padding: "10px 20px"
			}}>
				<text style={{ fontSize: "40px" }}>
					Delete
				</text>
			</div>
			<div style={{
				height: "50%", textAlign: "left",
				padding: "10px 20px", paddingBottom: "30px", paddingLeft: "22px"
			}}>
				<text style={{ fontSize: "20px" }}>
					Do you really want to delete this molecule and all the children of it?
				</text>
			</div>

			<Button style={{ width: "50%", height: "35%", backgroundColor: "#4c4c4c",
				border: "none", borderRadius: "0px" }}
				onClick={() => {
					const setModelArr = props.setModelArr;
					setModelArr([]);
				}}>
				Cancel
			</Button>

			<Button style={{ width: "50%", height: "35%", backgroundColor: "#d91e27",
				border: "none" }}
				onClick={() => {

					const model = props.model;
					const graph = props.graph;
					const setSideButtonVisibility = props.setSideButtonVisibility;
					const setModelArr = props.setModelArr;

					if (model.children) {
						while (model.children.length != 0) {
							graph.removeChild(model.children[0].id);
						}
					}
					graph.removeChild(model.id);
					globalContext.updateTreeData(graph.cfg.data);
					graph.read(graph.cfg.data);
					setSideButtonVisibility("hidden");
					setModelArr([]);
				}}>
				Delete
			</Button>
		</div>
	</Modal>);

}

export { DeleteMoleculeModal };