import React from 'react';
import { connect } from 'react-redux';

import { validateCredentialsForm } from '../../utils/validation';
import { register } from '../../redux/actions/authActions';

class Register extends React.Component {
	state = { username: '', password: '', error: '', warnings: '' };

	onSubmit = (e) => {
		e.preventDefault();

		const user = {
			username: this.state.username,
			password: this.state.password
		};

		const fail = validateCredentialsForm(user); // Client-side credentials validation

		if (!fail) {
			this.props
				.register(user)
				.then(() => this.props.history.push('/login'))
				.catch((err) => this.setState({ error: err.message, warnings: '' }));
		} else this.setState({ warnings: fail, error: '' });
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
						<small className="form-text text-muted">
							Usernames must be at least 5 characters. <br />Only a-z, A-Z, 0-9, - and _ allowed.
						</small>
					</div>
					<div className="form-group">
						<label>Password</label>
						<input
							type="password"
							className="form-control"
							placeholder="Password"
							onChange={(e) => this.setState({ password: e.target.value })}
						/>
						<small className="form-text text-muted">
							Passwords must be at least 6 characters and require one each of a-z, A-Z and 0-9.
						</small>
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
export default connect(null, { register })(Register);
