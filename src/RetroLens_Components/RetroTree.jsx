import React from 'react';
import Tree from 'react-d3-tree';
import renderForeignObjectNode from "./RetroTreeNode";
import SelectionBox from './SelectionBox';
import { AIResult } from './AIsucess';
import { AIFailedResult } from './AIfailed';

const parseObj = (obj) => {
	let routeName = obj.smiles;
	let routeAttributes = {
		confidence: obj.confidence,
		imageURL: "../logo.svg",
		isExpandable: obj.isExpandable,
		isCommercial: obj.isCommercial,
		userSelected: false
	}

	let routeChildren = [];
	obj.children.forEach(element => {
		routeChildren.push(parseObj(element));
	});

	return {
		name: routeName,
		attributes: routeAttributes,
		children: routeChildren
	}
}

const parseRoute = (route) => {
	let routes = []
	route.forEach(element => {
		routes.push(parseObj(element));
	})
	return routes;
}



const orgChart = {
	name: '1CCCCCCCCCCC',
	attributes: {
		imageURL: "../logo.svg"
	},
	children: [
		{
			name: '2CCCCCCCCCCC',
			attributes: {
				imageURL: "../logo.svg"
			},
			children: [
				{
					name: '3CCCCCCCCCCC',
					attributes: {
						imageURL: "../logo.svg"
					},
					children: [

					],
				},
				{
					name: '3CCCCCCCCCCC',
					attributes: {
						imageURL: "../logo.svg"
					},
					children: [

					],
				},
			],
		},
		{
			name: '2CCCCCCCCCCC',
			attributes: {
				imageURL: "../logo.svg"
			},
			children: [

			],
		},
		{
			name: '2CCCCCCCCCCC',
			attributes: {
				imageURL: "../logo.svg"
			},
			children: [

			],
		},
	],
};

orgChart.children[2].children.push(
	{
		name: '1CCCCCCCCCCC',
		attributes: {
			imageURL: "../logo.svg"
		},
		children: [
			{
				name: '2CCCCCCCCCCC',
				attributes: {
					imageURL: "../logo.svg"
				},
				children: [
					{
						name: '3CCCCCCCCCCC',
						attributes: {
							imageURL: "../logo.svg"
						},
						children: [
	
						],
					},
					{
						name: '3CCCCCCCCCCC',
						attributes: {
							imageURL: "../logo.svg"
						},
						children: [
	
						],
					},
				],
			},
			{
				name: '2CCCCCCCCCCC',
				attributes: {
					imageURL: "../logo.svg"
				},
				children: [
	
				],
			},
			{
				name: '2CCCCCCCCCCC',
				attributes: {
					imageURL: "../logo.svg"
				},
				children: [
	
				],
			},
		],
	}
);


const AISuccessData = parseRoute(AIResult.retrosynthetic_paths);
const AIFailedData = parseRoute(AIFailedResult.retrosynthetic_paths);


export class RetroTree extends React.Component {


	render() {

		this.props.updateRouteCount(AISuccessData.length);

		let renderRoute = this.props.renderRoute;
		const translate = { x: 500, y: 20 };
		const nodeSize = { x: 200, y: 240 };
		const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20, y: 30 };

		this.props.updateDisplayedTree(AISuccessData[renderRoute]);

		return (
				<Tree
					data={AISuccessData[renderRoute]}
					translate={translate}
					nodeSize={nodeSize}
					orientation={"vertical"}
					separation={{
						siblings: 1.1,
					}}
					renderCustomNodeElement={(rd3tProps) =>
						renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
					}
				/>
		);
	}
}