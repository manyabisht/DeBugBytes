import React, { useEffect, useState } from 'react';
import './TrendingDestinations.css';

function TrendingDestinations() {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        fetch('/trending-destinations')
            .then((response) => response.json())
            .then((data) => setTrending(data))
            .catch((error) => console.error('Error fetching trending destinations:', error));
    }, []);

    return (
        <div className="trending">
            <h2>Trending Destinations</h2>
            <ul>
                {trending.map(([destination, trend], index) => (
                    <li key={index}>{destination} - Trend Score: {trend.toFixed(2)}</li>
                ))}
            </ul>
        </div>
    );
}

export default TrendingDestinations;
