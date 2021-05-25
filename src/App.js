import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { backend } from './config.json';

const sampler = new Tone.Sampler({
	urls: {
		"C4": "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		"A4": "A4.mp3",
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

function App() {
  const [termin, setTermin] = useState('нет');
  const [latest, setLatest] = useState('');
  const [bookingLink, setBookingLink] = useState('');

  useEffect(() => {
    const fetchInterval = setInterval(async () => {
      await loadAvailability();
    }, 5000); // fetch every 5 seconds

    // Removing the timeout before unmounting the component
    return () => {
      fetchInterval && clearInterval(fetchInterval);
    };
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAvailability = async () => {
    try {
      const time = (new Date()).toLocaleTimeString();

      fetch(backend)
      .then(async res => await res.json())
  		.then(response => {
        if (response?.result && response?.booking_link) {
          setTermin(response?.result);
          setBookingLink(response?.booking_link);
          setLatest(time);
          window.open(response?.booking_link, "_blank");
          console.log(`Check at ${time}: ${response?.result}`);
          Tone.loaded().then(() => {
          	sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
          });
        } else if (response?.error) {
          console.error('Error loading data', response?.error);
        } else {
          setTermin('нет');
          setBookingLink('');
          console.log(`Check at ${time}: ${response?.result}`);
        }
  		})
  		.catch(error => {
  			console.log(error);
  		});
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h3>
          Termin: &nbsp;  {termin}
        </h3>
        {
          bookingLink ? (
            <a
              className="App-link"
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Забронировать!
            </a>
          ) : (
            <p>
              Предыдущий термин был в &nbsp;{latest}
            </p>
          )
        }
      </header>
    </div>
  );
}

export default App;
