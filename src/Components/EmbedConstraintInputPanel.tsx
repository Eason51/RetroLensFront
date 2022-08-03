import React from 'react';
import { ConstraintInput } from '../RetroLens_Components/ConstraintInput';

import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

import TextField from '@mui/material/TextField';
import { propTypes } from 'react-bootstrap/esm/Image';



const Checkbox = ({ children, ...props }: JSX.IntrinsicElements['input']) => (
	<label style={{ marginRight: '1em' }}>
		<input type="checkbox" {...props}
			style={{ marginRight: "5px", opacity: "1", position: "initial" }}
		/>
		{children}
	</label>
);


interface ConstraintInputPanelState {
	price: number;
	mssr: number;
	excludeSubstructure: string | null;
	excludeSmiles: string | null;

	isAll: boolean;
	isPrice: boolean;
	isStep: boolean;
	isSubstructure: boolean;
	isMolecule: boolean;
}

const Input = styled('input')({
	display: 'none',
});

class EmbedConstraintInputPanel extends
	React.Component<any, ConstraintInputPanelState> {

	constructor(props: any) {
		super(props);

		this.state = {
			price: ("price" in props.currentConstraints && props.currentConstraints.price !== null) ?
				props.currentConstraints.price : 1000,
			mssr: ("mssr" in props.currentConstraints && props.currentConstraints.mssr !== null) ?
				props.currentConstraints.mssr : 3,
			excludeSubstructure: ("excludeSubstructure" in props.currentConstraints
				&& props.currentConstraints.excludeSubstructure !== null) ?
				props.currentConstraints.excludeSubstructure : null,
			excludeSmiles: ("excludeSmiles" in props.currentConstraints
				&& props.currentConstraints.excludeSmiles != null) ?
				props.currentConstraints.excludeSmiles : null,

			isAll: false,
			isPrice: "price" in props.currentConstraints && props.currentConstraints.price !== null,
			isStep: "mssr" in props.currentConstraints && props.currentConstraints.mssr !== null,
			isSubstructure: "excludeSubstructure" in props.currentConstraints
				&& props.currentConstraints.excludeSubstructure !== null,
			isMolecule: "excludeSmiles" in props.currentConstraints
				&& props.currentConstraints.excludeSmiles !== null,
		}

		this.constraintInputCallback = this.constraintInputCallback.bind(this);
	}


	toggleAll = () => {
		this.setState((state) => ({ isAll: !state.isAll }));

		if (!this.state.isAll) {
			if (!this.state.isPrice)
				this.togglePrice();
			if (!this.state.isStep)
				this.toggleStep();
			if (!this.state.isSubstructure)
				this.toggleSubstructure();
			if (!this.state.isMolecule)
				this.toggleMolecule();
		}
		else {
			if (this.state.isPrice)
				this.togglePrice();
			if (this.state.isStep)
				this.toggleStep();
			if (this.state.isSubstructure)
				this.toggleSubstructure();
			if (this.state.isMolecule)
				this.toggleMolecule();
		}

	}

	togglePrice = () => {
		this.setState((state) => ({
			isPrice: !state.isPrice,
			price: 1000
		}));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleStep = () => {
		this.setState((state) => ({
			isStep: !state.isStep,
			mssr: 3,
		}));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleSubstructure = () => {
		this.setState((state) => ({
			isSubstructure: !state.isSubstructure,
			excludeSubstructure: null
		}));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleMolecule = () => {
		this.setState((state) => ({
			isMolecule: !state.isMolecule,
			excludeSmiles: null
		}));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}



	componentDidUpdate(prevProps: {}, prevState: {}, snapshot: {}) {

		if (this.state != prevState) {

			const price = this.state.isPrice ? this.state.price : null;
			const mssr = this.state.isStep ? this.state.mssr : null;
			const excludeSubstructure = (this.state.isSubstructure
				&& this.state.excludeSubstructure !== "") ? this.state.excludeSubstructure : null;
			const excludeSmiles = (this.state.isMolecule && this.state.excludeSmiles !== "")
				? this.state.excludeSmiles : null;


			// this.props.updateConstraintFromPanel(this.state.price,
			// 	this.state.mssr, this.state.excludeSubstructure, this.state.excludeSmiles);
			this.props.updateConstraintFromPanel(price, mssr, excludeSubstructure, excludeSmiles);
		}

	}

	constraintInputCallback(label: string, value: number | string | number[]) {

		if (label === "Price Threshold for Molecules") {
			this.setState({
				price: Number(value)
			});
		}
		else if (label === "Maximum Retrosynthetic Steps") {
			this.setState({
				mssr: Number(value)
			})
		}
	}

	handleTextFieldChange(event: any, smilesType: string) {
		if (smilesType === "substructure") {
			this.setState({
				excludeSubstructure: event.target.value
			});
		}
		else if (smilesType === "smiles") {
			this.setState({
				excludeSmiles: event.target.value
			});
		}
	}

	render() {

		const currentConstraints = this.props.currentConstraints;

		const PriceInput =
			<Grid item>
				<ConstraintInput
					label={"Price Threshold for Molecules"}
					lowerLimit={1}
					higherLimit={1000}
					defaultValue={this.state.price}
					callback={this.constraintInputCallback}
					id={1}
					key={1}
				/>
			</Grid>

		const StepInput = <Grid item>
			<ConstraintInput
				label={"Maximum Retrosynthetic Steps"}
				lowerLimit={2}
				higherLimit={15}
				defaultValue={this.state.mssr}
				callback={this.constraintInputCallback}
				id={2}
				key={2}
			/>
		</Grid>

		const SubstructureInput = <Grid item>
			<TextField
				fullWidth
				id="outlined-read-only-input"
				label="Exclude Substructure ( please input substructure smiles, seperate with '.' )"
				onChange={(event) => this.handleTextFieldChange(event, "substructure")}
				value={this.state.excludeSubstructure}
			/>
		</Grid>

		const MoleculeInput = <Grid item>
			<TextField
				fullWidth
				id="outlined-read-only-input"
				label="Exclude Molecule ( please input molecule smiles, seperate with '.' )"
				onChange={(event) => this.handleTextFieldChange(event, "smiles")}
				value={this.state.excludeSmiles}
			/>
		</Grid>


		let inputList = [];

		if (this.state.isPrice) {
			inputList.push(PriceInput);
			// console.log("price", PriceInput);
		}

		if (this.state.isStep) {
			inputList.push(StepInput);
			// console.log("step", StepInput);
		}

		if (this.state.isSubstructure)
			inputList.push(SubstructureInput);



		if (this.state.isMolecule)
			inputList.push(MoleculeInput);

		// console.log("inputList", inputList);

		return (

			<Grid container spacing={2} wrap="nowrap" flexDirection="column">
				<Grid item>
					<div
						style={{
							// color: 'hsl(0, 0%, 40%)',
							display: 'inline-block',
							fontSize: 17,
							// fontStyle: 'italic',	
							marginTop: '1em',
						}}
					>
						{/* <Col>
							<Checkbox checked={this.state.isAll} onChange={this.toggleAll}>
								All
							</Checkbox>
						</Col> */}

						<Checkbox checked={this.state.isPrice} onChange={this.togglePrice}>
							Price Threshold
						</Checkbox>
						<Checkbox checked={this.state.isStep} onChange={this.toggleStep}>
							Maximum Steps
						</Checkbox>
						<Checkbox checked={this.state.isSubstructure} onChange={this.toggleSubstructure}>
							Exclude Substructure(s)
						</Checkbox>
						<Checkbox checked={this.state.isMolecule} onChange={this.toggleMolecule}>
							Exclude Molecule(s)
						</Checkbox>
					</div>
				</Grid>

				{inputList}

			</Grid>

		);
	}
}








export { EmbedConstraintInputPanel }