import React, { useEffect, useState } from 'react';
// 引入G6
import G6 from '@antv/g6';
// 引入antv的样式
import insertCss from 'insert-css';

const GsixManage = (props) => {
	const listObj = {
		id: 'A',
		label: 'root',
		name: '张三',
		children: [
			{
				id: 'c1',
				label: '汉子汉子汉子汉子汉子汉子',
				name: '李四',
				children: [
					{
						id: 'c1-1',
						label: 'c1-1',
						name: '李五',
						children: [
							{
								id: 'c1-1-1',
								label: 'c1-1-1',
								name: '白龙马',
							},
							{
								id: 'c1-1-2',
								label: 'c1-1-2',
								name: '唐三藏',
								children: [
									{
										id: 'c1-1-1-1',
										label: 'c1-1-1-1',
										name: '沙悟净',
									},
									{
										id: 'c1-1-1-2',
										label: 'c1-1-1-2',
										name: '孙悟空',
									},
								],
							},
						],
					},
					{
						id: 'c1-2',
						label: 'c1-2',
						name: '五六',
						children: [
							{
								id: 'c1-2-1',
								label: 'c1-2-1',
								name: '六七',
							},
							{
								id: 'c1-2-2',
								label: 'c1-2-2',
								name: '七八',
							},
						],
					},
				],
			},
			{
				id: 'c2',
				label: 'c2',
				name: '七八',
				children: [
					{
						id: 'c2-1',
						label: 'c2-1',
						name: '李五',
					},
					{
						id: 'c2-2',
						label: 'c2-2',
						name: '五六',
					},
					{
						id: 'c2-3',
						label: 'c2-3',
						name: '李五',
					},
					{
						id: 'c2-4',
						label: 'c2-4',
						name: '五六',
					},
				],
			},
			{
				id: 'c3',
				label: 'c3',
				name: '七八',
				children: [
					{
						id: 'c3-1',
						label: 'c3-1',
						name: '七八',
					},
					{
						id: 'c3-2',
						label: 'c3-2',
						name: '七八',
						children: [
							{
								id: 'c3-2-1',
								label: 'c3-2-1',
								name: '七八',
							},
							{
								id: 'c3-2-2',
								label: 'c3-2-2',
								name: '七八',
							},
							{
								id: 'c3-2-3',
								label: 'c3-2-3',
								name: '七八',
							},
						],
					},
					{
						id: 'c3-3',
						label: 'c3-3',
						name: '七八',
					},
				],
			},
		],
	};
	const [data, setData] = useState(listObj);
	const gSixCom = (data) => {

		// 绘制背景表格的插件
		const grid = new G6.Grid();
		// 这里是绘制节点的地方
		G6.registerNode(
			'icon-node',
			{
				drawShape(cfg, group) {

					console.log(22222, cfg, group)
					const styles = this.getShapeStyle(cfg);
					//根据字符长度这是节点宽度
					const labelw = (cfg.label.length || 1) * 30
					const w = labelw < 130 ? 130 : labelw;
					const h = styles.height;
					console.log(11111, w, h)
					const keyShape = group.addShape('rect', {
						attrs: {
							x: 0,
							y: -h / 2,
							width: w,
							height: h,
							stroke: '#5B8FF9',
							// fill: '#fff',
							// radius: [2, 2, 0, 0],
							radius: [10],
							textAlign: 'left',

						},
						name: 'box',

					});
					group.addShape('text', {
						attrs: {
							x: 10,
							y: h / 3.5,
							width: w,
							height: h,
							fill: 'black',
							text: `${cfg.label}`,
							radius: [2, 2, 0, 0],
							textAlign: 'left',
							fontSize: 20,
						},
						name: 'header-box',
						// zIndex: 10,
					});
					if (cfg.name) {
						//     title的背景设置
						//     group.addShape('rect', {
						//         attrs: {
						//             x: -w / 2,
						//             y: -h / 2,
						//             width: w,
						//             height: h / 3,
						//             fill: "#5B8FF9",
						//             radius: [2, 2, 0, 0],
						//             textAlign: "center",
						//         },
						//         name: 'title-box',
						//         draggable: true,
						//     });
						//     // 头部标题
						//     // 图标的展示
						//     // 有children才会显示这个图标
						//     group.addShape('text', {
						//         attrs: {
						//             textBaseline: 'top',
						//             // x: -w / 6,
						//             y: -h / 2.5,
						//             width: w,
						//             height: h / 3,
						//             lineHeight: 20,
						//             textAlign: "center",
						//             text: cfg.label,
						//             fill: '#fff',
						//         },
						//         name: 'title',
						//     });
						//     // 图标的展示
						//     console.log(cfg.children);
						cfg.children &&
							group.addShape('marker', {
								attrs: {
									x: -10,
									y: 0,
									r: 10,
									cursor: 'pointer',
									// 就是设置折叠展开的样式，但是必须要设置stroke颜色，
									// 否则 效果就是透明，误以为会没生效，当然x,y,r的定位也很重要
									symbol:
										JSON.stringify(cfg.children) === '[]'
											? G6.Marker.expand
											: G6.Marker.collapse,
									stroke: '#666',
									lineWidth: 1,
									fill: '#fff',
								},
								name: 'collapse-icon',
								modelId: cfg.id,
							});
					}
					group.addShape('marker', {
						attrs: {
							x: w - 40,
							y: 0,
							r: 8,
							cursor: 'pointer',
							// 就是设置折叠展开的样式，但是必须要设置stroke颜色，
							// 否则 效果就是透明，误以为会没生效，当然x,y,r的定位也很重要
							symbol: G6.Marker.expand,
							stroke: '#666',
							lineWidth: 1,
							fill: '#8acda8',
						},
						name: 'add-icon',
						modelId: cfg.id,
					});
					group.addShape('marker', {
						attrs: {
							// x: 1,
							// y: 45,
							// r: 8,
							x: w - 15,
							y: 0,
							r: 8,
							cursor: 'pointer',
							// 就是设置折叠展开的样式，但是必须要设置stroke颜色，
							// 否则 效果就是透明，误以为会没生效，当然x,y,r的定位也很重要
							symbol: G6.Marker.collapse,
							stroke: '#666',
							lineWidth: 1,
							fill: '#ef8988',
						},
						name: 'delete-icon',
						modelId: cfg.id,
					});
					this.drawLinkPoints(cfg, group);
					return keyShape;
				},
				getAnchorPoints() {
					return [
						[0, 0.5], // 左侧中间
						[1, 0.5], // 右侧中间
					];
				},
				update: undefined,
				// 设置点击折叠以后显示的图标，这个setState尽量避免使用，因为我在里面的
				// 控制台输出发现这个数据一会儿一输出，像是使用了定时器一样。又似是监听
				setState(name, value, item) {
					console.log(name, value, item);
					const group = item.getContainer();
					if (name === 'collapsed') {
						const marker = item
							.get('group')
							.find((ele) => ele.get('name') === 'collapse-icon');
						let icon;
						if (value === undefined) {
							icon = G6.Marker.expand;
						} else {
							icon = G6.Marker.collapse;
						}
						marker.attr('symbol', icon);
					}
				},
			},
			'rect',
		);
		// 绘制节点线条
		G6.registerEdge('flow-line', {
			draw(cfg, group) {
				console.log(4444, cfg, group)
				const startPoint = cfg.startPoint;
				const endPoint = cfg.endPoint;
				const { style } = cfg;
				const hgap = Math.abs(endPoint.x - startPoint.x);
				const shape = group.addShape('path', {

					attrs: {
						stroke: style.stroke,
						endArrow: style.endArrow,

						path: [
							// ['M', startPoint.x, startPoint.y],
							// ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
							// ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
							// ['L', endPoint.x, endPoint.y],


							['M', startPoint.x, startPoint.y],
							['L', startPoint.x + 100, startPoint.y], // 三分之一处
							['L', startPoint.x + 100, endPoint.y], // 三分之二处
							['L', endPoint.x, endPoint.y],
							// ['M', startPoint.x, startPoint.y],
							// [
							//     'C',
							//     startPoint.x + hgap / 4,
							//     startPoint.y,
							//     endPoint.x - hgap / 2,
							//     endPoint.y,
							//     endPoint.x,
							//     endPoint.y,
							// ],

						],

					},
				});
				return shape;
			},
		});
		const defaultStateStyles = {
			hover: {
				stroke: '#1890ff',
				lineWidth: 2,
			},
		};
		const defaultNodeStyle = {
			// fill: '#fff',
			fill: 'red', // 背景颜色
			stroke: '#5B8FF9', // 边框
			radius: 2,
		};
		// 节点之间连线的样式
		const defaultEdgeStyle = {
			stroke: '#5B8FF9',
		};
		const defaultLayout = {
			// type: 'compactBox',
			// direction: 'TB', // TB 是从上到下的展示节点
			type: 'mindmap',
			direction: 'LR',
			// 这个是不能去掉的，否则展开与折叠就不生效了。
			getId: function getId(d) {
				return d.id;
			},
			getHeight: () => {
				return 16;
			},
			// getWidth: () => {
			//     return 16;
			// },
			getVGap: () => {
				return 20;
			},
			getHGap: () => {
				return 100;
			},
		};
		const defaultLabelCfg = {
			// 这个就是节点中间的字体颜色，因为都是绘制出来的所以我暂时先#fff相当于隐藏了
			style: {
				fill: 'rgb(0,0,0,0)',
				fontSize: 12,
			},
		};
		const width = document.getElementById(`container`).scrollWidth;
		const height = document.getElementById(`container`).scrollHeight || 600;
		let graph = new G6.TreeGraph({
			container: `container`,
			width,
			height,
			linkCenter: true,
			defaultLevel: 2,
			modes: {
				default: [
					'drag-canvas',
					// 这个是鼠标移入到节点，而显示的数据
					// {
					//     type: 'tooltip',
					//     formatText: function formatText(model) {
					//         return model.name;
					//     },
					//     offset: 30,
					//     style: {
					//         stroke: "#DEE9FF"
					//     },
					// },
					'zoom-canvas',
				],
			},
			// 内置节点
			defaultNode: {
				type: 'icon-node',
				size: [130, 30], // 设置节点的宽和高
				style: defaultNodeStyle,
				labelCfg: defaultLabelCfg,
				anchorPoints: [[0, 1], [0.5, 1]],
			},
			defaultEdge: {
				type: 'flow-line',
				// type: 'cubic-horizontal',
				style: defaultEdgeStyle,
				sourceAnchor: 1,
				targetAnchor: 0,
			},
			nodeStateStyles: defaultStateStyles,
			edgeStateStyles: defaultStateStyles,
			layout: defaultLayout,
			plugins: [grid],
			defaultLevel: 2,
			nodeClick: (item) => {
				console.log(item);
			},
		});
		let listAA = JSON.parse(JSON.stringify(data));
		const loop = (data) => {
			data.forEach((item) => {
				if (item.id.length >= 2) {
					if (item.children) {
						item = graph.findDataById(item.id, listAA).children = [];
					}
				}
				if (item.children) {
					loop(item.children);
				}
				item.anchorPoints = [
					[0, 0.5],
					[1, 0.5],
				];
			});
			return data;
		};
		console.log(222, listAA);
		loop([listAA]);
		graph.setAutoPaint(true);
		graph.read(listAA);
		graph.render();
		graph.fitCenter(true);
		graph.zoom(0.8); // 默认缩放图形大小
		graph.on('node:mouseenter', (evt) => {
			const { item } = evt;
			graph.setItemState(item, 'hover', true);
		});
		graph.on('node:mouseleave', (evt) => {
			const { item } = evt;
			graph.setItemState(item, 'hover', false);
		});
		let cloneData = JSON.parse(JSON.stringify(data));
		graph.on('node:click', (evt) => {
			const { target, item } = evt;
			const id = target.get('modelId');
			const item22 = graph.findById(id);
			console.log(item22, id);
			const nodeModel = item22 && item22.getModel();
			const name = target.get('name');
			if (name === 'collapse-icon') {
				let gsixAa = graph.findDataById(
					id,
					JSON.parse(JSON.stringify(cloneData)),
				);
				console.log(JSON.stringify(nodeModel.children));
				if (JSON.stringify(nodeModel.children) !== '[]') {
					gsixAa &&
						gsixAa.children.forEach((item) => {
							nodeModel.children = nodeModel.children ? [] : null;
						});
					let gsixModel = JSON.parse(JSON.stringify(nodeModel));
					graph.updateChild(gsixModel, gsixModel.id);
					graph.setItemState(item22, 'collapsed', nodeModel.collapsed);
				} else {
					if (!nodeModel.children) {
						nodeModel.children = [];
					}
					console.log(nodeModel);
					gsixAa &&
						gsixAa.children.forEach((item) => {
							nodeModel.children.push(item);
						});
					let gsixModel = nodeModel;
					gsixModel.children.forEach((element, index) => {
						if (element.children) {
							element.children = element.children ? [] : null;
						}
					});
					graph.updateChild(gsixModel, gsixModel.id);
					graph.setItemState(item22, 'collapsed', !nodeModel.collapsed);
				}
			} else if (name === 'add-icon') {
				console.log('新增节点');
			} else if (name === 'delete-icon') {
				console.log('删除');
			}
		});
	};
	useEffect(() => {
		document.getElementById(`container`).innerHTML = '';
		gSixCom(data);
	}, []);
	return (
		<>
			<div>
				1111111
				<div id={`container`}></div>
			</div>
		</>
	);
};
export default GsixManage;