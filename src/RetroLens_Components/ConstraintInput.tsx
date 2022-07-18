import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';


const Input = styled(MuiInput)`
  width: 42px;
`;

interface ConstraintInputState {
	value: number | string | number[];
}

class ConstraintInput extends
	React.Component<{ label: string, lowerLimit: number, higherLimit: number, defaultValue: number, callback: any },
	ConstraintInputState> {

	label: string;
	lowerLimit: number;
	higherLimit: number;
	callback: any

	constructor(props: { label: string, lowerLimit: number, higherLimit: number, defaultValue: number, callback: any }) {
		super(props);

		this.state = {
			value: props.defaultValue
		};

		this.label = props.label;
		this.lowerLimit = props.lowerLimit;
		this.higherLimit = props.higherLimit;
		this.callback = props.callback;

		this.handleSliderChange = this.handleSliderChange.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	componentDidUpdate(prevProps: any, prevState: any) {
		if (this.state.value !== prevState.value) {
			this.callback(this.label, this.state.value);
		}
	}

	handleSliderChange(event: Event, newValue: number | number[]) {

		this.setState({
			value: newValue
		});
	}

	handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({
			value: event.target.value === '' ? '' : Number(event.target.value)
		});
	}

	handleBlur() {

		let value = this.state.value;

		if (value < this.lowerLimit) {
			this.setState({
				value: this.lowerLimit
			});
		} else if (value > this.higherLimit) {
			this.setState({
				value: this.higherLimit
			});
		}
	}

	render() {

		const unit = (this.props.higherLimit === 1000) ? "USD per g/mL" : "";

		return (
			<Box>
				<Grid container spacing={2} alignItems="center" wrap='nowrap'>
					<Grid item xs={4}>
						<Typography>{this.label}</Typography>
					</Grid>
					<Grid item xs={1}>
						<Typography>{this.lowerLimit}</Typography>
					</Grid>
					<Grid item xs>
						<Slider
							value={typeof this.state.value === 'number' ? this.state.value : 0}
							onChange={(event, newValue) => this.handleSliderChange(event, newValue)}
							aria-labelledby="input-slider"
							min={this.lowerLimit}
							max={this.higherLimit}
							step={(this.label === "MSSR") ? 1 : (this.higherLimit - this.lowerLimit) / 100}
						/>
					</Grid>
					<Grid item>
						<Typography>{this.higherLimit}</Typography>
					</Grid>
					<Grid item>
						<Input
							value={this.state.value}
							size="small"
							onChange={this.handleInputChange}
							onBlur={this.handleBlur}
							inputProps={{
								min: this.lowerLimit,
								max: this.higherLimit,
								step: (this.label === "MSSR") ? 1 : (this.higherLimit - this.lowerLimit) / 100,
								type: 'number',
								'aria-labelledby': 'input-slider',
							}}
						/>
					</Grid>
					<Grid item xs={2}>
						<Typography>{unit}</Typography>
					</Grid>
				</Grid>
			</Box>
		);
	}


}

export { ConstraintInput };
