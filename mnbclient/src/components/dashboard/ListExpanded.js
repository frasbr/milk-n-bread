import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ListItem from './ListItem';
import InputGroup from '../common/InputGroup';

import {
    getList,
    addItem,
    purchaseItem,
    deleteItem
} from '../../actions/listActions';

class ListExpanded extends Component {
    constructor() {
        super();
        this.state = {
            list: null,
            name: '',
            quantity: ''
        };
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
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
        this.props.deleteItem(this.state.list._id, item_id);
    };

    purchaseItem = item_id => {
        this.props.purchaseItem(this.state.list._id, item_id);
    };

    componentDidMount() {
        const { list_id } = this.props.match.params;
        const userLists = this.props.lists.userLists;

        if (userLists) {
            const index = userLists.map(list => list._id).indexOf(list_id);
            if (index < 0) {
                this.props.getList(list_id);
            } else {
                this.setState({ list: userLists[index] });
            }
        } else {
            this.props.getList(list_id);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lists.userLists) {
            const index = nextProps.lists.userLists
                .map(list => list._id)
                .indexOf(this.props.match.params.list_id);
            if (index >= 0) {
                this.setState({ list: nextProps.lists.userLists[index] });
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

            return (
                <div className="list-expanded-container">
                    <div className="top-bar">
                        <div className="return-button" onClick={this.goBack}>
                            <img src="/icons/back.svg" alt="back" />
                        </div>
                        <div className="delete-list" onClick={this.deleteList}>
                            <img src="/icons/close.svg" alt="delete list" />
                        </div>
                    </div>
                    <div className="list-expanded">
                        <div className="list-info">
                            <div className="title">{list.name}</div>
                            <div className="contributors">
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
                            <div className="date">{dateString}</div>
                            {list.items.length === 0 && (
                                <div className="no-items">
                                    There are no items on this list. Add one
                                    below
                                </div>
                            )}
                        </div>
                        <div className="list-items">
                            {list.items.map(item => {
                                return (
                                    <ListItem
                                        id={item._id}
                                        name={item.name}
                                        quantity={item.quantity}
                                        purchased={item.purchased}
                                        onPurchase={this.purchaseItem}
                                        onDelete={this.deleteItem}
                                        key={item._id}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="bottom-form">
                        <form onSubmit={this.addItem}>
                            <InputGroup
                                name="quantity"
                                type="number"
                                value={this.state.quantity}
                                onChange={this.onChange}
                            />
                            <InputGroup
                                name="name"
                                placeholder="item name"
                                type="text"
                                value={this.state.name}
                                onChange={this.onChange}
                            />
                            <input
                                className="submit"
                                type="submit"
                                onSubmit={this.addItem}
                                value="+"
                            />
                        </form>
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
    { getList, addItem, purchaseItem, deleteItem }
)(withRouter(ListExpanded));
