import { GET_MODAL, CLOSE_MODAL } from '../actions/types';

const initialState = {
    open: false,
    type: null
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_MODAL:
            return {
                open: true,
                type: action.payload
            };
        case CLOSE_MODAL:
            return {
                open: false,
                type: null
            };
        default:
            return state;
    }
}
