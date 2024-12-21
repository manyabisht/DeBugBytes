require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Supabase URL or Service Key is missing. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Route to fetch trending destinations
app.get('/trending-destinations', async (req, res) => {
    try {
        const { data, error } = await supabase.from('destinations').select('*');

        if (error) throw error;

        // Calculate trends based on `values` field
        const calculateTrends = (data) => {
            const trends = {};
            data.forEach(({ name, values }) => {
                const x = values.map((_, index) => index);
                const y = values;
                const n = x.length;
                const sumX = x.reduce((a, b) => a + b, 0);
                const sumY = y.reduce((a, b) => a + b, 0);
                const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
                const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                trends[name] = slope;
            });
            return Object.entries(trends).sort((a, b) => b[1] - a[1]);
        };

        const trends = calculateTrends(data);
        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch personalized recommendations
app.get('/recommendations/:customerId', async (req, res) => {
    const { customerId } = req.params;

    try {
        // Fetch customer preferences
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single();

        if (customerError) throw customerError;

        // Fetch all packages
        const { data: packages, error: packagesError } = await supabase
            .from('packages')
            .select('*');

        if (packagesError) throw packagesError;

        const preferences = customer.preferences;

        // Calculate package scores based on preferences
        const scoredPackages = packages.map((pkg) => {
            const score = Object.keys(preferences).reduce((sum, key) => {
                return sum + (preferences[key] * (pkg.tags[key] || 0));
            }, 0);
            return { package: pkg, score };
        });

        scoredPackages.sort((a, b) => b.score - a.score);
        res.json(scoredPackages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch all packages
app.get('/packages', async (req, res) => {
    try {
        const { data, error } = await supabase.from('packages').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to create a new booking
app.post('/bookings', async (req, res) => {
    const { agentId, customerId, packageId } = req.body;

    if (!agentId || !customerId || !packageId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { data, error } = await supabase.from('bookings').insert([
            { agent_id: agentId, customer_id: customerId, package_id: packageId },
        ]);

        if (error) throw error;

        res.status(201).json({ message: 'Booking created successfully', booking: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
