const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow other origins as needed
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data file paths
const usersDataPath = path.join(__dirname, '..', 'src', 'data', 'users.json');
const surveysDataPath = path.join(__dirname, 'data', 'surveys.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize surveys file if it doesn't exist
if (!fs.existsSync(surveysDataPath)) {
  fs.writeFileSync(surveysDataPath, JSON.stringify({ surveys: [] }, null, 2));
}

// Helper functions
const readUsers = () => {
  try {
    if (fs.existsSync(usersDataPath)) {
      const data = fs.readFileSync(usersDataPath, 'utf8');
      return JSON.parse(data);
    } else {
      console.error('Users file not found at:', usersDataPath);
      return { users: [] };
    }
  } catch (error) {
    console.error('Error reading users data:', error);
    return { users: [] };
  }
};

const writeUsers = (userData) => {
  try {
    fs.writeFileSync(usersDataPath, JSON.stringify(userData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users data:', error);
    return false;
  }
};

const readSurveys = () => {
  try {
    const data = fs.readFileSync(surveysDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading surveys data:', error);
    return { surveys: [] };
  }
};

const writeSurveys = (surveyData) => {
  try {
    fs.writeFileSync(surveysDataPath, JSON.stringify(surveyData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing surveys data:', error);
    return false;
  }
};

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hotel Survey API is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication APIs

// Login User
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password: password ? '***' : 'missing' });
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const userData = readUsers();
    console.log('Loaded users:', userData.users.map(u => ({ username: u.username, role: u.role })));
    
    const user = userData.users.find(u => u.username === username && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      console.log('Login successful for user:', userWithoutPassword.username);
      res.json({
        success: true,
        user: userWithoutPassword,
        token: token
      });
    } else {
      console.log('Login failed - invalid credentials');
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get User Details
app.get('/api/user/:username', (req, res) => {
  const { username } = req.params;
  const userData = readUsers();
  const user = userData.users.find(u => u.username === username);

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

// Survey APIs

// Submit Survey
app.post('/api/submitSurvey', (req, res) => {
  const { hotelName, surveyData, username } = req.body;

  if (!hotelName || !surveyData || !username) {
    return res.status(400).json({
      success: false,
      message: 'Hotel name, survey data, and username are required'
    });
  }

  try {
    // Save survey data
    const surveys = readSurveys();
    const surveyKey = `${hotelName}_${username}`;
    const newSurvey = {
      id: surveyKey,
      hotelName,
      username,
      surveyData,
      submittedAt: new Date().toISOString()
    };
    
    surveys.surveys.push(newSurvey);
    
    if (writeSurveys(surveys)) {
      // Update user's hotel completion status
      const userData = readUsers();
      const userIndex = userData.users.findIndex(u => u.username === username);
      
      if (userIndex !== -1) {
        const hotelIndex = userData.users[userIndex].hotels.findIndex(h => h.name === hotelName);
        if (hotelIndex !== -1) {
          userData.users[userIndex].hotels[hotelIndex].completed = true;
          writeUsers(userData);
        }
      }

      res.json({
        success: true,
        message: 'Survey submitted successfully',
        surveyId: surveyKey
      });
    } else {
      throw new Error('Failed to save survey data');
    }
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get User's Surveys
app.get('/api/surveys/:username', (req, res) => {
  const { username } = req.params;
  const surveys = readSurveys();
  
  const userSurveys = surveys.surveys.filter(survey => survey.username === username);
  
  res.json({
    success: true,
    surveys: userSurveys
  });
});

// Get Survey by Hotel Name
app.get('/api/hotelSurvey/:hotelName', (req, res) => {
  const { hotelName } = req.params;
  const surveys = readSurveys();
  
  const hotelSurveys = surveys.surveys.filter(survey => 
    survey.hotelName === decodeURIComponent(hotelName)
  );
  
  res.json({
    success: true,
    surveys: hotelSurveys
  });
});

// Get All Surveys (Admin only)
app.get('/api/surveys', (req, res) => {
  const surveys = readSurveys();
  
  res.json({
    success: true,
    surveys: surveys.surveys,
    count: surveys.surveys.length
  });
});

// Get Survey Statistics
app.get('/api/stats', (req, res) => {
  const userData = readUsers();
  const surveys = readSurveys();
  
  const totalHotels = userData.users.reduce((total, user) => total + (user.hotels ? user.hotels.length : 0), 0);
  const completedSurveys = surveys.surveys.length;
  const pendingSurveys = totalHotels - completedSurveys;
  
  const userStats = userData.users.map(user => {
    const userSurveys = surveys.surveys.filter(s => s.username === user.username);
    return {
      username: user.username,
      group: user.group,
      role: user.role || 'field_agent',
      totalHotels: user.hotels ? user.hotels.length : 0,
      completedSurveys: userSurveys.length,
      pendingSurveys: (user.hotels ? user.hotels.length : 0) - userSurveys.length
    };
  });

  res.json({
    success: true,
    overview: {
      totalHotels,
      completedSurveys,
      pendingSurveys,
      totalUsers: userData.users.length
    },
    userStats
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Hotel Survey API server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Users file path: ${usersDataPath}`);
  console.log(`Surveys file path: ${surveysDataPath}`);
  
  // Check users file
  const userData = readUsers();
  console.log(`Loaded ${userData.users.length} users`);
  if (userData.users.length > 0) {
    console.log('Available users:', userData.users.map(u => ({ username: u.username, role: u.role || 'field_agent' })));
  }
});

module.exports = app;
