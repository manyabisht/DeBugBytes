import React, { useEffect, useState } from 'react';

function Recommendations({ customerId }) {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        fetch(`/recommendations/${customerId}`)
            .then((response) => {
                if (!response.ok) throw new Error('Customer not found');
                return response.json();
            })
            .then((data) => setRecommendations(data))
            .catch((error) => console.error('Error fetching recommendations:', error));
    }, [customerId]);

    return (
        <div className="recommendations">
            <h2>Personalized Recommendations</h2>
            <ul>
                {recommendations.map(({ package: pkg, score }, index) => (
                    <li key={index}>{pkg.name} - Score: {score.toFixed(2)}</li>
                ))}
            </ul>
        </div>
    );
}

export default Recommendations;
