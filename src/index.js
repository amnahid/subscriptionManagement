const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

require('dotenv').config()
// Middleware
app.use(bodyParser.json());
// static
app.use('/', express.static('public'))
// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
// Routes
const authRoutes = require('./routes/auth.route');
const subscriptionRoutes = require('./routes/subscription.route');

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 5000;
//Connect to the database before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})
