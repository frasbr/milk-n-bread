import axios from 'axios';

import { GET_LISTS } from './types';

export const getLists = () => dispatch => {
    axios.get('/api/lists/').then(res => {
        dispatch({
            type: GET_LISTS,
            action: res.data
        });
    });
};
