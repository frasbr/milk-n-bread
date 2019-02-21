import { combineReducers } from 'redux';
import authReducer from './authReducer';
import listReducer from './listReducer';
import errorReducer from './errorReducer';

export default combineReducers({
    auth: authReducer,
    lists: listReducer,
    errors: errorReducer
});
