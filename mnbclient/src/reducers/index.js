import { combineReducers } from 'redux';
import authReducer from './authReducer';
import listReducer from './listReducer';
import errorReducer from './errorReducer';
import modalReducer from './modalReducer';
import friendReducer from './friendReducer';
import navReducer from './navReducer';

const appReducer = combineReducers({
    auth: authReducer,
    lists: listReducer,
    errors: errorReducer,
    modal: modalReducer,
    friends: friendReducer,
    nav: navReducer
});

export default (state, action) => {
    if (action.type === 'LOGOUT_USER') {
        state = undefined;
    }

    return appReducer(state, action);
};
