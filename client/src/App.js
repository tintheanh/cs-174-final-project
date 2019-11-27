import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Landing from './components/Landing';
import NavBar from './components/NavBar'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<NavBar />
					<Route exact path="/" component={Landing} />
					<div className="container">
						<Route exact path="/register" component={Signup} />
            <Route exact path="/login" component={Login} />

						{/* This route is protected */}
						<Route exact path="/profile" component={Profile} />
					</div>
				</div>
			</Router>
		);
	}
}
export default App;
