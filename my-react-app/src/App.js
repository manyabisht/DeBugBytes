import React, { useState, useEffect } from 'react';

function App() {
  // State to store fetched data
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [customerId, setCustomerId] = useState(1);  // Example customerId

  // Fetch trending destinations from the backend
  useEffect(() => {
    fetch('http://localhost:3000/trending-destinations')
      .then(response => response.json())
      .then(data => setTrendingDestinations(data))
      .catch(error => console.error('Error fetching trending destinations:', error));
  }, []);

  // Fetch personalized recommendations based on customer ID
  useEffect(() => {
    fetch(`http://localhost:3000/recommendations/${customerId}`)
      .then(response => response.json())
      .then(data => setRecommendations(data))
      .catch(error => console.error('Error fetching recommendations:', error));
  }, [customerId]);

  // Fetch available packages from the backend
  useEffect(() => {
    fetch('http://localhost:3000/packages')
      .then(response => response.json())
      .then(data => setPackages(data))
      .catch(error => console.error('Error fetching packages:', error));
  }, []);

  // Function to handle booking a package
  const handleBooking = (packageId) => {
    const bookingData = {
      agentId: 1,  // Example agentId, can be dynamic
      customerId,
      packageId,
    };

    fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
      .then(response => response.json())
      .then(data => alert('Booking created successfully'))
      .catch(error => console.error('Error creating booking:', error));
  };

  return React.createElement('div', { className: 'App' },

    // Displaying Trending Destinations
    React.createElement('h2', null, 'Trending Destinations'),
    React.createElement('ul', null,
      trendingDestinations.map((destination, index) =>
        React.createElement('li', { key: index }, `${destination[0]}: Trend Score = ${destination[1]}`)
      )
    ),

    // Displaying Personalized Recommendations
    React.createElement('h2', null, 'Personalized Recommendations'),
    React.createElement('ul', null,
      recommendations.map((item, index) =>
        React.createElement('li', { key: index }, `Package: ${item.package.name}, Score: ${item.score}`)
      )
    ),

    // Displaying Available Packages
    React.createElement('h2', null, 'Available Packages'),
    React.createElement('ul', null,
      packages.map((pkg, index) =>
        React.createElement('li', { key: index }, `${pkg.name}`)
      )
    ),

    // Booking a package
    React.createElement('h2', null, 'Book a Package'),
    React.createElement('div', null,
      packages.map((pkg, index) =>
        React.createElement('button', { key: index, onClick: () => handleBooking(pkg.id) }, `Book ${pkg.name}`)
      )
    )
  );
}

export default App;
