import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class Landing extends React.Component {
	render() {
		return (
			<div data-testid="landing" className="container">
				<h3 className="text-center" style={{ marginTop: 20 }}>
					Welcome!
				</h3>
				{this.props.userData ? (
					<h5 className="text-center">
						Please enjoy using the tool at <Link to="/profile">profile</Link>
					</h5>
				) : (
					<h5 className="text-center">
						Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to use the feature
					</h5>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userData: state.auth.userData
});

export default connect(mapStateToProps, null)(Landing);
