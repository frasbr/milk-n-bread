import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    addFriend,
    acceptFriendRequest,
    rejectFriendRequest
} from '../../actions/friendActions';
import { unfriendModal, addUserToListModal } from '../../actions/modalActions';

class Friend extends Component {
    constructor() {
        super();
        this.state = {
            added: false,
            outgoing: false,
            incoming: false,
            isSelf: false
        };
    }

    openAddUserToListModal = () => {
        this.props.addUserToListModal({
            id: this.props.id,
            username: this.props.username
        });
    };

    componentWillMount() {
        if (this.props.id === this.props.auth.user.id) {
            this.setState({ isSelf: true });
            return;
        }
        if (this.props.friends) {
            if (this.props.friends.friendsList) {
                if (
                    this.props.friends.friendsList
                        .map(friend => friend.id)
                        .includes(this.props.id)
                ) {
                    this.setState({ added: true });
                }
            }
            if (this.props.friends.incomingRequests) {
                if (
                    this.props.friends.incomingRequests
                        .map(req => req.from)
                        .includes(this.props.username)
                ) {
                    this.setState({ incoming: true });
                }
            }
            if (this.props.friends.outgoingRequests) {
                if (
                    this.props.friends.outgoingRequests
                        .map(req => req.to)
                        .includes(this.props.username)
                ) {
                    this.setState({ outgoing: true });
                }
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.friends) {
            if (nextProps.friends.friendsList) {
                if (
                    nextProps.friends.friendsList
                        .map(friend => friend.id)
                        .includes(this.props.id)
                ) {
                    this.setState({ added: true });
                } else {
                    this.setState({ added: false });
                }
            }
            if (nextProps.friends.incomingRequests) {
                if (
                    nextProps.friends.incomingRequests
                        .map(req => req.from)
                        .includes(this.props.username)
                ) {
                    this.setState({ incoming: true });
                } else {
                    this.setState({ incoming: false });
                }
            }
            if (nextProps.friends.outgoingRequests) {
                if (
                    nextProps.friends.outgoingRequests
                        .map(req => req.to)
                        .includes(this.props.username)
                ) {
                    this.setState({ outgoing: true });
                } else {
                    this.setState({ outgoing: false });
                }
            }
        }
    }

    openUnfriendModal = () => {
        this.props.unfriendModal(this.props.id);
    };

    addFriend = () => {
        // If user has already sent a request then withdraw it
        if (this.state.outgoing) {
            const reqIndex = this.props.friends.outgoingRequests
                .map(req => req.to)
                .indexOf(this.props.username);
            if (reqIndex < 0) return;

            this.props.rejectFriendRequest(
                this.props.friends.outgoingRequests[reqIndex].id
            );
            return;
        }

        // If user is requesting friendship then accept the request
        if (this.state.incoming) {
            const reqIndex = this.props.friends.incomingRequests
                .map(req => req.from)
                .indexOf(this.props.username);
            if (reqIndex < 0) return;
            this.props.acceptFriendRequest(
                this.props.friends.incomingRequests[reqIndex].id
            );
            this.setState({ added: true });
            return;
        }

        // Otherwise send a new request
        this.props.addFriend(this.props.id);
    };

    rejectFriend = () => {
        this.props.rejectFriendRequest(this.props.request);
    };

    render() {
        const friendOptions = (
            <div className="friend-options">
                <div
                    className="unfriend-button friend-option"
                    onClick={this.openUnfriendModal}
                >
                    <img src="/icons/close.svg" alt="close" />
                </div>
                <div
                    className="invite-button friend-option"
                    onClick={this.openAddUserToListModal}
                >
                    <img src="/icons/invite.svg" alt="invite" />
                </div>
            </div>
        );

        const notFriendClassName = this.state.outgoing
            ? 'friend-option coloured outgoing'
            : this.state.incoming
            ? 'friend-option coloured incoming'
            : 'friend-option coloured';

        const notFriendOptions = (
            <div className="friend-options">
                {this.state.incoming && (
                    <div
                        className="friend-option coloured reject"
                        onClick={this.rejectFriend}
                    >
                        <div className="add-friend-button">
                            <img src="/icons/close.svg" alt="add" />
                        </div>
                    </div>
                )}
                <div className={notFriendClassName} onClick={this.addFriend}>
                    <div className="add-friend-button">
                        <img
                            src={
                                this.state.outgoing
                                    ? '/icons/close.svg'
                                    : this.state.incoming
                                    ? '/icons/tick.svg'
                                    : '/icons/add.svg'
                            }
                            alt="add"
                        />
                    </div>
                </div>
            </div>
        );

        return (
            <div className="friend-item">
                <div className="status">•</div>
                <div className="name">{this.props.username}</div>
                {this.state.added
                    ? friendOptions
                    : this.state.isSelf
                    ? null
                    : notFriendOptions}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    friends: state.friends,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    {
        unfriendModal,
        addFriend,
        acceptFriendRequest,
        rejectFriendRequest,
        addUserToListModal
    }
)(Friend);
