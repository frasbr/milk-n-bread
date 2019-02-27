import React, { Component } from 'react';
import { connect } from 'react-redux';

import CreateListModal from './CreateListModal';

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
        let modalComponent;
        if (!this.state.modal.open) {
            return null;
        } else {
            switch (this.state.modal.type) {
                case 'CREATE_LIST':
                    modalComponent = <CreateListModal />;
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
