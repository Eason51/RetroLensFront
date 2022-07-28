import React from 'react';
import { ConstraintInput } from "./ConstraintInput";

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import VolumeUp from '@mui/icons-material/VolumeUp';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Stack from '@mui/material/Stack';

import { Routes, Route, Link } from "react-router-dom";
import MainBlock from './MainBlock';

import { useContext } from 'react';
import GlobalContext from '../Context/context';
// @ts-ignore
import Select from 'react-select';
import { Col } from 'react-bootstrap';


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

class ConstraintInputPanel extends
	React.Component<any, ConstraintInputPanelState> {

	constructor(props: any) {
		super(props);

		this.state = {
			price: 1,
			mssr: 3,
			excludeSubstructure: null,
			excludeSmiles: null,

			isAll: false,
			isPrice: true,
			isStep: true,
			isSubstructure: false,
			isMolecule: false,
		}

		this.constraintInputCallback = this.constraintInputCallback.bind(this);

		props.updateConstraintFromPanel(this.state.price,
			this.state.mssr, this.state.excludeSubstructure, this.state.excludeSmiles);
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
			price: 1
		}));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleStep = () => {
		this.setState((state) => ({
			isStep: !state.isStep,
			mssr: 3
		}));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleSubstructure = () => {
		this.setState((state) => ({ isSubstructure: !state.isSubstructure,
			excludeSubstructure: null }));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleMolecule = () => {
		this.setState((state) => ({ isMolecule: !state.isMolecule,
			excludeSmiles: null }));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}



	componentDidUpdate(prevProps: {}, prevState: {}, snapshot: {}) {

		if (this.state != prevState) {
			this.props.updateConstraintFromPanel(this.state.price,
				this.state.mssr, this.state.excludeSubstructure, this.state.excludeSmiles);
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

		const PriceInput =
			<Grid item>
				<ConstraintInput
					label={"Price Threshold for Molecules"}
					lowerLimit={1}
					higherLimit={1000}
					defaultValue={1}
					callback={this.constraintInputCallback}
				/>
			</Grid>

		const StepInput = <Grid item>
			<ConstraintInput
				label={"Maximum Retrosynthetic Steps"}
				lowerLimit={2}
				higherLimit={15}
				defaultValue={3}
				callback={this.constraintInputCallback}
			/>
		</Grid>

		const SubstructureInput = <Grid item>
			<TextField
				fullWidth
				id="outlined-read-only-input"
				label="Exclude Substructure ( please input substructure smiles, seperate with '.' )"
				onChange={(event) => this.handleTextFieldChange(event, "substructure")}
			/>
		</Grid>

		const MoleculeInput = <Grid item>
			<TextField
				fullWidth
				id="outlined-read-only-input"
				label="Exclude Molecule ( please input molecule smiles, seperate with '.' )"
				onChange={(event) => this.handleTextFieldChange(event, "smiles")}
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

						<Checkbox disabled={true} checked={true} onChange={this.togglePrice}
						>
							Price Threshold
						</Checkbox>
						<Checkbox disabled={true} checked={true} onChange={this.toggleStep}>
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








export { ConstraintInputPanel }