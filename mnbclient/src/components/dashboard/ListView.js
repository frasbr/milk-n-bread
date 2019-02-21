import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { getLists } from '../../actions/listActions';

import { ListPreview } from './ListPreview';

class ListView extends Component {
    constructor() {
        super();
        this.state = {
            lists: null,
            errors: {}
        };
    }

    componentDidMount() {
        this.props.getLists();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.lists) {
            this.setState({ lists: nextProps.lists });
        }

        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors });
        }
    }

    render() {
        const { lists } = this.state;
        let listItems;
        if (lists && lists.userLists) {
            listItems = lists.userLists.map(list => {
                return (
                    <Link
                        to={{
                            pathname: `/dashboard/${list._id}`,
                            state: { list: list }
                        }}
                        className="list-preview-link"
                        key={list._id}
                    >
                        <ListPreview
                            name={list.name}
                            users={list.contributors.map(
                                contributor => contributor.username
                            )}
                            desc={list.description}
                        />
                    </Link>
                );
            });
        } else if (lists && lists.loading) {
            listItems = <h2>Loading...</h2>;
        } else {
            listItems = <h2>No lists :(</h2>;
        }

        return listItems;
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    lists: state.lists
});

export default connect(
    mapStateToProps,
    { getLists }
)(withRouter(ListView));
