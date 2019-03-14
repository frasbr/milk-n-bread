import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
    getLists,
    addUserToList,
    removeUserFromList
} from '../../actions/listActions';
import { closeModal } from '../../actions/modalActions';

class AddUserToList extends Component {
    constructor() {
        super();
        this.state = {
            userLists: [],
            selectedLists: [],
            initialSelected: [],
            errors: {}
        };
    }

    componentWillMount() {
        this.props.getLists();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lists.userLists) {
            const userAuthoredLists = nextProps.lists.userLists.filter(
                list => list.author === this.props.auth.user.id
            );
            // Check which lists `this.props.id` belongs to and set state accordingly
            const initialSelectedLists = [];
            userAuthoredLists.forEach(list => {
                if (
                    list.contributors
                        .map(user => user.id.toString())
                        .includes(this.props.id)
                ) {
                    initialSelectedLists.push(list._id);
                }
            });
            this.setState({
                userLists: userAuthoredLists,
                selectedLists: initialSelectedLists,
                initialSelected: initialSelectedLists
            });
        }
    }

    preventModalClose = e => {
        e.stopPropagation();
    };

    selectList = (e, list_id, isSelected) => {
        const newSelected = this.state.selectedLists.slice();
        if (isSelected) {
            newSelected.splice(newSelected.indexOf(list_id), 1);
        } else {
            newSelected.push(list_id);
        }
        this.setState({ selectedLists: newSelected });
    };

    onSubmit = e => {
        e.preventDefault();

        // Check if user was added to a new list
        this.state.selectedLists.forEach(listId => {
            // If user already belongs to list then do nothing
            if (this.state.initialSelected.includes(listId)) return;
            // else add them to the list
            this.props.addUserToList(this.props.id, listId);
        });

        // Check is user was removed from a list
        this.state.initialSelected.forEach(listId => {
            // If user is still selected then do nothing
            if (this.state.selectedLists.includes(listId)) return;
            // else remove them from the list
            this.props.removeUserFromList(this.props.id, listId);
        });

        this.props.closeModal();
    };

    render() {
        const { userLists } = this.state;
        return (
            <div className="modal-container" onClick={this.preventModalClose}>
                <div className="form-container">
                    <div className="top-bar">
                        <div
                            className="form-title"
                            style={{ fontSize: '2.4rem', marginBottom: '10px' }}
                        >
                            {this.props.username}
                        </div>
                        <div
                            className="close-modal-button"
                            onClick={this.props.closeModal}
                        >
                            <img src="/icons/close.svg" alt="close" />
                        </div>
                    </div>
                    <div className="modal-instruction">
                        Select all the lists you wish to include{' '}
                        {this.props.username} in and then hit confirm
                    </div>
                    <div className="list-items">
                        {userLists.map(list => {
                            let isSelected = false;
                            if (this.state.selectedLists.includes(list._id)) {
                                isSelected = true;
                            }
                            return (
                                <div
                                    className="list-selector"
                                    key={list.name}
                                    selected={isSelected}
                                    id={list._id}
                                    onClick={e =>
                                        this.selectList(e, list._id, isSelected)
                                    }
                                >
                                    <div
                                        className={classnames(
                                            { not: !isSelected },
                                            'selected'
                                        )}
                                    />
                                    <div className="name">{list.name}</div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        className="submit-button"
                        value="submit"
                        onClick={this.onSubmit}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    lists: state.lists,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { getLists, addUserToList, removeUserFromList, closeModal }
)(AddUserToList);
