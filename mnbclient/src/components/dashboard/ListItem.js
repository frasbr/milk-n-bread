import React, { Component } from 'react';
import classnames from 'classnames';

export default class ListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            purchased: false
        };
    }

    deleteItem = () => {
        this.props.onDelete(this.props.id);
    };

    purchaseItem = e => {
        e.preventDefault();
        this.setState({ purchased: true });
        this.props.onPurchase(this.props.id);
    };

    onClick = e => {
        this.setState({ active: !this.state.active });
    };

    componentDidMount() {
        this.setState({ purchased: this.props.purchased });
    }

    render() {
        return (
            <div
                className={classnames('list-item', {
                    purchased: this.state.purchased,
                    active: this.state.active
                })}
                onClick={this.onClick}
            >
                <div className="quantity">{this.props.quantity}</div>
                <div className="name">{this.props.name}</div>
                <div className="delete-button" onClick={this.deleteItem}>
                    <img src="/icons/close.svg" alt="delete" />
                </div>
                <div className="purchase-button" onClick={this.purchaseItem}>
                    <img src="/icons/cart_tick.svg" alt="" />
                </div>
            </div>
        );
    }
}
