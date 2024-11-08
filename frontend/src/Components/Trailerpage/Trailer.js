import React, { Component } from 'react';
import './Trailer.css';
import Header from '../Header/Header';

export default class Trailer extends Component {
  render() {
    return (
      <>
        <Header />

        <div className='Trailerpage'>
          <h1 className='trailerHeader'>Game Trailers</h1>

          <div className='trailerCard'>
            <div className='trailerVideo'>
              {/* Здесь будет вставлен видео трейлер, например, iframe или тег video */}
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Game Trailer" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <h3 className='trailerTitle'>New Game Release: Adventure Awaits</h3>
            <p className='trailerDescription'>
              Check out the latest trailer for our new game, packed with action, adventure, and stunning visuals. Dive into the world we've created!
            </p>
          </div>
          
          {/* Можно добавить дополнительные трейлеры ниже в виде карточек */}
          
        </div>
      </>
    );
  }
}
