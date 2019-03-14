import axios from 'axios';

import {
    GET_FRIENDS,
    GET_REQUESTS,
    ADD_FRIEND,
    ACCEPT_FRIEND,
    REMOVE_REQUEST,
    REMOVE_FRIEND,
    GET_ERRORS,
    CLEAR_FRIENDS,
    FRIENDS_LOADING,
    REQUESTS_LOADING,
    SEARCH_USERS,
    CLEAR_SEARCH,
    SEARCH_LOADING
} from '../actions/types';

export const getFriends = () => dispatch => {
    dispatch(setFriendsLoading(true));
    axios
        .get('/api/users/friends')
        .then(res =>
            dispatch({
                type: GET_FRIENDS,
                payload: res.data
            })
        )
        .catch(err => {
            dispatch(setFriendsLoading(false));
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            });
        });
};

export const getRequests = () => dispatch => {
    dispatch(setRequestsLoading(true));
    axios
        .get('/api/users/requests')
        .then(res =>
            dispatch({
                type: GET_REQUESTS,
                payload: res.data
            })
        )
        .catch(err => {
            dispatch(setRequestsLoading(false));
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            });
        });
};

export const searchUsers = query => dispatch => {
    dispatch(setSearchLoading());
    axios
        .post('/api/users/search', { search: query })
        .then(res => {
            dispatch({
                type: SEARCH_USERS,
                payload: res.data
            });
        })
        .catch(err => {
            dispatch({
                type: CLEAR_SEARCH
            });
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            });
        });
};

export const addFriend = user_id => dispatch => {
    axios
        .post(`/api/users/add/${user_id}`)
        .then(res =>
            dispatch({
                type: ADD_FRIEND,
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

export const acceptFriendRequest = request_id => dispatch => {
    axios
        .post(`/api/users/accept/${request_id}`)
        .then(res =>
            dispatch({
                type: ACCEPT_FRIEND,
                payload: res.data
            })
        )
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            });
        });
};

export const rejectFriendRequest = request_id => dispatch => {
    axios
        .delete(`/api/users/reject/${request_id}`)
        .then(res =>
            dispatch({
                type: REMOVE_REQUEST,
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

export const removeFriend = friend_id => dispatch => {
    axios
        .delete(`/api/users/unfriend/${friend_id}`)
        .then(res =>
            dispatch({
                type: REMOVE_FRIEND,
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

export const clearFriends = () => {
    return {
        type: CLEAR_FRIENDS
    };
};

export const setFriendsLoading = bool => {
    return {
        type: FRIENDS_LOADING,
        payload: bool
    };
};

export const setRequestsLoading = bool => {
    return {
        type: REQUESTS_LOADING,
        payload: bool
    };
};

export const setSearchLoading = () => {
    return {
        type: SEARCH_LOADING
    };
};
