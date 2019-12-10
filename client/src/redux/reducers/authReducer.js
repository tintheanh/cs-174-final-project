import { LOGIN, VERIFY, LOGOUT, REGISTER, UPLOAD, CLEAR, CLEAR_RESULT, UPDATE } from '../actions/types';

const initialState = {
	userData: null,
	result: null
};

export default function(state = initialState, action) {
	switch (action.type) {
		case LOGIN:
			return {
				...state,
				userData: action.payload
			};
		case LOGOUT:
			return {
				...state,
				userData: action.payload
			};
		case VERIFY:
			return state;
		case UPLOAD:
			return {
				...state,
				result: action.payload
			};
		case UPDATE:
			return {
				...state,
				userData: {
					...state.userData,
					fileValues: action.payload
				}
			};
		case REGISTER:
			return state;
		case CLEAR_RESULT:
			return {
				...state,
				result: action.payload
			};
		case CLEAR:
			return initialState;
		default:
			return state;
	}
}
