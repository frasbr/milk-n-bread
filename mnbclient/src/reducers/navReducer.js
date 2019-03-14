import { UPDATE_NAV } from '../actions/types';

const initialState = {
    location: null
};

export default function(state = initialState, action) {
    switch (action.type) {
        case UPDATE_NAV:
            return {
                location: action.payload
            };
        default:
            return state;
    }
}
