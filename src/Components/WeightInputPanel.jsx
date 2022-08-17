import React from 'react';
import { ConstraintInput } from '../RetroLens_Components/ConstraintInput';

import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

import TextField from '@mui/material/TextField';
import { propTypes } from 'react-bootstrap/esm/Image';


const Checkbox = ({ children, ...props }) => (
	<label style={{ marginRight: '1em' }}>
		<input type="checkbox" {...props}
			style={{ marginRight: "5px", opacity: "1", position: "initial" }}
		/>
		{children}
	</label>
);



class WeightInputPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			influence: ("influence" in props.currentWeights && props.currentWeights.influence) ?
				props.currentWeights.influence : null,
			complexity: ("complexity" in props.currentWeights && props.currentWeights.complexity) ?
				props.currentWeights.complexity : null,
			convergence: ("convergence" in props.currentWeights && props.currentWeights.convergence) ?
				props.currentWeights.convergence : null,
			reactionConfidence: ("reactionConfidence" in props.currentWeights && props.currentWeights.reactionConfidence) ?
				props.currentWeights.reactionConfidence : null,
			associatedSubtreeConfidence: ("associatedSubtreeConfidence" in props.currentWeights
				&& props.currentWeights.associatedSubtreeConfidence) ?
				props.currentWeights.associatedSubtreeConfidence : null,

			isInfluence: "influence" in props.currentWeights && props.currentWeights.influence !== null
				&& props.currentWeights.influence !== -1,
			isComplexity: "complexity" in props.currentWeights && props.currentWeights.complexity !== null
				&& props.currentWeights.complexity !== -1,
			isConvergence: "convergence" in props.currentWeights && props.currentWeights.convergence !== null
				&& props.currentWeights.convergence !== -1,
			isReactionConfidence: "reactionConfidence" in props.currentWeights && props.currentWeights.reactionConfidence !== null
				&& props.currentWeights.reactionConfidence !== -1,
			isAssociatedSubtreeConfidence: "associatedSubtreeConfidence" in props.currentWeights
				&& props.currentWeights.associatedSubtreeConfidence !== null
				&& props.currentWeights.associatedSubtreeConfidence !== -1
		}

		this.weightInputCallback = this.weightInputCallback.bind(this);
	}





	toggleInfluence = () => {
		// if (this.state.isInfluence == false)
		// 	this.setState((state) => ({ influence: 0 }));
		console.log("state", this.state);
		this.setState((state) => ({
			isInfluence: !state.isInfluence,
			influence: 0
		}));
	}
	toggleComplexity = () => {
		// if (this.state.isComplexity == false)
		// 	this.setState((state) => ({ complexity: 0 }));
		this.setState((state) => ({
			isComplexity: !state.isComplexity,
			complexity: 0
		}));
	}
	toggleConvergence = () => {
		// if (this.state.isConvergence == false)
		// 	this.setState((state) => ({ convergence: 0 }));
		this.setState((state) => ({
			isConvergence: !state.isConvergence,
			convergence: 0
		}));
	}
	toggleReactionConfidence = () => {
		// if (this.state.isReactionConfidence == false)
		// 	this.setState((state) => ({ reactionConfidence: 0 }));
		this.setState((state) => ({
			isReactionConfidence: !state.isReactionConfidence,
			reactionConfidence: 0
		}));
	}
	toggleAssociatedSubtreeConfidence = () => {
		// if (this.state.isAssociatedSubtreeConfidence == false)
		// 	this.setState((state) => ({ associatedSubtreeConfidence: 0 }));
		this.setState((state) => ({
			isAssociatedSubtreeConfidence: !state.isAssociatedSubtreeConfidence,
			associatedSubtreeConfidence: 0
		}));
	}




	componentDidUpdate(prevProps, prevState, snapshot) {

		if (this.state != prevState) {

			console.log("current state", this.state);

			this.props.updateWeightFromPanel(
				(this.state.isInfluence) ? this.state.influence : null,
				(this.state.isComplexity) ? this.state.complexity : null,
				(this.state.isConvergence) ? this.state.convergence : null,
				(this.state.isReactionConfidence) ? this.state.reactionConfidence : null,
				(this.state.isAssociatedSubtreeConfidence) ? this.state.associatedSubtreeConfidence : null
			);
		}
	}

	weightInputCallback(label, value) {

		if (label === "Influence") {
			this.setState({
				influence: Number(value)
			});
		}
		else if (label === "Complexity") {
			this.setState({
				complexity: Number(value)
			})
		}
		else if (label === "Convergence") {
			this.setState({
				convergence: Number(value)
			})
		}
		else if (label === "Reaction Confidence") {
			this.setState({
				reactionConfidence: Number(value)
			})
		}
		else if (label === "Associated Subtree Confidence") {
			this.setState({
				associatedSubtreeConfidence: Number(value)
			})
		}
	}




	render() {

		console.log("render weights", this.state);

		const InfluenceInput =
			<Grid item>
				<ConstraintInput
					label={"Influence"}
					lowerLimit={0}
					higherLimit={100}
					defaultValue={this.state.influence}
					callback={this.weightInputCallback}
					id={1}
					key={1}
				/>
			</Grid>

		const ComplexityInput =
			<Grid item>
				<ConstraintInput
					label={"Complexity"}
					lowerLimit={0}
					higherLimit={100}
					defaultValue={this.state.complexity}
					callback={this.weightInputCallback}
					id={2}
					key={2}
				/>
			</Grid>

		const ConvergenceInput =
			<Grid item>
				<ConstraintInput
					label={"Convergence"}
					lowerLimit={0}
					higherLimit={100}
					defaultValue={this.state.convergence}
					callback={this.weightInputCallback}
					id={3}
					key={3}
				/>
			</Grid>

		const ReactionConfidenceInput =
			<Grid item>
				<ConstraintInput
					label={"Reaction Confidence"}
					lowerLimit={0}
					higherLimit={100}
					defaultValue={this.state.reactionConfidence}
					callback={this.weightInputCallback}
					id={4}
					key={4}
				/>
			</Grid>

		const AssociatedSubtreeConfidenceInput =
			<Grid item>
				<ConstraintInput
					label={"Associated Subtree Confidence"}
					lowerLimit={0}
					higherLimit={100}
					defaultValue={this.state.associatedSubtreeConfidence}
					callback={this.weightInputCallback}
					id={5}
					key={5}
				/>
			</Grid>


		let inputList = [];


		if (this.state.isInfluence) {
			inputList.push(InfluenceInput);
		}
		if (this.state.isComplexity) {
			inputList.push(ComplexityInput);
		}
		if (this.state.isConvergence) {
			inputList.push(ConvergenceInput);
		}
		if (this.state.isReactionConfidence) {
			inputList.push(ReactionConfidenceInput);
		}
		if (this.state.isAssociatedSubtreeConfidence) {
			inputList.push(AssociatedSubtreeConfidenceInput);
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

						<Checkbox checked={this.state.isInfluence} onChange={this.toggleInfluence}>
							Influence
						</Checkbox>
						<Checkbox checked={this.state.isComplexity} onChange={this.toggleComplexity}>
							Complexity
						</Checkbox>
						<Checkbox checked={this.state.isConvergence} onChange={this.toggleConvergence}>
							Convergence
						</Checkbox>
						<Checkbox checked={this.state.isReactionConfidence} onChange={this.toggleReactionConfidence}>
							Reaction Confidence
						</Checkbox>
						<Checkbox checked={this.state.isAssociatedSubtreeConfidence}
							onChange={this.toggleAssociatedSubtreeConfidence}>
							Associated Subtree Confidence
						</Checkbox>
					</div>
				</Grid>

				{inputList}

			</Grid>

		);
	}
}

export { WeightInputPanel }