import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

import { connect } from 'react-redux';

import { verify } from '../../redux/actions/authActions';

class ProtectedRoute extends Component {
	state = { userData: null, hidden: true };

	componentDidMount() {
		setTimeout(() => {
			this.props.verify().catch((err) => console.warn(err.message));
			this.setState({ hidden: false });
		}, 300);
	}

	render() {
		const { exact, path, component: Component } = this.props;
		if (!this.state.hidden)
			return (
				<Route
					exact={exact}
					path={path}
					render={(props) => (this.props.userData ? <Component {...props} /> : <Redirect to="/" />)}
				/>
			);
		return null;
	}
}

const mapStateToProps = (state) => ({
	userData: state.auth.userData
});

export default connect(mapStateToProps, { verify })(ProtectedRoute);
