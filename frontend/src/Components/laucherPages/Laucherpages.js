import React, { Component } from 'react';
import { FaDownload } from 'react-icons/fa';
import './Laucherpages.css';

export default class Laucherpages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countdown: 10,
      systemCompatible: false,
      warningMessage: '',
      updateAvailable: false,
      updateMessage: '',
      ageVerified: this.getCookie('ageVerified') === 'true',
      showAgeModal: this.getCookie('ageVerified') !== 'true',
    };
  }

  componentDidMount() {
    this.checkSystemRequirements();
    this.checkForUpdates();

    // Countdown logic
    this.interval = setInterval(() => {
      this.setState((prevState) => ({
        countdown: prevState.countdown > 0 ? prevState.countdown - 1 : 0,
      }));
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval); // Clear interval on component unmount
  }

  checkSystemRequirements = () => {
    const os = this.getOS();
    const memory = navigator.deviceMemory || 4; // Default to 4GB if API not supported
    const screenSize = window.screen.width;
    const processor = this.getProcessorType(); // New method to get processor type

    let systemCompatible = true;
    let warningMessage = '';

    // Check OS
    if (os !== 'Windows 10' && os !== 'Windows 11') {
      systemCompatible = false;
      warningMessage += 'Your operating system is not supported. Please use Windows 10 or 11. ';
    }

    // Check memory (at least 2GB)
    if (memory < 2) {
      systemCompatible = false;
      warningMessage += 'Your device has less than 2GB of RAM, which does not meet the minimum requirements. ';
    } else if (memory < 4) {
      warningMessage += 'Your device has less than 4GB of RAM, which may result in poor performance. ';
    }

    // Check processor type
    if (processor === 'OlderProcessor') {
      systemCompatible = false;
      warningMessage += 'Your processor is too old and is not supported. Please upgrade to at least an Intel Core i3 or equivalent. ';
    }

    // Check screen size as a proxy for GPU capability
    if (screenSize < 1280) {
      systemCompatible = false;
      warningMessage += 'Your screen resolution suggests that your device may not meet the minimum graphics requirements. ';
    }

    // Display system specifications (add this functionality)
    warningMessage += `\n\nYour System Specs: 
    - OS: ${os}
    - RAM: ${memory} GB
    - Screen Width: ${screenSize}px
    - Processor: ${processor}`;

    this.setState({ systemCompatible, warningMessage });
  };

  getProcessorType = () => {
    const userAgent = navigator.userAgent;
    // Checking for older processors (Pentium, Athlon, etc.)
    if (
      (userAgent.includes('Intel') && userAgent.includes('Pentium')) ||
      (userAgent.includes('AMD') && userAgent.includes('Athlon'))
    ) {
      return 'OlderProcessor';
    }
    return 'ModernProcessor';
  };

  checkForUpdates = async () => {
    try {
      const response = await fetch('https://example.com/update-check.json');
      const data = await response.json();
      const latestVersion = data.latestVersion;

      // Assuming you have a way to get the current launcher version
      const currentVersion = '1.0.0'; // Replace with actual launcher version

      if (latestVersion !== currentVersion) {
        this.setState({
          updateAvailable: true,
          updateMessage: `A new version (${latestVersion}) is available!`,
        });
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  getOS = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Windows NT 10.0') !== -1) return 'Windows 10';
    if (userAgent.indexOf('Windows NT 11.0') !== -1) return 'Windows 11';
    return 'Other';
  };

  handleAgeVerification = (verified) => {
    if (verified) {
      this.setCookie('ageVerified', 'true', 30);
      this.setState({ ageVerified: true, showAgeModal: false });
    } else {
      alert('You must be 15 or older to download the launcher.');
    }
  };

  setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  };

  getCookie = (name) => {
    return document.cookie.split('; ').find((row) => row.startsWith(name + '='))?.split('=')[1];
  };

  render() {
    const { countdown, systemCompatible, warningMessage, updateAvailable, updateMessage, ageVerified, showAgeModal } = this.state;

    return (
      <div className="launcher-page">
        <div className="launcher-container">
          <h1 className="launcher-title">Download VorlodGames Launcher</h1>
          <p className="launcher-description animated-text">
            Get ready to dive into an incredible gaming experience. Download the VorlodGames launcher now!
          </p>

          {/* Update available */}
          {updateAvailable && <p className="update-message">{updateMessage}</p>}

          {/* System compatibility check */}
          {systemCompatible ? (
            countdown > 0 ? (
              <p className="countdown-timer">Launcher will be available in {countdown} seconds</p>
            ) : (
              ageVerified ? (
                <a href="/path-to-launcher.exe" className="launcher-download-btn">
                  <FaDownload className="me-2" />
                  Скачать лаунчер
                </a>
              ) : null
            )
          ) : (
            <p className="warning-message">{warningMessage}</p>
          )}

          {/* Launcher requirements */}
          <div className="launcher-requirements">
            <h2>Launcher Requirements:</h2>
            <ul>
              <li>OS: Windows 10/11 (64-bit)</li>
              <li>Processor: Intel Core i5 or better</li>
              <li>Memory: 4 GB RAM</li>
              <li>Storage: 500 MB available space</li>
              <li>Graphics: Intel HD Graphics 4000 or better</li>
            </ul>
          </div>

          {/* Age verification modal */}
          {showAgeModal && (
            <div className="age-modal">
              <div className="age-modal-content">
                <h2>Are you 15 or older?</h2>
                <button onClick={() => this.handleAgeVerification(true)}>Yes</button>
                <button onClick={() => this.handleAgeVerification(false)}>No</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
