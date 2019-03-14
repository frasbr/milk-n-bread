import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import Friend from './Friend';

import {
    getFriends,
    getRequests,
    searchUsers
} from '../../actions/friendActions';
import { debounce } from '../../utils/debounce';

class FriendsMenu extends Component {
    constructor() {
        super();
        this.state = {
            searchBarOpen: false,
            search: '',
            searchResult: null,
            currentlyTyping: false,
            loadingFriends: true,
            loadingRequests: false,
            loadingSearch: false,
            friendsPoll: null,
            friends: [],
            incomingRequests: [],
            outgoingRequests: [],
            debouncedSearch: null,
            errors: {}
        };
        this.typingDebounced = debounce(() => {
            this.setState({ currentlyTyping: false });
        }, 450);
    }

    toggleSearch = () => {
        this.setState({
            searchBarOpen: !this.state.searchBarOpen,
            search: '',
            searchResult: null
        });
    };

    onSearchChange = e => {
        let query = e.target.value;
        query = '' ? null : query;
        this.setState({ search: query });
        this.setCurrentlyTyping();
        if (query && query.length > 1 && this.state.debouncedSearch) {
            this.state.debouncedSearch(query);
        } else {
            this.setState({ searchResult: null });
        }
    };

    setCurrentlyTyping = () => {
        this.setState({ currentlyTyping: true });
        this.typingDebounced();
    };

    componentWillMount() {
        this.props.getFriends();
        this.props.getRequests();
        const friendsPoll = setInterval(() => {
            this.props.getFriends();
            this.props.getRequests();
        }, 1000 * 30);
        this.setState({ friendsPoll: friendsPoll });
    }

    componentWillUnmount() {
        if (this.state.friendsPoll) {
            clearInterval(this.state.friendsPoll);
            this.setState({ friendsPoll: null });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.friends) {
            this.setState({
                loadingSearch: nextProps.friends.loadingSearch,
                loadingRequests: nextProps.friends.loadingRequests
            });

            if (nextProps.friends.loadingFriends === false) {
                this.setState({ loadingFriends: false });
            }

            if (nextProps.friends.friendsList) {
                this.setState({ friends: nextProps.friends.friendsList });

                const friendIds = nextProps.friends.friendsList.map(
                    friend => friend.id
                );
                this.state.incomingRequests.forEach((request, i) => {
                    const newFriendIndex = friendIds.indexOf(request.fromId);
                    if (newFriendIndex >= 0) {
                        const newIn = this.state.incomingRequests.slice();
                        newIn.splice(i, 1);
                        this.setState({ incomingRequests: newIn });
                    }
                });
            }
            if (nextProps.friends.incomingRequests) {
                this.setState({
                    incomingRequests: nextProps.friends.incomingRequests
                });
            }
            if (nextProps.friends.outgoingRequests) {
                this.setState({
                    outgoingRequests: nextProps.friends.outgoingRequests
                });
            }
        }

        if (nextProps.friends.searchResult) {
            this.setState({ searchResult: nextProps.friends.searchResult });
        } else if (this.state.searchResult) {
            this.setState({ searchResult: null });
        }

        if (nextProps.searchUsers) {
            this.setState({
                debouncedSearch: debounce(nextProps.searchUsers, 350)
            });
        }

        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors });
        }
    }

    render() {
        const {
            friends,
            incomingRequests,
            outgoingRequests,
            searchResult,
            searchBarOpen,
            loadingSearch,
            loadingFriends,
            currentlyTyping,
            errors
        } = this.state;
        return (
            <div className="list-expanded-container">
                <div className="top-bar with-search">
                    <div className="search-bar">
                        <div
                            className="search-button"
                            onClick={this.toggleSearch}
                        >
                            <img src="/icons/search.svg" alt="back" />
                        </div>
                        {this.state.searchBarOpen && (
                            <input
                                type="text"
                                value={this.state.search}
                                onChange={this.onSearchChange}
                                className="search-bar"
                            />
                        )}
                    </div>
                    <Link to="/dashboard/options">
                        <div className="open-options" onClick={this.deleteList}>
                            <img src="/icons/options.svg" alt="delete list" />
                        </div>
                    </Link>
                </div>
                <div className="list-expanded">
                    <div className="list-info">
                        <div className="title">Friends</div>
                        {this.state.search && (
                            <div className="search-status">
                                {`search results for ${this.state.search}:`}
                            </div>
                        )}
                        {friends.length === 0 &&
                            !loadingFriends &&
                            !this.state.search && (
                                <div className="no-items">
                                    You have no friends. Try searching for one
                                </div>
                            )}
                    </div>
                    <div className="list-items">
                        {loadingSearch && (
                            <div className="search-info loading">
                                Loading...
                            </div>
                        )}
                        {!loadingSearch &&
                            errors.noUsers &&
                            !searchResult &&
                            !currentlyTyping &&
                            this.state.search && (
                                <div className="search-info">
                                    No users found for '{this.state.search}'
                                </div>
                            )}
                        {searchResult &&
                            searchBarOpen &&
                            !loadingSearch &&
                            searchResult.map(user => {
                                return (
                                    <Friend
                                        username={user.username}
                                        id={user.id}
                                        key={user.id}
                                    />
                                );
                            })}
                        {searchResult && searchBarOpen && (
                            <div className="friend-menu-spacer" />
                        )}

                        {incomingRequests.length > 0 && (
                            <div className="friend-menu-spacer">
                                Friend requests
                            </div>
                        )}
                        {incomingRequests.map(request => (
                            <Friend
                                username={request.from}
                                id={request.fromId}
                                key={request.id}
                            />
                        ))}

                        {friends.length === 0 && loadingFriends && (
                            <div className="search-info">
                                Loading friends...
                            </div>
                        )}
                        {friends.length > 0 && (
                            <div className="friend-menu-spacer">Friends</div>
                        )}
                        {friends.map(friend => (
                            <Friend
                                username={friend.username}
                                id={friend.id}
                                key={friend.id}
                            />
                        ))}

                        {outgoingRequests.length > 0 && (
                            <div className="friend-menu-spacer">
                                Sent requests
                            </div>
                        )}
                        {outgoingRequests.map(request => (
                            <Friend
                                username={request.to}
                                id={request.toId}
                                key={request.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    errors: state.errors,
    friends: state.friends,
    lists: state.lists
});

export default connect(
    mapStateToProps,
    { getFriends, getRequests, searchUsers }
)(FriendsMenu);
