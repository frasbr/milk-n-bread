import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import jwt_decode from 'jwt-decode';

import './App.css';

import PrivateRoute from './components/common/PrivateRoute';

import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ModalController from './components/modal/ModalController';

import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';

// Check for token
if (localStorage.jwtToken) {
    // Set auth token header auth
    setAuthToken(localStorage.jwtToken);
    // Decode token and get user data and expiration
    const decoded = jwt_decode(localStorage.jwtToken);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));

    // Check for expired token
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());
        // Redirect to login
        window.location.href = '/login';
    }
}

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Route path="/" exact component={Login} key={0} />
                        <Route path="/login" exact component={Login} key={1} />
                        <Route
                            path="/register"
                            exact
                            component={Register}
                            key={2}
                        />
                        <Switch>
                            <PrivateRoute
                                path="/dashboard"
                                component={Dashboard}
                                key={3}
                            />
                        </Switch>
                        <ModalController />
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;
