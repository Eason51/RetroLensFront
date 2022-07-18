import React from "react";
import GridLayout from 'react-grid-layout';
import Card from '@material-ui/core/Card'
import { ReactComponent as MySvg } from "../logo.svg";
import { border } from "@mui/system";

const layout = [
	{ i: 'a', x: 0, y: 0, w: 60, h: 1, static: true },
	{ i: 'b', x: 0, y: 1, w: 60, h: 4, static: true }
];

const { innerWidth: width, innerHeight: height } = window;
const m = 0;
const rowh = height / 23;


const renderForeignObjectNode = ({
	nodeDatum,
	toggleNode,
	foreignObjectProps
}) => {

	let nodeColor = "";
	if (nodeDatum.attributes.confidence !== 0) {
		nodeColor = "white";
	}
	else if (nodeDatum.attributes.isCommercial === true) {
		nodeColor = "green";
	}
	else if (nodeDatum.attributes.isCommercial === false && nodeDatum.attributes.isExpandable === true) {
		nodeColor = "blue"
	}
	else {
		nodeColor = "red";
	}

	return (
		<g>
			<rect width={60} height={20} fill="lightblue" x={-30} onClick={(e) => {
				nodeDatum.attributes.userSelected = nodeDatum.attributes.userSelected ? false : true;
			}}>

			</rect>
			<text x={-25} y={15}>
				expand
			</text>
			{/* `foreignObject` requires width & height to be explicitly set. */}
			<foreignObject {...foreignObjectProps}>
				{/* <div style={{ border: "1px solid black", backgroundColor: "#dedede" }}>
				<h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
				{nodeDatum.children && (
					<button style={{ width: "100%" }} onClick={toggleNode}>
						{nodeDatum.__rd3t.collapsed ? "Expand" : "Collapse"}
					</button>
				)}
			</div> */}
				<div onClick={(e) => {

				}}>
					<GridLayout className="layout" layout={layout} cols={60} rowHeight={rowh} width={foreignObjectProps.width} margin={[3, 0.5]} isResizable={true}
						style={{ backgroundColor: nodeColor }}>
						<div key="a" >
							<Card variant="outlined" style={{ height: rowh }}>
								<p style={{ backgroundColor: "#e9ecef", margin: "5px", paddingLeft: "5px" }}>{nodeDatum.name}</p>

							</Card>
						</div>
						<div key="b">
							<Card variant="outlined" style={{ height: rowh * 4 }}>
								<MySvg></MySvg>
							</Card>
						</div>
					</GridLayout>
				</div>

			</foreignObject>




		</g>
	)
};

export default renderForeignObjectNode;
