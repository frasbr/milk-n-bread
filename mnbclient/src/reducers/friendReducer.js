import { GET_FRIENDS } from '../actions/types';

const initialState = {
    friendsList: null,
    incomingRequests: null,
    outgoingRequests: null
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_FRIENDS:
            return {
                ...state,
                friendsList: action.payload
            };

        default:
            return state;
    }
}
