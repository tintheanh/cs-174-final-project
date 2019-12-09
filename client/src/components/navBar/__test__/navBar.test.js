import React from 'react';
import ReactDOM from 'react-dom';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import renderer from 'react-test-renderer';

import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from '../navBar';

afterEach(cleanup);

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(
		<Router>
			<NavBar />
		</Router>,
		div
	);
});

describe('Welcome (Snapshot)', () => {
	it('Welcome renders hello world', () => {
    // localStorage.setItem("usertoken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJKb2huIiwiaWF0IjoxNTE2MjM5MDIyfQ.HaAB9LmgyhESJHqVLTWpd7hejlCxT6dc-sGk9DUlE64")
    
		const component = renderer.create(
			<Router>
				<NavBar />
			</Router>
		);
    const json = component.toJSON();
    
		expect(json).toMatchSnapshot();
	});
});
