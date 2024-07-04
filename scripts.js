/*
  --------------------------------------------------------------------------------------
  Function to fetch the list of rentals from the server via a GET request
  --------------------------------------------------------------------------------------
*/
const getRentals = async () => {
  const url = 'http://127.0.0.1:5000/rentals';
  try {
    const response = await fetch(url, { method: 'GET' });

    // Check if the response is okay (status code 200-299)
    if (!response.ok) throw new Error('Failed to fetch rentals');

    const data = await response.json();

    // Populate the rental list with data from the server
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
  Call the function to load initial data when the script is loaded
  --------------------------------------------------------------------------------------
*/
getRentals();

/*
  --------------------------------------------------------------------------------------
  Function to send a POST request to the server to add a new rental
  --------------------------------------------------------------------------------------
*/
const postRental = async (userId, carId, rentalStartDate, rentalEndDate, totalPrice) => {
  const rentalData = new FormData();
  rentalData.append('user_id', userId);
  rentalData.append('car_id', carId);
  rentalData.append('rental_start_date', rentalStartDate);
  rentalData.append('rental_end_date', rentalEndDate);
  rentalData.append('total_price', totalPrice);

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
    getRentals();  // Refresh the list of rentals
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding rental: ' + error.message);
  }
}

/*
  --------------------------------------------------------------------------------------
  Function to create a close button for each rental item in the table
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  const span = document.createElement("span");
  const textNode = document.createTextNode("\u00D7");  // Unicode for '×' symbol
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
        const row = button.closest('tr');  // Get the closest <tr> element
        const rentalId = row.cells[0].textContent;  // Get the rental ID from the first cell
        row.remove();  // Remove the row from the table
        await deleteRental(rentalId);  // Call the delete function
        alert("Rental removed!");  // Notify the user
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
  const url = `http://127.0.0.1:5000/rental?id=${encodeURIComponent(rentalId)}`;  // URL with rental ID as a query parameter
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
  const totalPrice = document.getElementById("totalPrice").value;

  // Validate input fields
  if (!userId || !carId || !rentalStartDate || !rentalEndDate || !totalPrice) {
    alert("All fields are required!");
  } else if (isNaN(userId) || isNaN(carId)) {
    alert("User ID and Car ID must be numbers!");
  } else if (isNaN(totalPrice)) {
    alert("Total price must be a number!");
  } else if (new Date(rentalStartDate) >= new Date(rentalEndDate)) {
    alert("End date must be after start date!");
  } else {
    postRental(userId, carId, rentalStartDate, rentalEndDate, totalPrice);
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

  // Insert rental data into the table row
  rentalData.forEach((item, index) => {
    const cell = row.insertCell(index);
    cell.textContent = item;
  });

  // Add a close button to the end of the row
  insertButton(row.insertCell(-1));
  removeElement();  // Attach event listeners to all close buttons
}

/*
  --------------------------------------------------------------------------------------
  Add a form submit listener to call the newRental function when the form is submitted
  --------------------------------------------------------------------------------------
*/
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rentalForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    newRental();
  });
});
