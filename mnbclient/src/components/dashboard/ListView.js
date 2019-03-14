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

    componentWillMount() {
        this.setState({ lists: this.props.lists.userLists });
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
        if (lists && lists.userLists && lists.userLists.length > 0) {
            listItems = lists.userLists.map(list => {
                return (
                    <Link
                        to={{
                            pathname: `/dashboard/list/${list._id}`,
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
            listItems = <div className="list-view-status-text">Loading...</div>;
        } else {
            listItems = (
                <div className="list-view-status-text">
                    You have no shopping lists. Add one below
                </div>
            );
        }

        return (
            <div className="list-view">
                {listItems}
                <button
                    className="add-list"
                    onClick={this.props.createListModal}
                >
                    <img className="add-icon" src="/icons/close.svg" alt="" />
                </button>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    lists: state.lists,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { getLists, createListModal }
)(withRouter(ListView));
