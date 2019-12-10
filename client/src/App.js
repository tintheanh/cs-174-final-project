import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import configureStore from './redux/store';

import Landing from './components/landing/landing';
import NavBar from './components/navBar/navBar';
import Login from './components/login/login';
import Register from './components/register/register';
import Tool from './components/tool/tool';
import NotFound from './components/not-found/not-found';
import ConfigNeuralNet from './components/config-neural-net/config-neural-net';

import ProtectedRoute from './components/protected-route/protected-route';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.configureStore = configureStore(); // Config redux store
	}
	render() {
		return (
			<Provider store={this.configureStore.store}>
				<PersistGate loading={null} persistor={this.configureStore.persistor}>
					{/* State persistance */}
					<Router>
						<div className="App">
							<NavBar />
							<Switch>
								<Route exact path="/" component={Landing} />
								<Route exact path="/register" component={Register} />
								<Route exact path="/login" component={Login} />

								<ProtectedRoute exact path="/config" component={ConfigNeuralNet} />
								<ProtectedRoute exact path="/tool" component={Tool} />
								<Route component={NotFound} />
							</Switch>
						</div>
					</Router>
				</PersistGate>
			</Provider>
		);
	}
}

export default App;
