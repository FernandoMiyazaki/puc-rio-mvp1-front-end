/*
  --------------------------------------------------------------------------------------
  Function to fetch the list of rentals from the server via a GET request
  --------------------------------------------------------------------------------------
*/
const getRentals = async () => {
  const url = 'http://127.0.0.1:5000/rentals';
  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) throw new Error('Failed to fetch rentals');

    const data = await response.json();

    data.rentals.forEach(rental => 
      insertRental(rental.id, rental.user_id, rental.car_id, rental.rental_start_date, rental.rental_end_date, rental.total_price)
    );
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch rentals');
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to fetch the list of cars from the server via a GET request
  --------------------------------------------------------------------------------------
*/
const getCars = async () => {
  const url = 'http://127.0.0.1:5000/cars';
  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) throw new Error('Failed to fetch cars');

    const data = await response.json();

    data.cars.forEach(car => 
      insertCar(car.id, car.make, car.model, car.year, car.price_per_day)
    );
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch cars');
  }
}

/*
  --------------------------------------------------------------------------------------
  Call the functions to load initial data when the script is loaded
  --------------------------------------------------------------------------------------
*/
const initializePage = () => {
  getRentals();
  getCars();
}

initializePage();

/*
  --------------------------------------------------------------------------------------
  Function to send a POST request to the server to add a new rental
  --------------------------------------------------------------------------------------
*/
const postRental = async (userId, carId, rentalStartDate, rentalEndDate) => {
  const rentalData = new FormData();
  rentalData.append('user_id', userId);
  rentalData.append('car_id', carId);
  rentalData.append('rental_start_date', rentalStartDate);
  rentalData.append('rental_end_date', rentalEndDate);

  const url = 'http://127.0.0.1:5000/rental';
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: rentalData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add rental');
    }

    alert("Rental added successfully!");
    getRentals();
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding rental: ' + error.message);
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to send a POST request to the server to create a new user account
  --------------------------------------------------------------------------------------
*/
const postAccount = async (name, email, password, driverLicenseNumber) => {
  const accountData = new FormData();
  accountData.append('name', name);
  accountData.append('email', email);
  accountData.append('password', password);
  accountData.append('driver_license_number', driverLicenseNumber);

  const url = 'http://127.0.0.1:5000/user';
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: accountData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create account');
    }

    alert("Account created successfully!");
  } catch (error) {
    console.error('Error:', error);
    alert('Error creating account: ' + error.message);
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to create a close button for each rental item in the table
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  const span = document.createElement("span");
  const textNode = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(textNode);
  parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Function to remove a rental from the list based on clicking the close button
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  document.querySelectorAll(".close").forEach(button => {
    button.addEventListener('click', async () => {
      if (confirm("Are you sure you want to delete this rental?")) {
        const row = button.closest('tr');
        const rentalId = row.cells[0].textContent;
        row.remove();
        await deleteRental(rentalId); 
        alert("Rental removed!");
      }
    });
  });
}

/*
  --------------------------------------------------------------------------------------
  Function to send a DELETE request to the server to remove a rental
  --------------------------------------------------------------------------------------
*/
const deleteRental = async (rentalId) => {
  const url = `http://127.0.0.1:5000/rental?id=${encodeURIComponent(rentalId)}`;
  try {
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete rental');
    }

    console.log('Rental deleted:', rentalId);
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting rental: ' + error.message);
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to validate input data and call the function to post a new rental
  --------------------------------------------------------------------------------------
*/
const newRental = () => {
  const userId = document.getElementById("userId").value;
  const carId = document.getElementById("carId").value;
  const rentalStartDate = document.getElementById("rentalStartDate").value;
  const rentalEndDate = document.getElementById("rentalEndDate").value;

  if (!userId || !carId || !rentalStartDate || !rentalEndDate) {
    alert("All fields are required!");
  } else if (isNaN(userId) || isNaN(carId)) {
    alert("User ID and Car ID must be numbers!");
  } else if (new Date(rentalStartDate) >= new Date(rentalEndDate)) {
    alert("End date must be after start date!");
  } else {
    postRental(userId, carId, rentalStartDate, rentalEndDate);
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to validate input data and call the function to create a new account
  --------------------------------------------------------------------------------------
*/
const newAccount = () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const driverLicenseNumber = document.getElementById("driverLicenseNumber").value;

  if (!name || !email || !password || !driverLicenseNumber) {
    alert("All fields are required!");
  } else {
    postAccount(name, email, password, driverLicenseNumber);
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to insert rental data into the displayed table
  --------------------------------------------------------------------------------------
*/
const insertRental = (id, userId, carId, rentalStartDate, rentalEndDate, totalPrice) => {
  const rentalData = [id, userId, carId, rentalStartDate, rentalEndDate, totalPrice];
  const table = document.getElementById('rentalTable');
  const row = table.insertRow();

  rentalData.forEach((item, index) => {
    const cell = row.insertCell(index);
    cell.textContent = item;
  });

  insertButton(row.insertCell(-1));
  removeElement();
}

/*
  --------------------------------------------------------------------------------------
  Function to insert car data into the car details table
  --------------------------------------------------------------------------------------
*/
const insertCar = (id, make, model, year, pricePerDay) => {
  const carData = [id, make, model, year, pricePerDay];
  const table = document.getElementById('carTable');
  const row = table.insertRow();

  carData.forEach((item, index) => {
    const cell = row.insertCell(index);
    cell.textContent = item;
  });
}

/*
  --------------------------------------------------------------------------------------
  Add a form submit listener to call the newRental function when the form is submitted
  --------------------------------------------------------------------------------------
*/
document.addEventListener('DOMContentLoaded', () => {
  const rentalForm = document.getElementById('rentalForm');
  rentalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    newRental();
  });

  const accountForm = document.getElementById('accountForm');
  accountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    newAccount();
  });

  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      this.classList.add('active');
      document.getElementById(this.dataset.tab).classList.add('active');
    });
  });

  document.querySelector('.tab-link').click();
});
