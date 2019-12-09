import { LOGIN, VERIFY, LOGOUT, SIGNUP, UPLOAD, CLEAR, CLEAR_RESULT } from '../actions/types';

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
			return {
				...state,
				userData: action.payload
			};
		case UPLOAD:
			return {
				...state,
				result: action.payload
			};
		case SIGNUP:
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
