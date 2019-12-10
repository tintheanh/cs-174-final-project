import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateFileValues, clear } from '../../redux/actions/authActions';
import { validatFileValuesForm } from '../../utils/validation';

class ConfigNeuralNet extends Component {
	constructor(props) {
		super(props);
		const { fileValues } = props.userData;
		this.state = {
			num_hidden_layers: fileValues.num_hidden_layers,
			width: fileValues.width,
			activation_func: fileValues.activation_func,
			learning_rate: fileValues.learning_rate,
			dropout: fileValues.dropout,
			epochs: fileValues.epochs,

			edit: false,
			warnings: '',
			loading: false
		};
	}

	setValues = (e) => {
		this.setState({
			[e.target.name]: e.target.name === 'activation_func' ? e.target.value : Number(e.target.value)
		});
	};

	resetValues = () => {
		const { fileValues } = this.props.userData;
		this.setState({
			num_hidden_layers: fileValues.num_hidden_layers,
			width: fileValues.width,
			activation_func: fileValues.activation_func,
			learning_rate: fileValues.learning_rate,
			dropout: fileValues.dropout,
			epochs: fileValues.epochs,
			edit: false,
			warnings: '',
			loading: false
		});
	};

	onSubmit = (e) => {
		e.preventDefault();

		const { edit, warnings, loading, ...input } = this.state;

		const fail = validatFileValuesForm(input); // Client-side file values validation

		if (!fail) {
			const data = {
				token: localStorage.getItem('usertoken'),
				username: this.props.userData.username,
				hash: this.props.userData.hash,
				fileValues: input
			};
			this.setState({ loading: true });
			this.props.updateFileValues(data).then(() => this.resetValues()).catch((err) => {
				if (err.message === 'Please login again.') {
					alert('Please login again.');
					this.props.clear();
					this.props.history.push('/');
				}
				console.warn(err.message);
			});
		} else this.setState({ warnings: fail });
	};

	renderWarning = () => {
		const warnings = this.state.warnings.split('\n');
		if (this.state.warnings.length)
			return warnings.map((warning, i) => {
				if (warning.length)
					return (
						<div key={i} className="alert alert-warning" role="alert" style={{ marginTop: 18 }}>
							{warning}
						</div>
					);

				return null;
			});

		return null;
	};

	render() {
		const { num_hidden_layers, width, activation_func, learning_rate, dropout, epochs, edit, loading } = this.state;
		return (
			<div className="container" style={{ maxWidth: 520 }}>
				<h3 className="text-center" style={{ marginTop: 20 }}>
					Config your neural net
				</h3>
				<form onSubmit={this.onSubmit}>
					<div className="form-group">
						<label>Number of hidden layers</label>
						<input
							className="form-control"
							type="number"
							name="num_hidden_layers"
							value={num_hidden_layers}
							placeholder="Enter Number of hidden layers"
							disabled={!edit}
							onChange={this.setValues}
						/>
						<small className="form-text text-muted">Must be 1 or 2</small>
					</div>
					<div className="form-group">
						<label>Width</label>
						<input
							type="number"
							className="form-control"
							name="width"
							value={width}
							placeholder="Width"
							disabled={!edit}
							onChange={this.setValues}
						/>
						<small className="form-text text-muted">Between 10 and 200</small>
					</div>
					<div className="form-group">
						<label>Activation function</label>
						<select
							className="form-control"
							name="activation_func"
							value={activation_func}
							disabled={!edit}
							onChange={this.setValues}
						>
							<option value="ReLU">ReLU</option>
							<option value="Sigmoid">Sigmoid</option>
						</select>
					</div>
					<div className="form-group">
						<label>Learning rate</label>
						<input
							type="number"
							className="form-control"
							name="learning_rate"
							step="0.001"
							value={learning_rate}
							placeholder="Learning rate"
							disabled={!edit}
							onChange={this.setValues}
						/>
						<small className="form-text text-muted">
							Between 0.001 and 0.01 for ReLU <br />
							Between 0.1 and 1 for Sigmoid
						</small>
					</div>
					<div className="form-group">
						<label>Dropout</label>
						<input
							type="number"
							className="form-control"
							name="dropout"
							step="0.1"
							value={dropout}
							placeholder="Dropout"
							disabled={!edit}
							onChange={this.setValues}
						/>
						<small className="form-text text-muted">
							Between 0 and 0.7 for ReLU <br />
							Must be 0 for Sigmoid
						</small>
					</div>
					<div className="form-group">
						<label>Epochs</label>
						<input
							type="number"
							className="form-control"
							name="epochs"
							value={epochs}
							placeholder="Epochs"
							disabled={!edit}
							onChange={this.setValues}
						/>
						<small className="form-text text-muted">Between 10 and 150</small>
					</div>
					{loading ? (
						<button className="btn btn-primary" type="button" disabled style={{ width: 78 }}>
							<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
							<span className="sr-only">Loading...</span>
						</button>
					) : (
						<button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 78 }}>
							Save
						</button>
					)}

					{edit ? (
						<button
							type="button"
							className="btn btn-dark"
							style={{ marginLeft: 14, width: 78 }}
							disabled={loading}
							onClick={this.resetValues}
						>
							Cancel
						</button>
					) : (
						<button
							type="button"
							className="btn btn-secondary"
							style={{ marginLeft: 14, width: 78 }}
							onClick={() => this.setState({ edit: true })}
						>
							Edit
						</button>
					)}

					{this.renderWarning()}
				</form>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userData: state.auth.userData
});

export default connect(mapStateToProps, { clear, updateFileValues })(ConfigNeuralNet);
