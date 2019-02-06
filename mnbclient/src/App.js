import React, { Component } from 'react';
import './App.css';

import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';

class App extends Component {
    render() {
        return (
            <div className="App">
                <Navbar />
                <Login />
            </div>
        );
    }
}

export default App;
