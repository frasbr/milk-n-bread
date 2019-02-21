import React from 'react';

export default function ListItem({
    id,
    name,
    quantity,
    onDelete,
    onPurchase,
    onUpdate
}) {
    const _onDelete = () => {
        onDelete(id);
    };

    const _onPurchase = () => {
        onPurchase(id);
    };

    return (
        <div className="list-item">
            <div className="quantity">{quantity}</div>
            <div className="name">{name}</div>
            <div className="delete-button" onClick={_onDelete}>
                <img src="/icons/close.svg" alt="delete" />
            </div>
            <div className="purchase-button" onClick={_onPurchase}>
                <img src="/icons/cart_tick.svg" alt="" />
            </div>
        </div>
    );
}
