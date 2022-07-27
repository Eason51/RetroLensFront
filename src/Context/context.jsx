import { createContext } from "react";

const GlobalContext = createContext(
	{
		targetMolecule: "",
		updateTargetMolecule: () => {},
		constraints: {},
		updateConstraints: () => {},
		treeData: {},
		updateTreeData: () => {},
		treeGraph: {},
		updateTreeGraph: () => {},
		revisePromise: {},
		updateRevisePromise: () => {},
		confidence : -1,
		updateConfidence: () => {},
		serverIp: ""
	}
);

export default GlobalContext;