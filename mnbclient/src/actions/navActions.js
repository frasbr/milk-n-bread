export const updateNav = pathname => {
    return {
        type: 'UPDATE_NAV',
        payload: pathname
    };
};
