import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import * as Tone from 'tone';
import { arena, messe, velodrom, tegel, impfstoff_link, doctolib_availability, doctolib_booking } from './config.json';
import './App.css';

function App() {
  const [termin, setTermin] = useState('');
  const [bookingLink, setBookingLink] = useState('');
  // const [impstoffLinkTermin, setImpstoffLinkTermin] = useState('');
  const impfcenters = [arena, messe, velodrom, tegel];

  useEffect(() => {
    const fetchInterval = setInterval(async () => {
      await loadAvailability();
    }, 5000); // fetch every second

    // Removing the timeout before unmounting the component
    return () => {
      fetchInterval && clearInterval(fetchInterval);
    };
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAvailability = async () => {
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      const date = (new Date()).toJSON().substring(0, 10);

      for await (const location of impfcenters) {
          const time = (new Date()).toLocaleTimeString();
          const url = `${doctolib_availability}?start_date=${date}${location?.query}`;

          console.log(`Checking ${location.name}...`);
          try {
            const response = await axios.get(url, { headers });

            if (!response?.error && response?.status !== 'error') {
              const availabilities = response?.data?.availabilities;
              let result = 'none';
              if (availabilities.length || response?.data?.next_slot) {
                result = `Found ${availabilities.length} Termine. Next: ${response?.data?.next_slot}`;
                setTermin(result);
                setBookingLink(`${doctolib_booking}${location?.id}`);
              }
              console.log(`Check ${location?.name} at ${time}: ${result}`);
            } else {
              console.error('Error loading data', response?.error);
            }
          } catch (error) {
            console.error(error);
          }
      };
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Termin: {termin}
        </p>
        {
          bookingLink && (
            <a
              className="App-link"
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Doctolib
            </a>
          )
        }
      </header>
    </div>
  );
}

export default App;
