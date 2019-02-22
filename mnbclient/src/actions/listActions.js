import axios from 'axios';

import {
    GET_LISTS,
    LIST_LOADING,
    GET_ERRORS,
    CLEAR_LISTS,
    GET_LIST
} from './types';

export const getLists = () => dispatch => {
    dispatch(setListLoading());
    axios
        .get('/api/lists/')
        .then(res => {
            dispatch({
                type: GET_LISTS,
                payload: res.data
            });
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

export const getList = list_id => dispatch => {
    dispatch(setListLoading());
    axios
        .get(`/api/lists/${list_id}`)
        .then(res => {
            dispatch({
                type: GET_LIST,
                payload: res.data
            });
        })
        .catch(err => {
            console.log(err);
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            });
        });
};

export const addItem = (itemData, list_id) => dispatch => {
    axios
        .post(`/api/lists/${list_id}/addItem`, itemData)
        .then(res =>
            dispatch({
                type: GET_LIST,
                payload: res.data
            })
        )
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

export const purchaseItem = (list_id, item_id) => dispatch => {
    axios
        .patch(`/api/lists/${list_id}/purchase/${item_id}`)
        .then(res => {
            dispatch({
                type: GET_LIST,
                payload: res.data
            });
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

export const deleteItem = (list_id, item_id) => dispatch => {
    axios
        .patch(`/api/lists/${list_id}/removeItem/${item_id}`)
        .then(res => {
            dispatch({
                type: GET_LIST,
                payload: res.data
            });
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            });
        });
};

export const setListLoading = () => {
    return {
        type: LIST_LOADING
    };
};

export const clearAllLists = () => {
    return {
        type: CLEAR_LISTS
    };
};
