import { GET_MODAL, CLOSE_MODAL } from './types';

export const createListModal = () => {
    return {
        type: GET_MODAL,
        payload: 'CREATE_LIST'
    };
};

export const closeModal = () => {
    return {
        type: CLOSE_MODAL
    };
};
