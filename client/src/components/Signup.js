import React from 'react';
import {signup} from '../utils/auth';

class Signup extends React.Component {
	state = {username: '', password: '', error: ''}
	
	onSubmit = (e) => {
    e.preventDefault();

    const user = {
      username: this.state.username,
      password: this.state.password
    }

    signup(user).then(() => this.props.history.push('/login')).catch(err => this.setState({ error: err.message }))
  }
	render() {
		return (
			<div>
        <h3>Sign up</h3>
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
export default Signup;
