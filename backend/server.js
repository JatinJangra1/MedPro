const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const connectCloudinary = require('./config/cloudinary');

const userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');
const doctorRouter = require('./routes/doctorRoute');

dotenv.config();
connectDB();
connectCloudinary();

const app = express();
app.use(cors());
app.use(express.json()); // body parser

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor',doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
