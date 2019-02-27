import { combineReducers } from 'redux';
import authReducer from './authReducer';
import listReducer from './listReducer';
import errorReducer from './errorReducer';
import modalReducer from './modalReducer';
import friendReducer from './friendReducer';

export default combineReducers({
    auth: authReducer,
    lists: listReducer,
    errors: errorReducer,
    modal: modalReducer,
    friends: friendReducer
});
