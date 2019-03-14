import {
    GET_FRIENDS,
    ACCEPT_FRIEND,
    ADD_FRIEND,
    GET_REQUESTS,
    REMOVE_FRIEND,
    REMOVE_REQUEST,
    CLEAR_FRIENDS,
    FRIENDS_LOADING,
    REQUESTS_LOADING,
    SEARCH_USERS,
    CLEAR_SEARCH,
    SEARCH_LOADING
} from '../actions/types';

const initialState = {
    friendsList: [],
    incomingRequests: [],
    outgoingRequests: [],
    searchResult: null,
    loadingFriends: false,
    loadingRequests: false,
    loadingSearch: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_FRIENDS:
            return {
                ...state,
                friendsList: action.payload,
                loadingFriends: false
            };
        case GET_REQUESTS:
            const incoming = [];
            const outgoing = [];
            action.payload.forEach(request => {
                if (request.incoming) {
                    incoming.unshift(request);
                } else {
                    outgoing.unshift(request);
                }
            });
            return {
                ...state,
                incomingRequests: incoming,
                outgoingRequests: outgoing,
                loadingRequests: false
            };
        case ADD_FRIEND:
            if (action.payload.accepted) {
                const requestIndex = state.incomingRequests
                    .map(request => request.id)
                    .indexOf(action.payload.id);
                if (requestIndex < 0) {
                    return {
                        ...state,
                        friends: [...state.friendsList, action.payload.user]
                    };
                } else {
                    return {
                        ...state,
                        incomingRequests: state.incomingRequests.splice(
                            requestIndex,
                            1
                        ),
                        friendsList: [...state.friendsList, action.payload.user]
                    };
                }
            } else {
                return {
                    ...state,
                    outgoingRequests: [
                        ...state.outgoingRequests,
                        action.payload
                    ]
                };
            }
        case ACCEPT_FRIEND:
            const requestIndex = state.incomingRequests
                .map(req => req.id)
                .indexOf(action.payload);
            if (requestIndex < 0) {
                return state;
            }
            const acceptedRequest = state.incomingRequests[requestIndex];
            const user = {
                id: acceptedRequest.fromId,
                username: acceptedRequest.from
            };
            const newIncoming = state.incomingRequests.slice();
            newIncoming.splice(requestIndex, 1);
            if (state.friendsList) {
                return {
                    ...state,
                    friendsList: [...state.friendsList, user],
                    incomingRequests: newIncoming
                };
            } else {
                return {
                    ...state,
                    friendsList: [user],
                    incomingRequests: newIncoming
                };
            }

        case REMOVE_FRIEND:
            const friendIndex = state.friendsList
                .map(friend => friend.id)
                .indexOf(action.payload);
            if (friendIndex < 0) {
                return state;
            } else {
                const newList = state.friendsList.slice();
                newList.splice(friendIndex, 1);
                return {
                    ...state,
                    friendsList: newList
                };
            }
        case REMOVE_REQUEST:
            const incomingIndex = state.incomingRequests
                .map(request => request.id)
                .indexOf(action.payload);
            if (incomingIndex >= 0) {
                const newIn = state.incomingRequests.slice();
                newIn.splice(incomingIndex, 1);
                return {
                    ...state,
                    incomingRequests: newIn
                };
            }
            const outgoingIndex = state.outgoingRequests
                .map(request => request.id)
                .indexOf(action.payload);
            if (outgoingIndex >= 0) {
                const newOut = state.outgoingRequests.slice();
                newOut.splice(outgoingIndex, 1);
                return {
                    ...state,
                    outgoingRequests: newOut
                };
            }
            break;
        case SEARCH_USERS:
            return {
                ...state,
                loadingSearch: false,
                searchResult: action.payload
            };
        case CLEAR_SEARCH:
            return {
                ...state,
                loadingSearch: false,
                searchResult: null
            };
        case SEARCH_LOADING:
            return {
                ...state,
                loadingSearch: true
            };
        case FRIENDS_LOADING:
            return {
                ...state,
                loadingFriends: action.payload
            };
        case REQUESTS_LOADING:
            return {
                ...state,
                loadingRequests: action.payload
            };
        case CLEAR_FRIENDS:
            return {
                friendsList: null,
                incomingRequests: null,
                outgoingRequests: null,
                loading: false
            };
        default:
            return state;
    }
}
