import React from 'react';

export const ListPreview = ({ name, desc, users }) => {
    return (
        <div className="list-preview-container">
            <div className="list-preview-status">
                <div className="list-preview-status-marker" />
            </div>
            <div className="list-preview-text">
                <div className="name">{name}</div>
                <div className="contributors">
                    {users.map((user, index, arr) => {
                        if (index !== arr.length - 1) {
                            return user + ', ';
                        } else {
                            return user.toString();
                        }
                    })}
                </div>
                <div className="desc">{desc}</div>
            </div>
        </div>
    );
};
