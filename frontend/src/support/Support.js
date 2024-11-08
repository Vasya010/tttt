import React, { Component } from 'react';
import Header from '../Components/Header/Header';
import './support.css';

export default class Support extends Component {
  state = {
    name: '',
    email: '',
    message: '',
    success: null,
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.name,
          email: this.state.email,
          message: this.state.message,
        }),
      });

      if (response.ok) {
        this.setState({ success: true });
      } else {
        this.setState({ success: false });
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      this.setState({ success: false });
    }
  };

  render() {
    return (
      <>
        <Header /> {/* Header теперь вне основного контейнера */}
        <div className='support'>
          <h2>Contact Support</h2>
          <form onSubmit={this.handleSubmit} className='support-form'>
            <label>
              Name:
              <input
                type='text'
                name='name'
                value={this.state.name}
                onChange={this.handleChange}
              />
            </label>
            <label>
              Email:
              <input
                type='email'
                name='email'
                value={this.state.email}
                onChange={this.handleChange}
              />
            </label>
            <label>
              Message:
              <textarea
                name='message'
                value={this.state.message}
                onChange={this.handleChange}
              />
            </label>
            <button type='submit'>Send</button>
          </form>
          {this.state.success && <p>Message sent successfully!</p>}
          {this.state.success === false && <p>Failed to send message. Please try again.</p>}
        </div>
      </>
    );
  }
}
