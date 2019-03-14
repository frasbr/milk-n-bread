import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ListItem from './ListItem';

import {
    getList,
    deleteList,
    purchaseItem,
    deleteItem,
    removeUserFromList,
    clearList
} from '../../actions/listActions';

import { addItemModal, manageUsersModal } from '../../actions/modalActions';

class ListExpanded extends Component {
    constructor() {
        super();
        this.state = {
            list: null,
            listPoll: null,
            active: []
        };
    }

    deleteList = () => {
        // Prevent everyone except the list author from deleting the list
        if (this.props.auth.user.id !== this.state.list.author) return;

        this.props.deleteList(this.state.list._id);
        this.props.clearList(this.state.list._id);
        this.props.history.goBack();
    };

    removeSelf = () => {
        // Prevent list author from attempting to remove themselves
        if (this.props.auth.user.id === this.state.list.author) return;

        this.props.removeUserFromList(
            this.props.auth.user.id,
            this.state.list._id
        );
        this.props.clearList(this.state.list._id);
        this.props.history.goBack();
    };

    topRightButton = isAuthor => {
        if (isAuthor) {
            return (
                <div className="delete-list" onClick={this.deleteList}>
                    <img src="/icons/delete.svg" alt="delete list" />
                </div>
            );
        } else {
            return (
                <div className="remove-self" onClick={this.removeSelf}>
                    <img src="/icons/close.svg" alt="leave list" />
                </div>
            );
        }
    };

    openAddItemModal = () => {
        this.props.addItemModal(this.state.list._id);
    };

    openManageUsersModal = () => {
        this.props.manageUsersModal(
            this.state.list.contributors,
            this.state.list._id,
            this.state.list.author
        );
    };

    onItemClick = i => {
        this.setState({
            active: this.state.active.map((bool, j) => {
                return i === j ? !bool : false;
            })
        });
    };

    addItem = e => {
        e.preventDefault();
        const itemData = {
            name: this.state.name,
            quantity: this.state.quantity
        };
        this.props.addItem(itemData, this.state.list._id);
    };

    deleteItem = item_id => {
        const newList = Object.assign({}, this.state.list);
        const itemIndex = newList.items.map(item => item._id).indexOf(item_id);
        if (itemIndex >= 0) newList.items.splice(itemIndex, 1);
        this.setState({
            list: newList
        });
        this.props.deleteItem(this.state.list._id, item_id);
    };

    purchaseItem = item_id => {
        this.props.purchaseItem(this.state.list._id, item_id);
    };

    componentWillMount() {
        const { list_id } = this.props.match.params;

        this.props.getList(list_id);
        const listPoll = setInterval(
            () => this.props.getList(list_id),
            1000 * 30
        );
        this.setState({ listPoll: listPoll });
    }

    componentWillUnmount() {
        if (this.state.listPoll) {
            clearInterval(this.state.listPoll);
            this.setState({ listPoll: null });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lists.userLists) {
            const index = nextProps.lists.userLists
                .map(list => list._id)
                .indexOf(this.props.match.params.list_id);
            if (index >= 0) {
                this.setState({ list: nextProps.lists.userLists[index] });
                this.setState({
                    active: nextProps.lists.userLists[index].items.map(
                        () => false
                    )
                });
            }
        }
    }

    goBack = () => {
        this.props.history.goBack();
    };

    render() {
        const { list } = this.state;

        if (!list) {
            return <div />;
        } else {
            const date = new Date(list.published);
            const mm = date.getMonth();
            const dd = date.getDate();
            const dateString = [
                (dd > 9 ? '' : '0') + dd,
                (mm > 9 ? '' : '0') + mm,
                date.getFullYear()
            ].join('/');

            const userIsAuthor = list.author === this.props.auth.user.id;

            return (
                <div className="list-expanded-container">
                    <div className="top-bar">
                        <div className="return-button" onClick={this.goBack}>
                            <img src="/icons/back.svg" alt="back" />
                        </div>
                        {this.topRightButton(userIsAuthor)}
                    </div>
                    <div className="list-expanded">
                        <div className="list-info">
                            <div className="title">{list.name}</div>
                            <div className="contributors">
                                <div className="contributor-names">
                                    {list.contributors.map(
                                        ({ username }, index, arr) => {
                                            if (index !== arr.length - 1) {
                                                return username + ', ';
                                            } else {
                                                return username.toString();
                                            }
                                        }
                                    )}
                                </div>
                                {list.author === this.props.auth.user.id && (
                                    <div
                                        className="contributor-options"
                                        onClick={this.openManageUsersModal}
                                    >
                                        ...
                                    </div>
                                )}
                            </div>
                            <div className="date">{dateString}</div>
                            {list.items.length === 0 && (
                                <div className="no-items">
                                    There are no items on this list. Add one
                                    below
                                </div>
                            )}
                        </div>
                        <div className="list-items">
                            {list.items.map((item, i) => {
                                return (
                                    <ListItem
                                        id={item._id}
                                        name={item.name}
                                        quantity={item.quantity}
                                        purchased={item.purchased}
                                        onClick={this.onItemClick}
                                        onPurchase={this.purchaseItem}
                                        onDelete={this.deleteItem}
                                        active={this.state.active[i]}
                                        index={i}
                                        key={item._id}
                                    />
                                );
                            })}
                        </div>
                        <div
                            className="add-item-button"
                            onClick={this.openAddItemModal}
                        >
                            + Add new item
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    lists: state.lists,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    {
        getList,
        deleteList,
        purchaseItem,
        deleteItem,
        addItemModal,
        removeUserFromList,
        clearList,
        manageUsersModal
    }
)(withRouter(ListExpanded));
