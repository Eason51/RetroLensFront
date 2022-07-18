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




interface ConstraintInputPanelState {
	price: number;
	mssr: number;
	excludeSubstructure: string | null;
	excludeSmiles: string | null;
}

const Input = styled('input')({
	display: 'none',
});

class ConstraintInputPanel extends
	React.Component<any, ConstraintInputPanelState> {

	constructor(props: {}) {
		super(props);

		this.state = {
			price: 0,
			mssr: 3,
			excludeSubstructure: null,
			excludeSmiles: null
		}

		this.constraintInputCallback = this.constraintInputCallback.bind(this);
	}

	componentDidUpdate(prevProps: {}, prevState: {}, snapshot: {}) {

		if (this.state != prevState) {
			this.props.updateConstraintFromPanel(this.state.price,
				this.state.mssr, this.state.excludeSubstructure, this.state.excludeSmiles);
		}

		console.log(this.state);
	}

	constraintInputCallback(label: string, value: number | string | number[]) {
		if (label === "USD per g/mL") {
			this.setState({
				price: Number(value)
			});
		}
		else if (label === "MSSR") {
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

		return (

			<Grid container spacing={2} wrap="nowrap" flexDirection="column">
				<Grid item>
					<ConstraintInput
						label={"Price Threshold for Molecules"}
						lowerLimit={0}
						higherLimit={1000}
						defaultValue={0}
						callback={this.constraintInputCallback}
					/>
				</Grid>
				<Grid item>
					<ConstraintInput
						label={"Maximum Retrosynthetic Steps"}
						lowerLimit={2}
						higherLimit={15}
						defaultValue={3}
						callback={this.constraintInputCallback}
					/>
				</Grid>
				<Grid item>
					<TextField
						fullWidth
						id="outlined-read-only-input"
						label="Exclude Substructure"
						onChange={(event) => this.handleTextFieldChange(event, "substructure")}
					/>

				</Grid>
				<Grid item>
					<TextField
						fullWidth
						id="outlined-read-only-input"
						label="Exclude Molecule"
						onChange={(event) => this.handleTextFieldChange(event, "smiles")}
					/>

				</Grid>
			</Grid>

		);
	}
}








export { ConstraintInputPanel }