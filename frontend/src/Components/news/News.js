import React, { Component } from 'react';

import './news.css';
import Header from '../Header/Header';

export default class News extends Component {
  render() {
    return (
        <>
        <Header />
    
      <div className='newsPage'>
        
        <h1 className='newsHeader'>Latest News</h1>
        
        <div className='newsItem'>
          <h3>Update 1.0 Released!</h3>
          <p>We’ve launched our latest update featuring new levels, character skins, and performance improvements. Dive in to see what’s new!</p>
        </div>

        <div className='newsItem'>
          <h3>Upcoming Events</h3>
          <p>Stay tuned for our upcoming event, where you can win exclusive rewards and participate in limited-time missions.</p>
        </div>
        
        <div className='newsItem'>
          <h3>Behind the Scenes</h3>
          <p>Get an inside look at the development of our next big release. From concept art to final design, explore the journey!</p>
        </div>
      </div>
      </>
    );
  }
}
