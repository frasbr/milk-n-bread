import React, { Component } from 'react';
import { connect } from 'react-redux';

class ListList extends Component {
    constructor() {
        super();
        this.state = {
            lists: []
        };
    }

    /* componentDidMount() {
        this.props.getLists();
    } */

    render() {
        return <div />;
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    lists: state.lists
});

export default connect(
    mapStateToProps,
    {}
)(ListList);
