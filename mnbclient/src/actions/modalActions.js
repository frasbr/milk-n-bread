import { GET_MODAL, CLOSE_MODAL } from './types';

export const createListModal = () => {
    return {
        type: GET_MODAL,
        payload: {
            modal: 'CREATE_LIST'
        }
    };
};

export const addItemModal = list_id => {
    return {
        type: GET_MODAL,
        payload: {
            modal: 'ADD_ITEM',
            data: list_id
        }
    };
};

export const unfriendModal = friend_id => {
    return {
        type: GET_MODAL,
        payload: {
            modal: 'UNFRIEND',
            data: friend_id
        }
    };
};

export const addUserToListModal = user => {
    return {
        type: GET_MODAL,
        payload: {
            modal: 'ADD_USER_TO_LIST',
            data: user
        }
    };
};

export const manageUsersModal = (contributors, list_id, author) => {
    return {
        type: GET_MODAL,
        payload: {
            modal: 'MANAGE_USERS',
            data: { contributors, list_id, author }
        }
    };
};

export const closeModal = () => {
    return {
        type: CLOSE_MODAL
    };
};
