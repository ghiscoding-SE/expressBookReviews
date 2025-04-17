const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const auth_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const config = require('./config.js');

const app = express();
const JWT_SECRET = 'your-secret-key';

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
});

app.use("/customer", auth_routes);
app.use("/", genl_routes);

app.listen(config.PORT, () => console.log("Server is running on port " + config.PORT));