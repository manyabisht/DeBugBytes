const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Add default middlewares (logger, static files, etc.)
server.use(middlewares);

// Custom route example
server.get('/api/destinations/trending', (req, res) => {
    const data = router.db.get('destinations').filter(dest => dest.popularity > 90).value();
    res.json(data);
});

// Use default router
server.use(router);

// Start server
server.listen(5000, () => {
    console.log('JSON Server is running on http://localhost:5000');
});
