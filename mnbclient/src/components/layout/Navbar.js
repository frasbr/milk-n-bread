import React, { Component } from 'react';

export default class Navbar extends Component {
    render() {
        return (
            <nav className="nav nav-main">
                <div className="logo">
                    <img src="/logo.svg" alt="Milk 'n' bread logo" />
                </div>
                <div className="nav-icon">
                    <img src="/icons/list.svg" alt="Lists" />
                </div>
                <div className="nav-icon">
                    <img src="/icons/friends.svg" alt="Friends" />
                </div>
            </nav>
        );
    }
}
