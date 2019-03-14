import { GET_MODAL, CLOSE_MODAL } from '../actions/types';

const initialState = {
    open: false,
    type: null,
    data: null
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_MODAL:
            return {
                open: true,
                type: action.payload.modal,
                data: action.payload.data
            };
        case CLOSE_MODAL:
            return {
                open: false,
                type: null,
                data: null
            };
        default:
            return state;
    }
}
