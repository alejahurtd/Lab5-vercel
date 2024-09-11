const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let availableDrivers = [];
let trips = [];

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/driver', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});

app.get('/passenger', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'passenger.html'));
});

io.on('connection', (socket) => {
	console.log('A user connected');

	// Enviar la lista de conductores
	socket.on('get_available_drivers', () => {
		io.emit('update_available_drivers', availableDrivers);
	});

	// Activar cosito o desactivar
	socket.on('activate_driver', (driverData) => {
		availableDrivers.push(driverData);
		io.emit('update_available_drivers', availableDrivers);
	});

	socket.on('deactivate_driver', (driverData) => {
		availableDrivers = availableDrivers.filter((driver) => driver.name !== driverData.name);
		io.emit('update_available_drivers', availableDrivers);
	});

	// Solicitud
	socket.on('request_ride', (rideRequest) => {
		const tripId = Math.random().toString(36).substring(7); // ID
		const tripData = {
			tripId: tripId,
			passengerName: rideRequest.passengerName,
			origin: rideRequest.origin,
			destination: rideRequest.destination,
			status: 'Pendiente',
		};

		console.log('Trip requested:', tripData);
		socket.broadcast.emit('new_trip_request', tripData); // Enviar
		console.log('new_trip_request sent to drivers');
	});

	// Aceptar conductor
	socket.on('accept_trip', (tripData) => {
		tripData.status = 'Aceptado';
		trips.push(tripData);
		io.emit('trip_accepted', tripData);
		console.log(`Trip accepted by driver: ${tripData.driver}`);
	});

	// nicio del viaje conductor
	socket.on('start_trip', (tripData) => {
		let trip = trips.find((t) => t.tripId === tripData.tripId);
		if (trip) {
			trip.status = 'En progreso';
			io.emit('trip_started', trip); // Notificar a todos los pasajeros
			console.log(`Trip started: ${trip.tripId}`);
		}
	});

	//  finalización del viaje por parte del conductor
	socket.on('finish_trip', (tripData) => {
		trips = trips.filter((t) => t.tripId !== tripData.tripId);
		io.emit('trip_finished', { tripId: tripData.tripId });
		console.log(`Trip finished: ${tripData.tripId}`);
	});

	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

// Iniciar el servidor
server.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
});
