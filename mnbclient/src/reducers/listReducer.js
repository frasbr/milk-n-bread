import {
    GET_LISTS,
    GET_LIST,
    LIST_LOADING,
    CLEAR_LISTS
} from '../actions/types';

const initialState = {
    userLists: null,
    loading: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_LISTS:
            return {
                ...state,
                userLists: action.payload,
                loading: false
            };
        case GET_LIST:
            let newList = null;

            if (state.userLists) {
                const listIndex = state.userLists
                    .map(list => list._id.toString())
                    .indexOf(action.payload._id.toString());

                if (listIndex < 0) {
                    newList = [...state.userLists, action.payload];
                } else {
                    // map state into new array and update the value that matches listIndex
                    newList = [
                        ...state.userLists.map((list, i) => {
                            if (listIndex === i) {
                                return action.payload;
                            } else {
                                return list;
                            }
                        })
                    ];
                }
            } else {
                newList = [action.payload];
            }

            return {
                ...state,
                userLists: newList,
                loading: false
            };
        case LIST_LOADING:
            return {
                ...state,
                loading: true
            };
        case CLEAR_LISTS:
            return initialState;
        default:
            return state;
    }
}
