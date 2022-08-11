import G6 from '@antv/g6';

G6.registerEdge(
	"retroTreeEdge",
	{
		draw(cfg, group) {
			const startPoint = cfg.startPoint;
			const endPoint = cfg.endPoint;

			// console.log("group", group)

			const keyShape = group.addShape('path', {
				attrs: {
					path: [
						['M', startPoint.x, startPoint.y],
						['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
						['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
						['L', endPoint.x, endPoint.y],
					],
					lineWidth: 1,
				},
				className: 'edge-shape',
				name: 'edge-shape',
			});
			return keyShape;
		},

		afterDraw(cfg, group) {



			const shape = group.get('children')[0];
			const startPoint = cfg.startPoint;
			const endPoint = cfg.endPoint;

			let sourceNode = cfg.sourceNode.getModel();
			let targetNode = cfg.targetNode.getModel();
			// console.log("sourceNode", sourceNode);
			if ("reviseSelected" in sourceNode && sourceNode.reviseSelected) {
				shape.attr("stroke", "#ffcc66");
				shape.attr("lineWidth", 4);

				const length = shape.getTotalLength();
				shape.animate(
					(ratio) => {
						const startLen = ratio * length;
						const cfg = {
							lineDash: [startLen, length - startLen],
						};
						return cfg;
					},
					{
						repeat: false,
						duration: 1200,
					},
				);
			}
			else {
				shape.attr("stroke", "#0f62fe");

				if (("isAI" in sourceNode == false || sourceNode.isAI == false)
					&& ("isAI" in targetNode == false || targetNode.isAI == false)) {
					
					shape.attr("lineWidth", 4);
				}
			}

		},
	},
	// "polyline"
);