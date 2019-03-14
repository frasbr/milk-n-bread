import React, { Component } from 'react';
import { connect } from 'react-redux';

import CreateListModal from './CreateListModal';
import AddItemModal from './AddItemModal';
import UnfriendModal from './UnfriendModal';
import AddUserToListModal from './AddUserToListModal';
import ManageUsersModal from './ManageUsersModal';

import { closeModal } from '../../actions/modalActions';

class ModalController extends Component {
    constructor() {
        super();
        this.state = {
            modal: null
        };
    }

    componentWillMount() {
        this.setState({ modal: this.props.modal });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.modal) {
            this.setState({ modal: nextProps.modal });
        }
    }

    render() {
        let modalComponent = null;
        if (!this.state.modal.open) {
            return null;
        } else {
            switch (this.state.modal.type) {
                case 'CREATE_LIST':
                    modalComponent = <CreateListModal />;
                    break;
                case 'ADD_ITEM':
                    modalComponent = (
                        <AddItemModal list={this.state.modal.data} />
                    );
                    break;
                case 'UNFRIEND':
                    modalComponent = (
                        <UnfriendModal friend={this.state.modal.data} />
                    );
                    break;
                case 'ADD_USER_TO_LIST':
                    modalComponent = (
                        <AddUserToListModal
                            id={this.state.modal.data.id}
                            username={this.state.modal.data.username}
                        />
                    );
                    break;
                case 'MANAGE_USERS':
                    modalComponent = (
                        <ManageUsersModal
                            contributors={this.state.modal.data.contributors}
                            list={this.state.modal.data.list_id}
                            author={this.state.modal.data.author}
                        />
                    );
                    break;
                default:
                    break;
            }
        }
        return (
            <div className="modal-background" onClick={this.props.closeModal}>
                {modalComponent}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    modal: state.modal,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { closeModal }
)(ModalController);
