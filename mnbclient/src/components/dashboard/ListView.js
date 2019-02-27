import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { getLists } from '../../actions/listActions';
import { createListModal } from '../../actions/modalActions';

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
            listItems = <h2>You have no shopping lists. Add one below</h2>;
        }

        return (
            <div className="list-view">
                {listItems}
                <button
                    className="add-list"
                    onClick={this.props.createListModal}
                >
                    +
                </button>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    lists: state.lists
});

export default connect(
    mapStateToProps,
    { getLists, createListModal }
)(withRouter(ListView));
