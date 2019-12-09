import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './redux/store';

import Landing from './components/landing/landing';
import NavBar from './components/navBar/navBar';
import Login from './components/login/login';
import Register from './components/register/register';
import Profile from './components/profile/profile';

const App = () => (
	<Provider store={store}>
		<Router>
			<div className="App">
				<NavBar />
				<Route exact path="/" component={Landing} />
				<div className="container">
					<Route exact path="/register" component={Register} />
					<Route exact path="/login" component={Login} />

					{/* This route is protected */}
					<Route exact path="/profile" component={Profile} />
				</div>
			</div>
		</Router>
	</Provider>
);
export default App;
