import {
	Group,
	Rect,
	Text,
	Circle,
	Image,
	createNodeFromReact,
} from '@antv/g6-react-node';
import G6 from '@antv/g6';
import Tooltip from '@mui/material/Tooltip';
import priceIcon from "./price.jpg";
import stepIcon from "./steps.jpg";
import moleculeIcon from "./molecule.jpg";
import substructureIcon from "./substructure.jpg";
import clearIcon from "./close.png";



G6.registerNode(
	'retroTreeNode',
	{

		drawShape(cfg, group) {

			// const borderColor = ("notAvailable" in cfg && cfg.notAvailable == true)
			// const selectedColor = ("reviseSelected" in cfg && cfg.reviseSelected == true)


			let mouseEnter = true;
			// if ("mouseEnter" in cfg && cfg.mouseEnter) {
			// 	mouseEnter = cfg.mouseEnter;
			// }

			let isAvailable = "";
			let cursorShape = "pointer";
			let notAvailable = false;
			let reviseSelected = false;

			if ("reviseSelected" in cfg && cfg.reviseSelected) {
				reviseSelected = true;
			}

			if ("root" in cfg && cfg.root) {
				cursorShape = "default";
			}

			if ("isAvailable" in cfg) {
				isAvailable = cfg.isAvailable;
			}

			if ("notAvailable" in cfg && cfg.notAvailable) {
				isAvailable = false;
				notAvailable = true;
			}



			let borderColor = "white";
			if (isAvailable === true && isAvailable !== "") {
				borderColor = "rgb(40, 163, 13";
			}
			else if (isAvailable === false && isAvailable !== "") {
				borderColor = "rgb(206, 78, 4)";
				cursorShape = "default";

				if (notAvailable === true) {
					borderColor = "blue";
				}
			}


			let hasChildren = false;
			if ("children" in cfg && cfg.children.length > 0)
				hasChildren = true;

			let AIFailed = false;
			if ("AIFailed" in cfg && cfg.AIFailed)
				AIFailed = true;

			if (borderColor !== "blue") {
				group.addShape('rect', {
					attrs: {
						width: 136,
						height: 117,
						stroke: borderColor,
						lineWidth: 2,
						radius: [0],
						justifyContent: "center",
						fill: "white"
					},
					name: 'container',
				});
			}
			else {
				group.addShape('rect', {
					attrs: {
						width: 136,
						height: 117,
						stroke: borderColor,
						lineWidth: 3,
						radius: [0],
						justifyContent: "center",
						fill: "white"
					},
					name: 'container',
				});
			}



			// if (borderColor) {
			// 	group.addShape('rect', {
			// 		attrs: {
			// 			width: 136,
			// 			height: 177,
			// 			stroke: "red",
			// 			lineWidth: 10,
			// 			radius: [0],
			// 			justifyContent: "center",
			// 			fill: "white"
			// 		},
			// 		name: 'colorContainer',
			// 	});
			// }
			// else if (selectedColor) {
			// 	group.addShape('rect', {
			// 		attrs: {
			// 			width: 136,
			// 			height: 177,
			// 			stroke: "blue",
			// 			lineWidth: 10,
			// 			radius: [0],
			// 			justifyContent: "center",
			// 			fill: "white"
			// 		},
			// 		name: 'colorContainer',
			// 	});
			// }


			// group.addShape('rect', {
			// 	attrs: {
			// 		width: 136,
			// 		height: 177,
			// 		stroke: "white",
			// 		radius: [0],
			// 		justifyContent: "center",
			// 		// fill: "white"
			// 	},
			// 	name: 'container',
			// });

			if (borderColor === "white") {
				group.addShape('rect', {
					attrs: {
						width: 136,
						height: 117,
						stroke: 'grey',
						lineWidth: 2,
						radius: [0],
						justifyContent: "center"
					},
					name: 'Image',
				});

				// group.addShape('rect', {
				// 	attrs: {
				// 		y: 117,
				// 		width: 136,
				// 		height: 20,
				// 		stroke: 'grey',
				// 		lineWidth: 2,
				// 		radius: [0],
				// 		justifyContent: "center",
				// 		fill: "white"
				// 	},
				// 	name: 'Text',
				// });
			}
			else {
				group.addShape('rect', {
					attrs: {
						width: 136,
						height: 117,
						// stroke: 'black',
						lineWidth: 2,
						radius: [0],
						justifyContent: "center"
					},
					name: 'Image',
				});

				// group.addShape('rect', {
				// 	attrs: {
				// 		y: 117,
				// 		width: 136,
				// 		height: 20,
				// 		stroke: borderColor,
				// 		lineWidth: 2,
				// 		radius: [0],
				// 		justifyContent: "center",
				// 		fill: "white"
				// 	},
				// 	name: 'Text',
				// });

				group.addShape("path", {
					attrs: {
						stroke: borderColor,
						path: [
							["M", 0, 117],
							["L", 136, 117],
							["Z"]
						]
					},
					name: "connectLine",
					lineWidth: 2,
				})
			}


			function createSVGElement(data) {
				var parser = new DOMParser();
				var doc = parser.parseFromString(data, "image/svg+xml");
				return doc.lastChild;
			}

			if ("imageSource" in cfg && cfg.imageSource !== "") {
				group.addShape("image", {
					attrs: {
						x: 1,
						y: 1,
						width: 134,
						height: 115,
						cursor: cursorShape,
						img: cfg.imageSource
					},
					name: "molecule"
				})
			}
			else {
				window
					.initRDKitModule()
					.then(function (RDKit) {
						// console.log("RDKit version: " + RDKit.version());
						var smiles = cfg.smiles;
						var mol = RDKit.get_mol(smiles);
						var svg = mol.get_svg();

						var svgObject = createSVGElement(svg);
						svgObject.setAttribute("height", "115");
						svgObject.setAttribute("width", "134");

						var svgString = new XMLSerializer().serializeToString(svgObject);

						// var objectParser = new DOMParser();
						// var svgObject = objectParser.parseFromString(svg, "image/svg+xml");
						// console.log("svg", svgObject);

						// let blob= new Blob([svg], {type: "image/svg+xml"});
						// let url = URL.createObjectURL(blob);


						// svgObject.setAttribute("height", 115);
						// svgObject.setAttribute("width", 134);
						// var svgString = new XMLSerializer().serializeToString(svgObject);

						var base64 = btoa(svg);
						var imgSource = `data:image/svg+xml;base64,${base64}`;

						group.addShape("image", {
							attrs: {
								x: 1,
								y: 1,
								width: 134,
								height: 115,
								cursor: cursorShape,
								img: imgSource
							},
							name: "molecule"
						})

						cfg.imageSource = imgSource

						// group.addShape("dom", {
						// 	attrs: {
						// 		x: 1,
						// 		y: 1,
						// 		width: 134,
						// 		height: 115,
						// 		cursor: cursorShape,
						// 		html: svgString
						// 	},
						// 	name: "molecule"
						// })

					})
					.catch((e) => {
						console.log("rdkit error", e);
					});
			}

			// window
			// 	.initRDKitModule()
			// 	.then(function (RDKit) {
			// 		// console.log("RDKit version: " + RDKit.version());
			// 		var smiles = cfg.smiles;
			// 		var mol = RDKit.get_mol(smiles);
			// 		var svg = mol.get_svg();

			// 		var svgObject = createSVGElement(svg);
			// 		svgObject.setAttribute("height", "115");
			// 		svgObject.setAttribute("width", "134");

			// 		var svgString = new XMLSerializer().serializeToString(svgObject);

			// 		// var objectParser = new DOMParser();
			// 		// var svgObject = objectParser.parseFromString(svg, "image/svg+xml");
			// 		// console.log("svg", svgObject);

			// 		// let blob= new Blob([svg], {type: "image/svg+xml"});
			// 		// let url = URL.createObjectURL(blob);


			// 		// svgObject.setAttribute("height", 115);
			// 		// svgObject.setAttribute("width", 134);
			// 		// var svgString = new XMLSerializer().serializeToString(svgObject);

			// 		var base64 = btoa(svg);
			// 		var imgSource = `data:image/svg+xml;base64,${base64}`;

			// 		group.addShape("image", {
			// 			attrs: {
			// 				x: 1,
			// 				y: 1,
			// 				width: 134,
			// 				height: 115,
			// 				cursor: cursorShape,
			// 				img: imgSource
			// 			},
			// 			name: "molecule"
			// 		})

			// 		// group.addShape("dom", {
			// 		// 	attrs: {
			// 		// 		x: 1,
			// 		// 		y: 1,
			// 		// 		width: 134,
			// 		// 		height: 115,
			// 		// 		cursor: cursorShape,
			// 		// 		html: svgString
			// 		// 	},
			// 		// 	name: "molecule"
			// 		// })

			// 	})
			// 	.catch((e) => {
			// 		console.log("rdkit error", e);
			// 	});


			// group.addShape("image", {
			// 	attrs: {
			// 		x: 1,
			// 		y: 1,
			// 		width: 134,
			// 		height: 115,
			// 		cursor: cursorShape,
			// 		img: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPScxLjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnIHdpZHRoPSczNS43OG1tJyBoZWlnaHQ9JzMwLjEybW0nIHZpZXdCb3g9JzAgMCAzNS43OCAzMC4xMic+CiAgPGRlc2M+R2VuZXJhdGVkIGJ5IHRoZSBDaGVtaXN0cnkgRGV2ZWxvcG1lbnQgS2l0IChodHRwOi8vZ2l0aHViLmNvbS9jZGspPC9kZXNjPgogIDxnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlPScjMDAwMDAwJyBzdHJva2Utd2lkdGg9Jy4yMScgZmlsbD0nI0ZGMEQwRCc+CiAgICA8cmVjdCB4PScuMCcgeT0nLjAnIHdpZHRoPSczNi4wJyBoZWlnaHQ9JzMxLjAnIGZpbGw9JyNGRkZGRkYnIHN0cm9rZT0nbm9uZScvPgogICAgPGcgaWQ9J21vbDEnIGNsYXNzPSdtb2wnPgogICAgICA8bGluZSBpZD0nbW9sMWJuZDEnIGNsYXNzPSdib25kJyB4MT0nMS40MScgeTE9JzE2LjM2JyB4Mj0nMS40MScgeTI9JzEyLjY2Jy8+CiAgICAgIDxnIGlkPSdtb2wxYm5kMicgY2xhc3M9J2JvbmQnPgogICAgICAgIDxsaW5lIHgxPSc2LjIyJyB5MT0nMTEuMScgeDI9JzEuNDEnIHkyPScxMi42NicvPgogICAgICAgIDxsaW5lIHgxPSc1LjkxJyB5MT0nMTIuMDYnIHgyPScyLjIzJyB5Mj0nMTMuMjUnLz4KICAgICAgPC9nPgogICAgICA8cGF0aCBpZD0nbW9sMWJuZDMnIGNsYXNzPSdib25kJyBkPSdNOS4xNSAxNS4yNmwuMTcgLS4xMmwtMi41NSAtNC4zMmwtLjYxIC4ybC0uNjUgLjIxeicgc3Ryb2tlPSdub25lJyBmaWxsPScjMDAwMDAwJy8+CiAgICAgIDxsaW5lIGlkPSdtb2wxYm5kNCcgY2xhc3M9J2JvbmQnIHgxPSc5LjI0JyB5MT0nMTUuMicgeDI9JzYuMjInIHkyPScxOS4zJy8+CiAgICAgIDxwYXRoIGlkPSdtb2wxYm5kNScgY2xhc3M9J2JvbmQnIGQ9J002LjE5IDE5LjRsLjA2IC0uMmwtMy40NCAtMS41MmwtLjE1IC40N2wtLjE1IC40N3onIHN0cm9rZT0nbm9uZScgZmlsbD0nIzAwMDAwMCcvPgogICAgICA8bGluZSBpZD0nbW9sMWJuZDYnIGNsYXNzPSdib25kJyB4MT0nNi4yMicgeTE9JzE5LjMnIHgyPSc4LjQzJyB5Mj0nMjIuMzInLz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQ3JyBjbGFzcz0nYm9uZCcgeDE9JzkuMjQnIHkxPScxNS4yJyB4Mj0nMTQuMDUnIHkyPScxNi43NicvPgogICAgICA8ZyBpZD0nbW9sMWJuZDgnIGNsYXNzPSdib25kJz4KICAgICAgICA8bGluZSB4MT0nMTQuMDUnIHkxPScxNi43NicgeDI9JzE0LjA1JyB5Mj0nMjEuODQnLz4KICAgICAgICA8bGluZSB4MT0nMTQuODYnIHkxPScxNy4yMycgeDI9JzE0Ljg2JyB5Mj0nMjEuMzcnLz4KICAgICAgPC9nPgogICAgICA8bGluZSBpZD0nbW9sMWJuZDknIGNsYXNzPSdib25kJyB4MT0nMTAuNDknIHkxPScyMy4wMicgeDI9JzE0LjA1JyB5Mj0nMjEuODQnLz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQxMCcgY2xhc3M9J2JvbmQnIHgxPScxNC4wNScgeTE9JzIxLjg0JyB4Mj0nMTguNDUnIHkyPScyNC4zOCcvPgogICAgICA8ZyBpZD0nbW9sMWJuZDExJyBjbGFzcz0nYm9uZCc+CiAgICAgICAgPGxpbmUgeDE9JzE4LjQ1JyB5MT0nMjQuMzgnIHgyPScyMi44NScgeTI9JzIxLjg0Jy8+CiAgICAgICAgPGxpbmUgeDE9JzE4LjQ1JyB5MT0nMjMuNDQnIHgyPScyMi4wNCcgeTI9JzIxLjM3Jy8+CiAgICAgIDwvZz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQxMicgY2xhc3M9J2JvbmQnIHgxPScyMi44NScgeTE9JzIxLjg0JyB4Mj0nMjYuMDcnIHkyPScyMy43Jy8+CiAgICAgIDxsaW5lIGlkPSdtb2wxYm5kMTMnIGNsYXNzPSdib25kJyB4MT0nMjcuMjUnIHkxPScyNS43NicgeDI9JzI3LjI1JyB5Mj0nMjkuNDYnLz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQxNCcgY2xhc3M9J2JvbmQnIHgxPScyMi44NScgeTE9JzIxLjg0JyB4Mj0nMjIuODUnIHkyPScxNi43NicvPgogICAgICA8ZyBpZD0nbW9sMWJuZDE1JyBjbGFzcz0nYm9uZCc+CiAgICAgICAgPGxpbmUgeDE9JzIyLjg1JyB5MT0nMTYuNzYnIHgyPScxOC40NScgeTI9JzE0LjIyJy8+CiAgICAgICAgPGxpbmUgeDE9JzIyLjA0JyB5MT0nMTcuMjMnIHgyPScxOC40NScgeTI9JzE1LjE2Jy8+CiAgICAgIDwvZz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQxNicgY2xhc3M9J2JvbmQnIHgxPScxNC4wNScgeTE9JzE2Ljc2JyB4Mj0nMTguNDUnIHkyPScxNC4yMicvPgogICAgICA8bGluZSBpZD0nbW9sMWJuZDE3JyBjbGFzcz0nYm9uZCcgeDE9JzE4LjQ1JyB5MT0nMTQuMjInIHgyPScxOC40NScgeTI9JzEwLjUyJy8+CiAgICAgIDxsaW5lIGlkPSdtb2wxYm5kMTgnIGNsYXNzPSdib25kJyB4MT0nMTkuNjMnIHkxPSc4LjQ2JyB4Mj0nMjIuODUnIHkyPSc2LjYnLz4KICAgICAgPGcgaWQ9J21vbDFibmQxOScgY2xhc3M9J2JvbmQnPgogICAgICAgIDxsaW5lIHgxPScyMi40NCcgeTE9JzYuODMnIHgyPScyMi40NCcgeTI9JzIuOScvPgogICAgICAgIDxsaW5lIHgxPScyMy4yNicgeTE9JzYuODMnIHgyPScyMy4yNicgeTI9JzIuOScvPgogICAgICA8L2c+CiAgICAgIDxsaW5lIGlkPSdtb2wxYm5kMjAnIGNsYXNzPSdib25kJyB4MT0nMjIuODUnIHkxPSc2LjYnIHgyPScyNy4yNScgeTI9JzkuMTQnLz4KICAgICAgPGcgaWQ9J21vbDFibmQyMScgY2xhc3M9J2JvbmQnPgogICAgICAgIDxsaW5lIHgxPScyNy4yNScgeTE9JzE0LjIyJyB4Mj0nMjcuMjUnIHkyPSc5LjE0Jy8+CiAgICAgICAgPGxpbmUgeDE9JzI2LjQ0JyB5MT0nMTMuNzUnIHgyPScyNi40NCcgeTI9JzkuNjEnLz4KICAgICAgPC9nPgogICAgICA8bGluZSBpZD0nbW9sMWJuZDIyJyBjbGFzcz0nYm9uZCcgeDE9JzIyLjg1JyB5MT0nMTYuNzYnIHgyPScyNy4yNScgeTI9JzE0LjIyJy8+CiAgICAgIDxsaW5lIGlkPSdtb2wxYm5kMjMnIGNsYXNzPSdib25kJyB4MT0nMjcuMjUnIHkxPScxNC4yMicgeDI9JzMyLjEnIHkyPScxNS44MScvPgogICAgICA8bGluZSBpZD0nbW9sMWJuZDI0JyBjbGFzcz0nYm9uZCcgeDE9JzMyLjEnIHkxPScxNS44MScgeDI9JzM1LjA4JyB5Mj0nMTEuNjgnLz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQyNScgY2xhc3M9J2JvbmQnIHgxPSczNS4wOCcgeTE9JzExLjY4JyB4Mj0nMzIuMScgeTI9JzcuNTgnLz4KICAgICAgPGxpbmUgaWQ9J21vbDFibmQyNicgY2xhc3M9J2JvbmQnIHgxPScyNy4yNScgeTE9JzkuMTQnIHgyPSczMi4xJyB5Mj0nNy41OCcvPgogICAgICA8ZyBpZD0nbW9sMWJuZDI3JyBjbGFzcz0nYm9uZCc+CiAgICAgICAgPGxpbmUgeDE9JzMxLjYyJyB5MT0nNy43MycgeDI9JzMyLjg0JyB5Mj0nMy45OCcvPgogICAgICAgIDxsaW5lIHgxPSczMi4zOScgeTE9JzcuOTknIHgyPSczMy42MicgeTI9JzQuMjMnLz4KICAgICAgPC9nPgogICAgICA8cGF0aCBpZD0nbW9sMWF0bTEnIGNsYXNzPSdhdG9tJyBkPSdNMS40MSAxNi45OXEtLjI3IC4wIC0uNDMgLjJxLS4xNiAuMiAtLjE2IC41NXEuMCAuMzUgLjE2IC41NXEuMTYgLjIgLjQzIC4ycS4yNyAuMCAuNDMgLS4ycS4xNiAtLjIgLjE2IC0uNTVxLjAgLS4zNSAtLjE2IC0uNTVxLS4xNiAtLjIgLS40MyAtLjJ6TTEuNDEgMTYuNzhxLjM5IC4wIC42MiAuMjZxLjIzIC4yNiAuMjMgLjdxLjAgLjQ0IC0uMjMgLjdxLS4yMyAuMjYgLS42MiAuMjZxLS4zOSAuMCAtLjYyIC0uMjZxLS4yMyAtLjI2IC0uMjMgLS43cS4wIC0uNDMgLjIzIC0uN3EuMjMgLS4yNiAuNjIgLS4yNnonIHN0cm9rZT0nbm9uZScvPgogICAgICA8cGF0aCBpZD0nbW9sMWF0bTYnIGNsYXNzPSdhdG9tJyBkPSdNOS4yNCAyMi42OHEtLjI3IC4wIC0uNDMgLjJxLS4xNiAuMiAtLjE2IC41NXEuMCAuMzUgLjE2IC41NXEuMTYgLjIgLjQzIC4ycS4yNyAuMCAuNDMgLS4ycS4xNiAtLjIgLjE2IC0uNTVxLjAgLS4zNSAtLjE2IC0uNTVxLS4xNiAtLjIgLS40MyAtLjJ6TTkuMjQgMjIuNDdxLjM5IC4wIC42MiAuMjZxLjIzIC4yNiAuMjMgLjdxLjAgLjQ0IC0uMjMgLjdxLS4yMyAuMjYgLS42MiAuMjZxLS4zOSAuMCAtLjYyIC0uMjZxLS4yMyAtLjI2IC0uMjMgLS43cS4wIC0uNDMgLjIzIC0uN3EuMjMgLS4yNiAuNjIgLS4yNnonIHN0cm9rZT0nbm9uZScvPgogICAgICA8cGF0aCBpZD0nbW9sMWF0bTExJyBjbGFzcz0nYXRvbScgZD0nTTI3LjI1IDIzLjYycS0uMjcgLjAgLS40MyAuMnEtLjE2IC4yIC0uMTYgLjU1cS4wIC4zNSAuMTYgLjU1cS4xNiAuMiAuNDMgLjJxLjI3IC4wIC40MyAtLjJxLjE2IC0uMiAuMTYgLS41NXEuMCAtLjM1IC0uMTYgLS41NXEtLjE2IC0uMiAtLjQzIC0uMnpNMjcuMjUgMjMuNDJxLjM5IC4wIC42MiAuMjZxLjIzIC4yNiAuMjMgLjdxLjAgLjQ0IC0uMjMgLjdxLS4yMyAuMjYgLS42MiAuMjZxLS4zOSAuMCAtLjYyIC0uMjZxLS4yMyAtLjI2IC0uMjMgLS43cS4wIC0uNDMgLjIzIC0uN3EuMjMgLS4yNiAuNjIgLS4yNnonIHN0cm9rZT0nbm9uZScvPgogICAgICA8cGF0aCBpZD0nbW9sMWF0bTE1JyBjbGFzcz0nYXRvbScgZD0nTTE4LjQ1IDguMzhxLS4yNyAuMCAtLjQzIC4ycS0uMTYgLjIgLS4xNiAuNTVxLjAgLjM1IC4xNiAuNTVxLjE2IC4yIC40MyAuMnEuMjcgLjAgLjQzIC0uMnEuMTYgLS4yIC4xNiAtLjU1cS4wIC0uMzUgLS4xNiAtLjU1cS0uMTYgLS4yIC0uNDMgLS4yek0xOC40NSA4LjE4cS4zOSAuMCAuNjIgLjI2cS4yMyAuMjYgLjIzIC43cS4wIC40NCAtLjIzIC43cS0uMjMgLjI2IC0uNjIgLjI2cS0uMzkgLjAgLS42MiAtLjI2cS0uMjMgLS4yNiAtLjIzIC0uN3EuMCAtLjQzIC4yMyAtLjdxLjIzIC0uMjYgLjYyIC0uMjZ6JyBzdHJva2U9J25vbmUnLz4KICAgICAgPHBhdGggaWQ9J21vbDFhdG0xNycgY2xhc3M9J2F0b20nIGQ9J00yMi44NSAuNzZxLS4yNyAuMCAtLjQzIC4ycS0uMTYgLjIgLS4xNiAuNTVxLjAgLjM1IC4xNiAuNTVxLjE2IC4yIC40MyAuMnEuMjcgLjAgLjQzIC0uMnEuMTYgLS4yIC4xNiAtLjU1cS4wIC0uMzUgLS4xNiAtLjU1cS0uMTYgLS4yIC0uNDMgLS4yek0yMi44NSAuNTZxLjM5IC4wIC42MiAuMjZxLjIzIC4yNiAuMjMgLjdxLjAgLjQ0IC0uMjMgLjdxLS4yMyAuMjYgLS42MiAuMjZxLS4zOSAuMCAtLjYyIC0uMjZxLS4yMyAtLjI2IC0uMjMgLS43cS4wIC0uNDMgLjIzIC0uN3EuMjMgLS4yNiAuNjIgLS4yNnonIHN0cm9rZT0nbm9uZScvPgogICAgICA8cGF0aCBpZD0nbW9sMWF0bTIzJyBjbGFzcz0nYXRvbScgZD0nTTMzLjY3IDIuMHEtLjI3IC4wIC0uNDMgLjJxLS4xNiAuMiAtLjE2IC41NXEuMCAuMzUgLjE2IC41NXEuMTYgLjIgLjQzIC4ycS4yNyAuMCAuNDMgLS4ycS4xNiAtLjIgLjE2IC0uNTVxLjAgLS4zNSAtLjE2IC0uNTVxLS4xNiAtLjIgLS40MyAtLjJ6TTMzLjY3IDEuNzlxLjM5IC4wIC42MiAuMjZxLjIzIC4yNiAuMjMgLjdxLjAgLjQ0IC0uMjMgLjdxLS4yMyAuMjYgLS42MiAuMjZxLS4zOSAuMCAtLjYyIC0uMjZxLS4yMyAtLjI2IC0uMjMgLS43cS4wIC0uNDMgLjIzIC0uN3EuMjMgLS4yNiAuNjIgLS4yNnonIHN0cm9rZT0nbm9uZScvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg=="
			// 	},
			// 	name: "molecule"
			// })


			if (mouseEnter) {
				// group.addShape('rect', {
				// 	attrs: {
				// 		x: 45,
				// 		y: 120,
				// 		width: 20,
				// 		height: 15,
				// 		// stroke: 'black',
				// 		radius: [0],
				// 		justifyContent: "center",
				// 	},
				// 	name: 'editMoleculeContainer',
				// });

				// group.addShape("image", {
				// 	attrs: {
				// 		x: 40,
				// 		y: 118,
				// 		width: 19,
				// 		height: 19,
				// 		img: "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJpY29uIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKICAgICAgICAgICAgdmlld0JveD0iMCAwIDMyIDMyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMiAzMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgogICAgICAgICAgICA8cmVjdCB4PSIyIiB5PSIyNiIgd2lkdGg9IjI4IiBoZWlnaHQ9IjIiIGZpbGw9IiMwZjYyZmUiLz4KICAgICAgICAgICAgPHBhdGggZD0iTTI1LjQsOWMwLjgtMC44LDAuOC0yLDAtMi44YzAsMCwwLDAsMCwwbC0zLjYtMy42Yy0wLjgtMC44LTItMC44LTIuOCwwYzAsMCwwLDAsMCwwbC0xNSwxNVYyNGg2LjRMMjUuNCw5eiBNMjAuNCw0TDI0LDcuNgogICAgICAgICAgICAgIGwtMywzTDE3LjQsN0wyMC40LDR6IE02LDIydi0zLjZsMTAtMTBsMy42LDMuNmwtMTAsMTBINnoiCiAgICAgICAgICAgICAgZmlsbD0iIzBmNjJmZSIvPgogICAgICAgICAgICA8L3N2Zz4="
				// 	},
				// 	name: "editMolecule"
				// })

				// group.addShape('rect', {
				// 	attrs: {
				// 		x: 75,
				// 		y: 120,
				// 		width: 20,
				// 		height: 15,
				// 		// stroke: 'black',
				// 		radius: [0],
				// 		justifyContent: "center",
				// 		// fill: "blue"
				// 	},
				// 	name: 'deleteMoleculeContainer',
				// });

				// group.addShape("image", {
				// 	attrs: {
				// 		x: 80,
				// 		y: 118,
				// 		width: 19,
				// 		height: 19,
				// 		img: "data:image/svg+xml;base64,PHN2ZyBpZD0iaWNvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzIgMzIiPjxyZWN0IGZpbGw9IiMwZjYyZmUiIHg9IjEyIiB5PSIxMiIgd2lkdGg9IjIiIGhlaWdodD0iMTIiLz48cmVjdCBmaWxsPSIjMGY2MmZlIiB4PSIxOCIgeT0iMTIiIHdpZHRoPSIyIiBoZWlnaHQ9IjEyIi8+PHBhdGggZmlsbD0iIzBmNjJmZSIgZD0iTTQsNlY4SDZWMjhhMiwyLDAsMCwwLDIsMkgyNGEyLDIsMCwwLDAsMi0yVjhoMlY2Wk04LDI4VjhIMjRWMjhaIi8+PHJlY3QgZmlsbD0iIzBmNjJmZSIgeD0iMTIiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjIiLz48L3N2Zz4="
				// 	},
				// 	name: "deleteMolecule"
				// })

			}
			else if ("failureCause" in cfg) {
				group.addShape("image", {
					attrs: {
						x: 15,
						y: 119,
						width: 17,
						height: 17,
						img: priceIcon
					},
					name: "priceIcon"
				})
				group.addShape("image", {
					attrs: {
						x: 43,
						y: 119,
						width: 17,
						height: 17,
						img: stepIcon
					},
					name: "stepIcon"
				})
				group.addShape("image", {
					attrs: {
						x: 72,
						y: 119,
						width: 17,
						height: 17,
						img: moleculeIcon
					},
					name: "moleculeIcon"
				})
				group.addShape("image", {
					attrs: {
						x: 104,
						y: 119,
						width: 17,
						height: 17,
						img: substructureIcon
					},
					name: "substructureIcon"
				})

				// console.log("failureCause", cfg.failureCause);
				if (cfg.failureCause.includes("expensive")) {
					console.log("expensive");
					group.addShape("image", {
						attrs: {
							x: 15,
							y: 119,
							width: 17,
							height: 17,
							img: clearIcon,
						},
						name: "clearIcon"
					})
				}
				else if (cfg.failureCause.includes("step")) {
					console.log("step");
					group.addShape("image", {
						attrs: {
							x: 43,
							y: 119,
							width: 17,
							height: 17,
							img: clearIcon
						},
						name: "clearIcon"
					})
				}
				else if (cfg.failureCause.includes("molecule")) {
					group.addShape("image", {
						attrs: {
							x: 72,
							y: 119,
							width: 17,
							height: 17,
							img: clearIcon
						},
						name: "clearIcon"
					})
				}
				else if (cfg.failureCause.includes("substructure")) {
					console.log("substructure");
					group.addShape("image", {
						attrs: {
							x: 104,
							y: 119,
							width: 17,
							height: 17,
							img: clearIcon
						},
						name: "clearIcon"
					})
				}

			}


			// console.log("cfg", cfg);

			if ((hasChildren || AIFailed) && (("isAI" in cfg) == false) || (cfg.isAI == false)) {
				group.addShape('rect', {
					attrs: {
						y: 137,
						width: 136,
						height: 20,
						// stroke: 'black',
						radius: [10],
						justifyContent: "center",
						fill: (reviseSelected) ? "#ffcc66" : "#0f62fe"
					},
					name: 'Buttons',
				});

				let lineWidth = 4;
				let topPointY = 120;
				if (AIFailed) {
					lineWidth = 1.1;
					topPointY = 118;
				}
				else if (hasChildren) {
					cfg.children.forEach(child => {
						if ("isAI" in child && child.isAI == true) {
							lineWidth = 1.1;
							topPointY = 118;
						}
					});
				}

				group.addShape("path", {
					attrs: {
						stroke: "#0f62fe",
						lineWidth: lineWidth,
						path: [
							["M", 68, 137],
							["L", 68, topPointY],
							["Z"]
						]
					},
					name: "connectLine"
				})


				group.addShape("path", {
					attrs: {
						stroke: "#0f62fe",
						lineWidth: lineWidth,
						path: [
							["M", 74, 125],
							["L", 68, topPointY],
							["L", 62, 125],
							["Z"]
						],
						fill: "#0f62fe"
					},
					name: "connectLineArrowLeft"
				})

				group.addShape("rect", {
					attrs: {
						x: 45,
						y: 138,
						width: 20,
						// height: 15,
						// stroke: "black",
						justifyContent: "center",
						// fill: "blue"
					},
					name: "deleteButtonContainer"
				})

				group.addShape("image", {
					attrs: {
						x: 40,
						y: 138,
						width: 19,
						height: 19,
						img: "data:image/svg+xml;base64,PHN2ZyBmb2N1c2FibGU9ImZhbHNlIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDMyIDMyIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9IndpbGwtY2hhbmdlOiB0cmFuc2Zvcm07Ij4KICAgICAgICAgICAgICA8cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTIgMjdoMjh2Mkgyek0yNS40MSA5YTIgMiAwIDAgMCAwLTIuODNsLTMuNTgtMy41OGEyIDIgMCAwIDAtMi44MyAwbC0xNSAxNVYyNGg2LjQxem0tNS01TDI0IDcuNTlsLTMgM0wxNy40MSA3ek02IDIydi0zLjU5bDEwLTEwTDE5LjU5IDEybC0xMCAxMHoiLz4KICAgICAgICAgICAgPC9zdmc+"
					},
					name: "deleteButton"
				})


				group.addShape("rect", {
					attrs: {
						x: 75,
						y: 138,
						width: 20,
						height: 15,
						// stroke: "black",
						justifyContent: "center",
						// fill: "blue"
					},
					name: "expandButtonContainer"
				})

				group.addShape("image", {
					attrs: {
						x: 80, // 80 - 99
						y: 138, // 158 - 177
						width: 19,
						height: 19,
						img: "data:image/svg+xml;base64,PHN2ZyBpZD0iaWNvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgogICAgICAgICAgICAgIDxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDpub25lO308L3N0eWxlPjwvZGVmcz4KICAgICAgICAgICAgICA8cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTI4LDEyYTIsMiwwLDAsMCwyLTJWNGEyLDIsMCwwLDAtMi0ySDRBMiwyLDAsMCwwLDIsNHY2YTIsMiwwLDAsMCwyLDJIMTV2NEg5YTIsMiwwLDAsMC0yLDJ2NEg0YTIsMiwwLDAsMC0yLDJ2NGEyLDIsMCwwLDAsMiwyaDhhMiwyLDAsMCwwLDItMlYyNGEyLDIsMCwwLDAtMi0ySDlWMThIMjN2NEgyMGEyLDIsMCwwLDAtMiwydjRhMiwyLDAsMCwwLDIsMmg4YTIsMiwwLDAsMCwyLTJWMjRhMiwyLDAsMCwwLTItMkgyNVYxOGEyLDIsMCwwLDAtMi0ySDE3VjEyWk0xMiwyOEg0VjI0aDhabTE2LDBIMjBWMjRoOFpNNCw0SDI4djZINFoiLz4KICAgICAgICAgICAgICA8cmVjdCBpZD0iX1RyYW5zcGFyZW50X1JlY3RhbmdsZV8iIGRhdGEtbmFtZT0iJmx0O1RyYW5zcGFyZW50IFJlY3RhbmdsZSZndDsiIGNsYXNzPSJjbHMtMSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIi8+CiAgICAgICAgICAgIDwvc3ZnPg=="
					},
					name: "expandButton"
				})

			}
			// else if (isAvailable === false || isAvailable == "") {
			// 	group.addShape('rect', {
			// 		attrs: {
			// 			y: 157,
			// 			width: 136,
			// 			height: 20,
			// 			lineWidth: 2,
			// 			// stroke: 'black',
			// 			radius: [10],
			// 			justifyContent: "center",
			// 			fill: "#0f62fe"
			// 		},
			// 		name: 'Buttons',
			// 	});

			// 	group.addShape("path", {
			// 		attrs: {
			// 			stroke: "#0f62fe",
			// 			// lineWidth: 2,
			// 			path: [
			// 				["M", 68, 157],
			// 				["L", 68, 137],
			// 				["Z"]
			// 			]
			// 		},
			// 		name: "connectLine"
			// 	})


			// 	// group.addShape("path", {
			// 	// 	attrs: {
			// 	// 		stroke: "#0f62fe",
			// 	// 		lineWidth: 1.1,
			// 	// 		path: [
			// 	// 			["M", 74, 145],
			// 	// 			["L", 68, 137],
			// 	// 			["L", 62, 145],
			// 	// 			["Z"]
			// 	// 		],
			// 	// 		fill: "#0f62fe"
			// 	// 	},
			// 	// 	name: "connectLineArrowLeft"
			// 	// })

			// 	group.addShape("rect", {
			// 		attrs: {
			// 			x: 45,
			// 			y: 158,
			// 			width: 20,
			// 			// height: 15,
			// 			stroke: "black",
			// 			justifyContent: "center",
			// 			// fill: "blue"
			// 		},
			// 		name: "deleteButtonContainer"
			// 	})

			// 	group.addShape("image", {
			// 		attrs: {
			// 			x: 40,
			// 			y: 158,
			// 			width: 19,
			// 			height: 19,
			// 			img: "data:image/svg+xml;base64,PHN2ZyBmb2N1c2FibGU9ImZhbHNlIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDMyIDMyIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9IndpbGwtY2hhbmdlOiB0cmFuc2Zvcm07Ij4KICAgICAgICAgICAgICA8cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTIgMjdoMjh2Mkgyek0yNS40MSA5YTIgMiAwIDAgMCAwLTIuODNsLTMuNTgtMy41OGEyIDIgMCAwIDAtMi44MyAwbC0xNSAxNVYyNGg2LjQxem0tNS01TDI0IDcuNTlsLTMgM0wxNy40MSA3ek02IDIydi0zLjU5bDEwLTEwTDE5LjU5IDEybC0xMCAxMHoiLz4KICAgICAgICAgICAgPC9zdmc+"
			// 		},
			// 		name: "deleteButton"
			// 	})


			// 	group.addShape("rect", {
			// 		attrs: {
			// 			x: 75,
			// 			y: 158,
			// 			width: 20,
			// 			height: 15,
			// 			// stroke: "black",
			// 			justifyContent: "center",
			// 			// fill: "blue"
			// 		},
			// 		name: "expandButtonContainer"
			// 	})

			// 	group.addShape("image", {
			// 		attrs: {
			// 			x: 80, // 80 - 99
			// 			y: 158, // 158 - 177
			// 			width: 19,
			// 			height: 19,
			// 			img: "data:image/svg+xml;base64,PHN2ZyBpZD0iaWNvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgogICAgICAgICAgICAgIDxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDpub25lO308L3N0eWxlPjwvZGVmcz4KICAgICAgICAgICAgICA8cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTI4LDEyYTIsMiwwLDAsMCwyLTJWNGEyLDIsMCwwLDAtMi0ySDRBMiwyLDAsMCwwLDIsNHY2YTIsMiwwLDAsMCwyLDJIMTV2NEg5YTIsMiwwLDAsMC0yLDJ2NEg0YTIsMiwwLDAsMC0yLDJ2NGEyLDIsMCwwLDAsMiwyaDhhMiwyLDAsMCwwLDItMlYyNGEyLDIsMCwwLDAtMi0ySDlWMThIMjN2NEgyMGEyLDIsMCwwLDAtMiwydjRhMiwyLDAsMCwwLDIsMmg4YTIsMiwwLDAsMCwyLTJWMjRhMiwyLDAsMCwwLTItMkgyNVYxOGEyLDIsMCwwLDAtMi0ySDE3VjEyWk0xMiwyOEg0VjI0aDhabTE2LDBIMjBWMjRoOFpNNCw0SDI4djZINFoiLz4KICAgICAgICAgICAgICA8cmVjdCBpZD0iX1RyYW5zcGFyZW50X1JlY3RhbmdsZV8iIGRhdGEtbmFtZT0iJmx0O1RyYW5zcGFyZW50IFJlY3RhbmdsZSZndDsiIGNsYXNzPSJjbHMtMSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIi8+CiAgICAgICAgICAgIDwvc3ZnPg=="
			// 		},
			// 		name: "expandButton"
			// 	})
			// }


			const keyShape = group;

			// this.drawLinkPoints(cfg, group);
			return keyShape;
		},
		getAnchorPoints() {
			return [
				[0.5, 0], // 左侧中间
				[0.5, 1], // 右侧中间
			];
		}
	},
	"single-node"
);
