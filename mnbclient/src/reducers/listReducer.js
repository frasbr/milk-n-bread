import { GET_LISTS } from '../actions/types';

const initialState = {
    lists: null,
    currentList: null,
    loading: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_LISTS:
            return {
                ...state,
                lists: action.payload,
                loading: false
            };
        default:
            return state;
    }
}
