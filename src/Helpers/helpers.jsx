const parseObj = (obj) => {
	let routeName = obj.smiles;
	let routeAttributes = {
		confidence: obj.confidence,
		// imageURL: "../logo.svg",
		isExpandable: obj.isExpandable,
		isCommercial: obj.isCommercial,
		userSelected: false
	}

	let routeChildren = [];
	obj.children.forEach(element => {
		routeChildren.push(parseObj(element));
	});

	return {
		smiles: routeName,
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

export {parseObj, parseRoute};