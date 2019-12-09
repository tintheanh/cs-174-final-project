import React from 'react';
import ReactDOM from 'react-dom';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import renderer from 'react-test-renderer';
import Landing from '../landing';

afterEach(cleanup);

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<Landing />, div);
});

it('renders Landing correctly', () => {
	const { getByTestId } = render(<Landing />);
	expect(getByTestId('landing')).toHaveTextContent('Welcome guest');
});

it('matches snapshot', () => {
	const tree = renderer.create(<Landing />).toJSON();
	expect(tree).toMatchSnapshot();
});
