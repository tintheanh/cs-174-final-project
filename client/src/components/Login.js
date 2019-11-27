import React, { Component } from 'react';

import { login } from '../utils/auth';

class Login extends Component {
	state = {username: '', password: '',  error: ''}
	
	onSubmit = (e) => {
    e.preventDefault();
    const user = {
      username: this.state.username,
      password: this.state.password
    }
    login(user).then(res => {
      if (res) this.props.history.push('/profile');
    }).catch(err => this.setState({error: err.message}))
	};

	render() {
		return (
			<div>
        <h3>Login</h3>
				<form onSubmit={this.onSubmit}>
					username: <input type="text" onChange={e => this.setState({username: e.target.value})} /><br />
					password: <input type="text" onChange={e => this.setState({password: e.target.value})} /><br />
					<input type="submit" />
				</form>
        <span>{this.state.error}</span>
			</div>
		);
	}
}
export default Login;
