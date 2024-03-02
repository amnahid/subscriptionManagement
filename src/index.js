const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

require('dotenv').config()
// Middleware
app.use(bodyParser.json());
// static
app.use('/',express.static('public'))
// MongoDB Connection
mongoose.connect(process.env.FLASH_KISS_DB)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth.route');
const subscriptionRoutes = require('./routes/subscription.route');

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
