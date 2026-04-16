require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Eureka = require('eureka-js-client').Eureka;
const recommendationRoutes = require('./src/routes/recommendation.routes');

const app = express();
const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recommendation';

// Eureka Configuration
// SERVICE_HOSTNAME / EUREKA_HOST are injected by docker-compose for containerized runs.
// Falls back to localhost for local dev.
const SERVICE_HOSTNAME = process.env.SERVICE_HOSTNAME || 'localhost';
const EUREKA_HOST = process.env.EUREKA_HOST || 'localhost';
const EUREKA_PORT = parseInt(process.env.EUREKA_PORT || '8761', 10);

const eurekaClient = new Eureka({
  instance: {
    app: 'recommendation-service',
    hostName: SERVICE_HOSTNAME,
    ipAddr: SERVICE_HOSTNAME,
    statusPageUrl: `http://${SERVICE_HOSTNAME}:${PORT}/health`,
    port: {
      '$': PORT,
      '@enabled': true,
    },
    vipAddress: 'recommendation-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: '/eureka/apps/',
    maxRetries: 10,
    requestRetryDelay: 2000,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recommendations', recommendationRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

// DB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
    
    // Start Eureka Client
    eurekaClient.start((error) => {
      if (error) {
        console.error('Eureka registration failed:', error);
      } else {
        console.log('Registered with Eureka successfully');
      }
    });

    app.listen(PORT, () => {
      console.log(`Recommendation Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
