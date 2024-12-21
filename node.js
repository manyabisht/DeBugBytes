const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(bodyParser.json());

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Python Backend URL
const PYTHON_SERVER_URL = "http://127.0.0.1:5000";

// Fetch Trending Destinations
app.get("/api/trending-destinations", async (req, res) => {
    try {
        const { data: destinations, error } = await supabase.from("destinations").select("*");
        if (error) throw error;

        const response = await axios.post(`${PYTHON_SERVER_URL}/trending-destinations`, { destinations });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching trending destinations:", error);
        res.status(500).json({ error: "Failed to fetch trending destinations" });
    }
});

// Fetch Personalized Recommendations
app.get("/api/recommendations/:customerId", async (req, res) => {
    const { customerId } = req.params;

    try {
        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single();
        if (customerError) throw customerError;

        const { data: packages, error: packageError } = await supabase.from("packages").select("*");
        if (packageError) throw packageError;

        const response = await axios.post(`${PYTHON_SERVER_URL}/recommendations`, {
            customer,
            packages,
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Node.js server running on http://localhost:${PORT}`);
});
