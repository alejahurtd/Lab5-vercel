const socket = io();
let driverName = '';
let selectedVehicle = '';
let tripId = '';

console.log('Driver.js is loaded');

// Verificar que el conductor esté conectado al servidor
socket.on('connect', () => {
	console.log('Driver connected to the server');
});

// incio
document.getElementById('login-btn').addEventListener('click', () => {
	driverName = document.getElementById('driver-name').value;
	if (driverName) {
		document.getElementById('login').style.display = 'none';
		document.getElementById('vehicle-selection').style.display = 'block';
	}
});

// Placa
document.getElementById('next-btn').addEventListener('click', () => {
	selectedVehicle = document.getElementById('vehicle-select').value;
	if (selectedVehicle) {
		document.getElementById('vehicle-selection').style.display = 'none';
		document.getElementById('trip-info').style.display = 'block';
		//
		socket.emit('activate_driver', {
			name: driverName,
			vehicle: selectedVehicle,
		});
	}
});

// Activar o aceptar viaje
document.getElementById('activate-btn').addEventListener('click', () => {
	const tripData = {
		tripId: Math.random().toString(36).substr(2, 9),
		origin: 'Pickup Location',
		destination: 'Dropoff Location',
		driver: driverName,
		passenger: 'Passenger Name',
		vehicle: selectedVehicle,
		status: 'Aceptado',
	};

	socket.emit('accept_trip', tripData);
});

// Desactivacion
document.getElementById('deactivate-btn').addEventListener('click', () => {
	socket.emit('deactivate_driver', {
		name: driverName,
		vehicle: selectedVehicle,
	});
});

// Nuevo viaje
socket.on('new_trip_request', (tripData) => {
	tripId = tripData.tripId;
	console.log('New trip request received:', tripData);
	// Mostrar los detalles el viaje
	document.getElementById('new-trip').style.display = 'block';
	document.getElementById('trip-details').innerHTML = `
        <p>Origen: ${tripData.origin}</p>
        <p>Destino: ${tripData.destination}</p>
        <p>Pasajero: ${tripData.passengerName}</p>
        <button id="accept-trip-btn">Aceptar Viaje</button>
    `;

	document.getElementById('accept-trip-btn').addEventListener('click', () => {
		socket.emit('accept_trip', {
			tripId: tripData.tripId,
			driver: driverName,
			vehicle: selectedVehicle,
			origin: tripData.origin,
			destination: tripData.destination,
			passenger: tripData.passengerName,
		});

		//
		document.getElementById('new-trip').style.display = 'none';
		document.getElementById('trip-info').innerHTML = `
            <h2>Viaje en Progreso</h2>
            <p>Origen: ${tripData.origin}</p>
            <p>Destino: ${tripData.destination}</p>
            <p>Pasajero: ${tripData.passengerName}</p>
            <button id="start-trip-btn">Iniciar Viaje</button>
        `;

		document.getElementById('start-trip-btn').addEventListener('click', () => {
			socket.emit('start_trip', { tripId: tripData.tripId });

			// AFinalizar
			document.getElementById('trip-info').innerHTML = `
                <h2>Viaje en Progreso</h2>
                <p>Origen: ${tripData.origin}</p>
                <p>Destino: ${tripData.destination}</p>
                <p>Pasajero: ${tripData.passengerName}</p>
                <button id="finish-trip-btn">Finalizar Viaje</button>
            `;

			document.getElementById('finish-trip-btn').addEventListener('click', () => {
				socket.emit('finish_trip', { tripId: tripData.tripId });

				// Resetear la interfaz del conductor
				document.getElementById('trip-info').style.display = 'none';
				document.getElementById('vehicle-selection').style.display = 'block';
			});
		});
	});
});
