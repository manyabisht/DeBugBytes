const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Hypothetical data for trending destinations
const destinationData = {
    "Paris": [100, 120, 130],
    "Maldives": [200, 250, 300],
    "Bali": [150, 180, 210],
};

// Dummy data for personalized recommendations
const customers = {
    1: { name: "Alice", preferences: { beach: 5, mountains: 2 } },
    2: { name: "Bob", preferences: { beach: 2, mountains: 4 } },
};

const packages = [
    { id: 1, name: "Beach Paradise", tags: { beach: 5, mountains: 1 } },
    { id: 2, name: "Mountain Retreat", tags: { beach: 1, mountains: 5 } },
];

// Utility function to calculate trends
function calculateTrends(data) {
    const trends = {};
    Object.keys(data).forEach((destination) => {
        const values = data[destination];
        const x = values.map((_, index) => index);
        const y = values;
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        trends[destination] = slope;
    });
    return Object.entries(trends).sort((a, b) => b[1] - a[1]);
}

// Route to fetch trending destinations
app.get('/trending-destinations', (req, res) => {
    const trends = calculateTrends(destinationData);
    res.json(trends);
});

// Route to generate personalized recommendations
app.get('/recommendations/:customerId', (req, res) => {
    const customerId = parseInt(req.params.customerId);
    const customer = customers[customerId];

    if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
    }

    const preferences = customer.preferences;
    const scoredPackages = packages.map((pkg) => {
        const score = Object.keys(preferences).reduce((sum, key) => {
            return sum + (preferences[key] * (pkg.tags[key] || 0));
        }, 0);
        return { package: pkg, score };
    });

    scoredPackages.sort((a, b) => b.score - a.score);
    res.json(scoredPackages);
});

// Route to fetch available packages
app.get('/packages', (req, res) => {
    res.json(packages);
});

// Route to create a new booking
app.post('/bookings', (req, res) => {
    const { agentId, customerId, packageId } = req.body;

    if (!agentId || !customerId || !packageId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const booking = {
        agentId,
        customerId,
        packageId,
        bookingDate: new Date().toISOString(),
    };

    res.status(201).json({ message: "Booking created successfully", booking });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
