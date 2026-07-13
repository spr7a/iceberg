const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/connectDB');

const authRoutes = require('./routes/authRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { startMonthlyResetJob } = require('./cron/decayTrending');

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors());


app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/media', mediaRoutes);
app.use(errorHandler);

startMonthlyResetJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
