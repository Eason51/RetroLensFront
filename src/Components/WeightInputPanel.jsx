import React from 'react';
import { ConstraintInput } from '../RetroLens_Components/ConstraintInput';

import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

import TextField from '@mui/material/TextField';
import { propTypes } from 'react-bootstrap/esm/Image';


const Checkbox = ({ children, ...props }) => (
	<label style={{ marginRight: '1em' }}>
		<input type="checkbox" {...props}
			style={{ marginRight: "5px" }}
		/>
		{children}
	</label>
);


class WeightInputPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			price: ("price" in props.currentConstraints && props.currentConstraints.price !== 0) ?
				props.currentConstraints.price : 0,
			mssr: ("mssr" in props.currentConstraints && props.currentConstraints.mssr) ?
				props.currentConstraints.mssr : 3,

			isPrice: "price" in props.currentConstraints && props.currentConstraints.price !== 0,
			isStep: "mssr" in props.currentConstraints && props.currentConstraints.mssr,
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
		}
		else {
			if (this.state.isPrice)
				this.togglePrice();
			if (this.state.isStep)
				this.toggleStep();
		}

	}

	togglePrice = () => {
		this.setState((state) => ({ isPrice: !state.isPrice }));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}
	toggleStep = () => {
		this.setState((state) => ({ isStep: !state.isStep }));
		if (this.state.isAll)
			this.setState((state) => ({ isAll: !state.isAll }));
	}


	componentDidUpdate(prevProps, prevState, snapshot) {

		if (this.state != prevState) {
			this.props.updateConstraintFromPanel(
				this.state.price,
				this.state.mssr
			);
		}

	}

	constraintInputCallback(label, value) {

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


	render() {

		const currentConstraints = this.props.currentConstraints;

		const PriceInput =
			<Grid item>
				<ConstraintInput
					label={"Price Threshold for Molecules"}
					lowerLimit={1}
					higherLimit={1000}
					defaultValue={currentConstraints.price}
					callback={this.constraintInputCallback}
				/>
			</Grid>

		const StepInput = <Grid item>
			<ConstraintInput
				label={"Maximum Retrosynthetic Steps"}
				lowerLimit={2}
				higherLimit={15}
				defaultValue={currentConstraints.mssr}
				callback={this.constraintInputCallback}
			/>
		</Grid>


		let inputList = [];

		if (this.state.isPrice) {
			inputList.push(PriceInput);
		}

		if (this.state.isStep) {
			inputList.push(StepInput);
		}


		return (

			<Grid container spacing={2} wrap="nowrap" flexDirection="column">
				<Grid item>
					<div
						style={{
							display: 'inline-block',
							fontSize: 17,
							marginTop: '1em',
						}}
					>

						<Checkbox checked={this.state.isPrice} onChange={this.togglePrice}>
							Price Threshold
						</Checkbox>
						<Checkbox checked={this.state.isStep} onChange={this.toggleStep}>
							Maximum Steps
						</Checkbox>
					</div>
				</Grid>

				{inputList}

			</Grid>

		);
	}
}

export { WeightInputPanel }