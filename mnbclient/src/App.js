import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

import './App.css';

import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Route path="/" exact component={Dashboard} />
                        <Route path="/login" exact component={Login} />
                        <Route path="/register" exact component={Register} />
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;
