import G6 from '@antv/g6';

G6.registerEdge(
	"retroTreeEdge",
	{
		afterDraw(cfg, group) {
			
			

			const shape = group.get('children')[0];


			let sourceNode = cfg.sourceNode.getModel();
			if("reviseSelected" in sourceNode && sourceNode.reviseSelected)
			{
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
			else
			{
				shape.attr("stroke", "#0f62fe");
			}
			
		},
	},
	"polyline"
);