import React, { Component } from 'react';
import { connect } from 'react-redux';

import { upload, clear, clearResult } from '../../redux/actions/authActions';
import { FILE_SIZE_LIMIT } from '../../utils/constants';

class Tool extends Component {
	state = { img: '', error: '' };

	componentWillUnmount() {
		this.props.clearResult(); // Clear old result when navigating away
	}

	onSubmit = (e) => {
		e.preventDefault();
		const data = {
			image: this.state.img,
			username: this.props.userData.username,
			token: localStorage.getItem('usertoken'),
			hash: this.props.userData.hash
		};

		if (data.image) {
			this.props
				.upload(data)
				.then(() => {
					console.log('Result generated.');
					this.setState({ error: '' });
				})
				.catch((err) => {
					if (err.message === 'Please login again.') {
						alert(err.message);
						this.props.clear();
						this.props.history.push('/');
					}
					console.warn(err.message);
				});
		} else {
			this.setState({ error: 'No image uploaded.' });
			this.props.clearResult();
		}
	};

	setImage = (e) => {
		const file = e.target.files[0];
		if (file && file.size <= FILE_SIZE_LIMIT) {
			// Only accept file <= 50KB
			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onloadend = function(e) {
				this.setState({ img: reader.result.replace(/^data:image\/[a-z]+;base64,/, '') });
			}.bind(this);
		} else {
			e.target.value = null;
			this.setState({ error: 'Image is invalid.', img: '' });
			this.props.clearResult();
		}
	};

	render() {
		return (
			<div className="container" style={{ marginTop: 20 }}>
				<h3 className="text-center"> {`Welcome ${this.props.userData.username}`}</h3>
				<h4 className="text-center">Please upload your image</h4>
				<div
					style={{ margin: 'auto', textAlign: 'center', maxWidth: 420 }}
					className="border border-info rounded"
				>
					<form onSubmit={this.onSubmit} style={{ padding: 20 }}>
						<input type="file" accept="image/*" onChange={this.setImage} />
						<br />
						<input type="submit" className="btn btn-primary" value="Upload" style={{ marginTop: 18 }} />
					</form>
				</div>
				{this.state.error ? (
					<div
						className="alert alert-warning"
						role="alert"
						style={{ maxWidth: 320, margin: 'auto', textAlign: 'center', marginTop: 20 }}
					>
						{this.state.error}
					</div>
				) : null}

				{this.props.result ? (
					<div className="container" style={{ maxWidth: 320, marginTop: 20 }}>
						<div className="alert alert-success" role="alert">
							Number: {this.props.result.number} <br />
							Probability: {this.props.result.prob}
						</div>
					</div>
				) : null}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userData: state.auth.userData,
	result: state.auth.result
});

export default connect(mapStateToProps, { upload, clear, clearResult })(Tool);
