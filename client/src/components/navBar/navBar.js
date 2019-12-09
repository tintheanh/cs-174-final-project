import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { verify, logout } from '../../redux/actions/authActions';

class NavBar extends Component {
	state = { isAuthed: false };

	componentDidMount() {
		this.props.verify().catch((err) => console.warn(err.message));
	}

	logOut = () => {
		this.props
			.logout(this.props.userData)
			.then(() => this.props.history.push('/'))
			.catch((err) => console.warn(err.message));
	};

	loginRegLink = () => (
		<ul className="navbar-nav">
			<li className="nav-item">
				<Link className="nav-link text-white" to="/login">
					Login
				</Link>
			</li>
			<li className="nav-item">
				<Link className="nav-link text-white" to="/register">
					Register
				</Link>
			</li>
		</ul>
	);

	userLink = () => (
		<ul className="navbar-nav">
			<li>
				<Link className="nav-link text-white" to="/profile">
					Profile
				</Link>
			</li>
			<li className="nav-item">
				<span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={this.logOut}>
					Logout
				</span>
			</li>
		</ul>
	);

	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-info">
				<span className="navbar-brand text-white">My App</span>
				<ul className="navbar-nav mr-auto">
					<li className="nav-item">
						<Link className="nav-link text-white" to="/">
							Home
						</Link>
					</li>
					{this.props.userData ? this.userLink() : this.loginRegLink()}
				</ul>
			</nav>
		);
	}
}

const mapStateToProps = (state) => ({
	userData: state.auth.userData
});

export default connect(mapStateToProps, { verify, logout })(withRouter(NavBar));
