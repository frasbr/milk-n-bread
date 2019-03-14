import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, withRouter } from 'react-router-dom';

import ListView from './ListView';
import ListExpanded from './ListExpanded';

import FriendsMenu from './FriendsMenu';
import AccountOptions from './AccountOptions';

import { updateNav } from '../../actions/navActions';

class Dashboard extends Component {
    componentDidMount() {
        this.props.updateNav(this.props.location.pathname);
    }

    componentWillReceiveProps(nextProps) {
        this.props.updateNav(nextProps.location.pathname);
    }

    render() {
        const { match } = this.props;
        return (
            <div className="dashboard">
                <div className="wrapper">
                    <div className="container">
                        <Route path={match.path} exact component={ListView} />
                        <Route
                            path={`${match.path}/list/:list_id`}
                            exact
                            component={ListExpanded}
                        />
                        <Route
                            path={`${match.path}/friends`}
                            exact
                            component={FriendsMenu}
                        />
                        <Route
                            path={`${match.path}/options`}
                            exact
                            component={AccountOptions}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { updateNav }
)(withRouter(Dashboard));
