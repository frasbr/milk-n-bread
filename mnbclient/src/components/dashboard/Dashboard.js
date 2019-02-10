import React, { Component } from 'react';

import ListList from './ListList';

export default class Dashboard extends Component {
    render() {
        const dashboardDisplay = ListList;

        return (
            <div>
                <div className="wrapper">
                    <div className="container">{dashboardDisplay}</div>
                </div>
            </div>
        );
    }
}
