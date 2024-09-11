const socket = io();
let passengerName = '';

// incio sesion pasajero
document.getElementById('login-btn').addEventListener('click', () => {
	passengerName = document.getElementById('passenger-name').value;

	if (passengerName) {
		// Ocultar login y mostrar la interfaz de conductores disponibles
		document.getElementById('login').style.display = 'none';
		document.getElementById('available-drivers').style.display = 'block';

		// Solicitar la lista de conductores disponibles al servidor
		socket.emit('get_available_drivers');
	} else {
		alert('Please enter your name');
	}
});

// Mostrar los conductores disponibles
socket.on('update_available_drivers', (availableDrivers) => {
	const driversList = document.getElementById('drivers-list');
	driversList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos conductores

	availableDrivers.forEach((driver) => {
		const driverElement = document.createElement('p');
		driverElement.textContent = `Driver: ${driver.name}, Vehicle: ${driver.vehicle}`;
		driversList.appendChild(driverElement);
	});
});

// Solicitar viaje
document.getElementById('request-ride-btn').addEventListener('click', () => {
	const origin = document.getElementById('origin').value;
	const destination = document.getElementById('destination').value;

	if (origin && destination) {
		// Enviar la solicitud
		socket.emit('request_ride', {
			passengerName: passengerName,
			origin: origin,
			destination: destination,
		});

		// Buscando conductores"
		document.getElementById('available-drivers').style.display = 'none';
		document.getElementById('searching').style.display = 'block';
	} else {
		alert('Please enter both origin and destination');
	}
});

// Escuchar cuando aceptan el viaje
socket.on('trip_accepted', (tripData) => {
	if (tripData.passenger === passengerName) {
		document.getElementById('searching').style.display = 'none';
		document.getElementById('trip-info').style.display = 'block';
		document.getElementById('trip-details').innerHTML = `
            <p>Conductor: ${tripData.driver}</p>
            <p>Placa: ${tripData.vehicle}</p>
            <p>Origen: ${tripData.origin}</p>
            <p>Destino: ${tripData.destination}</p>
            <p>Estado: ${tripData.status}</p>
        `;
	}
});

// comienzo del viajecillo
socket.on('trip_started', (tripData) => {
	if (tripData.passenger === passengerName) {
		document.getElementById('trip-info').style.display = 'block';
		document.getElementById('trip-details').innerHTML = `
            <p>Conductor: ${tripData.driver}</p>
            <p>Placa: ${tripData.vehicle}</p>
            <p>Origen: ${tripData.origin}</p>
            <p>Destino: ${tripData.destination}</p>
            <p>Estado: En progreso</p>
        `;
	}
});

// Finaliza
socket.on('trip_finished', (tripData) => {
	if (tripData.tripId) {
		alert('Your trip has finished!');

		document.getElementById('trip-info').style.display = 'none';
		document.getElementById('available-drivers').style.display = 'block';
		document.getElementById('origin').value = '';
		document.getElementById('destination').value = '';
	}
});
