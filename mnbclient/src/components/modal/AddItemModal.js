import React, { Component } from 'react';
import { connect } from 'react-redux';

import InputGroup from '../common/InputGroup';

import { createList, addItem } from '../../actions/listActions';
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

        const newItem = {
            name: this.state.name,
            quantity: this.state.quantity
        };

        this.props.addItem(newItem, this.props.list);
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
                        <div className="form-title">Add&nbsp;Item</div>
                        <div
                            className="close-modal-button"
                            onClick={this.props.closeModal}
                        >
                            <img src="/icons/close.svg" alt="close" />
                        </div>
                    </div>
                    <form onSubmit={this.onSubmit} noValidate method="post">
                        <InputGroup
                            type="text"
                            name="name"
                            label="Item name"
                            onChange={this.onChange}
                            error={errors.username}
                        />
                        <InputGroup
                            type="number"
                            name="quantity"
                            label="Quantity"
                            onChange={this.onChange}
                            error={errors.quantity}
                        />
                        <input
                            className="submit-button"
                            type="submit"
                            value="Add"
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
    { createList, addItem, closeModal }
)(CreateListModal);
