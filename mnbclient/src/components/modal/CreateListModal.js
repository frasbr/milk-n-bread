import React, { Component } from 'react';
import { connect } from 'react-redux';

import InputGroup from '../common/InputGroup';

import { createList } from '../../actions/listActions';
import { closeModal } from '../../actions/modalActions';

class CreateListModal extends Component {
    constructor() {
        super();
        this.state = {
            name: '',
            description: '',
            errors: {}
        };
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();

        const newList = {
            name: this.state.name,
            description: this.state.description
        };

        this.props.createList(newList);
        this.props.closeModal();
    };

    preventModalClose = e => {
        e.stopPropagation();
    };

    render() {
        const { errors } = this.state;

        return (
            <div className="modal-container" onClick={this.preventModalClose}>
                <div className="form-container">
                    <div className="top-bar">
                        <div className="form-title">New&nbsp;list</div>
                        <div
                            className="close-modal-button"
                            onClick={this.props.closeModal}
                        >
                            <img src="/icons/close.svg" alt="close" />
                        </div>
                    </div>
                    <form onSubmit={this.onSubmit} method="post">
                        <InputGroup
                            type="text"
                            name="name"
                            label="List name"
                            onChange={this.onChange}
                            error={errors.username}
                        />
                        <InputGroup
                            type="text"
                            name="description"
                            label="Description"
                            onChange={this.onChange}
                            error={errors.password}
                        />
                        <input
                            className="submit-button"
                            type="submit"
                            value="Add list"
                        />
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { createList, closeModal }
)(CreateListModal);
