import React from 'react';
import { connect } from 'react-redux';

import { validateForm } from '../../utils/validation';
import { signup } from '../../redux/actions/authActions';

class Register extends React.Component {
	state = { username: '', password: '', error: '', warning: '' };

	onSubmit = (e) => {
		e.preventDefault();

		const user = {
			username: this.state.username,
			password: this.state.password
		};

		const fail = validateForm(user); // Client-side validation

		if (!fail) {
			this.props
				.signup(user)
				.then(() => this.props.history.push('/login'))
				.catch((err) => this.setState({ error: err.message, warning: '' }));
		} else this.setState({ warning: fail, error: '' });
	};

	renderWarning = () => {
		const warnings = this.state.warning.split('\n');
		if (this.state.warning.length)
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
		return (
			<div className="container" style={{ maxWidth: 520 }}>
				<h3 className="text-center" style={{ marginTop: 20 }}>
					Register
				</h3>
				<form onSubmit={this.onSubmit}>
					<div className="form-group">
						<label>Username</label>
						<input
							className="form-control"
							type="text"
							placeholder="Enter username"
							onChange={(e) => this.setState({ username: e.target.value })}
						/>
					</div>
					<div className="form-group">
						<label>Password</label>
						<input
							type="password"
							className="form-control"
							placeholder="Password"
							onChange={(e) => this.setState({ password: e.target.value })}
						/>
					</div>
					<input type="submit" className="btn btn-primary" />
					
					{this.renderWarning()}

					{/* Render error */}
					{this.state.error ? (
						<div className="alert alert-danger" role="alert" style={{ marginTop: 18 }}>
							{this.state.error}
						</div>
					) : null}
				</form>
			</div>
		);
	}
}
export default connect(null, { signup })(Register);
