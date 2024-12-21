import React, { useEffect, useState } from 'react';

function Packages() {
    const [packages, setPackages] = useState([]);

    useEffect(() => {
        fetch('/packages')
            .then((response) => response.json())
            .then((data) => setPackages(data))
            .catch((error) => console.error('Error fetching packages:', error));
    }, []);

    return (
        <div className="packages">
            <h2>Available Packages</h2>
            <ul>
                {packages.map((pkg) => (
                    <li key={pkg.id}>{pkg.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default Packages;
