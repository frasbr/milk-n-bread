import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import ListView from './ListView';
import ListExpanded from './ListExpanded';

function Dashboard({ match }) {
    return (
        <div>
            <div className="wrapper">
                <div className="container">
                    <Route path={match.path} exact component={ListView} />
                    <Route
                        path={`${match.path}/:list_id`}
                        exact
                        component={ListExpanded}
                    />
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    {}
)(Dashboard);
