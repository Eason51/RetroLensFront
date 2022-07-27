import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// import App from "./App";
import reportWebVitals from "./reportWebVitals";
import MainBlock from "./RetroLens_Components/MainBlock";
// import MainBlock from "./components_fake/MainBlock";
// import MainBlock from "./components_CNS/MainBlock";

import { ConstraintInputPanel } from "./RetroLens_Components/ConstraintInputPanel";
import { MainInterface } from "./Components/MainInterface";




ReactDOM.render(

	// <React.StrictMode>
	<div>
		<div>
			<MainInterface />
		</div>
		<div>
			{/* <MainBlock /> */}
		</div>
		<div>
			{/* <ConstraintInputPanel></ConstraintInputPanel> */}
		</div>
	</div>
	// </React.StrictMode>

	,
	document.getElementById("main")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

