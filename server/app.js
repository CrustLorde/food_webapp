require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Define Reservation schema
const reservationSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    people: { type: Number, required: true }
}, { timestamps: true });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// MongoDB connection and server start
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Define Reservation model after connection is established
        const Reservation = mongoose.model('Reservation', reservationSchema);

        console.log('Reservation model:', typeof Reservation);
        console.log('Is Reservation a model?', Reservation instanceof mongoose.Model);

        // Define route after Reservation model is created
        app.post('/api/reservations', async (req, res) => {
            try {
                const reservation = new Reservation(req.body);
                await reservation.save();
                res.status(201).json({ message: 'Reservation created successfully' });
            } catch (error) {
                console.error('Error saving reservation:', error);
                res.status(500).json({ message: 'Error creating reservation', error: error.message });
            }
        });

        // Add this route after your existing routes
        app.get('/api/reservations', async (req, res) => {
            try {
                const reservations = await Reservation.find().sort({ date: 1, time: 1 });
                res.json(reservations);
            } catch (error) {
                console.error('Error fetching reservations:', error);
                res.status(500).json({ message: 'Error fetching reservations', error: error.message });
            }
        });

        app.get('/api/reservations/:id', async (req, res) => {
            try {
                const reservation = await Reservation.findById(req.params.id);
                if (!reservation) {
                    return res.status(404).json({ message: 'Reservation not found' });
                }
                res.json(reservation);
            } catch (error) {
                console.error('Error fetching reservation:', error);
                res.status(500).json({ message: 'Error fetching reservation', error: error.message });
            }
        });

        app.get('/api/reservations/date/:date', async (req, res) => {
            try {
                const date = new Date(req.params.date);
                const reservations = await Reservation.find({
                    date: {
                        $gte: date,
                        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
                    }
                }).sort({ time: 1 });
                res.json(reservations);
            } catch (error) {
                console.error('Error fetching reservations by date:', error);
                res.status(500).json({ message: 'Error fetching reservations', error: error.message });
            }
        });

        app.put('/api/reservations/:id', async (req, res) => {
            try {
                const updatedReservation = await Reservation.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true, runValidators: true }
                );
                if (!updatedReservation) {
                    return res.status(404).json({ message: 'Reservation not found' });
                }
                res.json(updatedReservation);
            } catch (error) {
                console.error('Error updating reservation:', error);
                res.status(500).json({ message: 'Error updating reservation', error: error.message });
            }
        });

        app.delete('/api/reservations/:id', async (req, res) => {
            try {
                const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
                if (!deletedReservation) {
                    return res.status(404).json({ message: 'Reservation not found' });
                }
                res.json({ message: 'Reservation deleted successfully' });
            } catch (error) {
                console.error('Error deleting reservation:', error);
                res.status(500).json({ message: 'Error deleting reservation', error: error.message });
            }
        });

        app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

startServer();