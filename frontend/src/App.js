import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './Components/Header/Header';
import Loader from './Components/Loader/Loader';
import Footer from './Components/Footer/Footer';
import ConfirmCodePage from './Components/ConfirmCodePage/ConfirmCodePage';
import News from './Components/news/News';
import Trailer from './Components/Trailerpage/Trailer';
import Support from './support/Support';

// Lazy load components
const Cover = lazy(() => import('./Components/Cover/Cover'));
const VideoPlayer = lazy(() => import('./Components/VideoPlayer/VideoPlayer'));
const CardContainer = lazy(() => import('./Components/CardContainer/CardContainer'));
const GameMenu = lazy(() => import('./Components/GameMenu/GameMenu'));
const UserPage = lazy(() => import('./Components/UserPage/UserPage'));
const RegisterPage = lazy(() => import('./Components/RegisterPage/RegisterPage'));
const Admin = lazy(() => import('./Components/Admin/Admin'));
const Adminpage = lazy(() => import('./Components/AdminPage/Adminpage'));
const Laucherpages = lazy(() => import('./Components/laucherPages/Laucherpages'));
const GameDetail = lazy(() => import('./Components/GameDetail/GameDetail'));

export default class App extends Component {
  state = {
    userId: localStorage.getItem('user_id') || null,
  };

  // Handle user login
  handleLogin = (userId) => {
    localStorage.setItem('user_id', userId);
    this.setState({ userId });
  };

  // Handle user logout
  handleLogout = () => {
    localStorage.removeItem('user_id');
    this.setState({ userId: null });
  };

  render() {
    const { userId } = this.state;

    return (
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header userId={userId} onLogout={this.handleLogout} />
                  <Cover />
                  <VideoPlayer />
                  <CardContainer />
                  <GameMenu />
                  <Footer />
                </>
              }
            />
            <Route path="/user" element={<UserPage userId={userId} />} />
            <Route path="/register" element={<RegisterPage onLogin={this.handleLogin} />} />
            <Route path="/Admin" element={<Admin userId={userId} />} />
            <Route path="/Adminpage" element={<Adminpage userId={userId} />} />
            <Route path="/launcher" element={<Laucherpages userId={userId} />} />
            <Route path="/confirm-code" element={<ConfirmCodePage userId={userId} />} />
            <Route path="/News" element={<News userId={userId} />} />
            <Route path="/TrailerGame" element={<Trailer userId={userId} />} />
            <Route path="/support" element={<Support userId={userId} />} />
            <Route path="/buy/:id" element={<GameDetail userId={userId} />} />
          </Routes>
        </Suspense>
      </Router>
    );
  }
}
