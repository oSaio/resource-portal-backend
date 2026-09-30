// Grab DOM elements
const resourceList = document.getElementById('resource-list');
const resourceSelect = document.getElementById('resource-select');
const bookingForm = document.getElementById('booking-form');
const message = document.getElementById('message');

// Fetch and display resources in both the cards section and dropdown
async function loadResources() {
   try {
      const response = await fetch('/api/resources');

      if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Clear loading indicators
      if (resourceList) resourceList.innerHTML = '';
      if (resourceSelect) resourceSelect.innerHTML = '';

      if (data.length === 0) {
         if (resourceList) resourceList.innerHTML = '<p>No resources found.</p>';
         return;
      }

      data.forEach(item => {
         // 1. Create and append card element
         if (resourceList) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<strong>${item.name}</strong> <span>(${item.category})</span> - <em>${item.status}</em>`;
            resourceList.appendChild(card);
         }

         // 2. Create and append dropdown option
         if (resourceSelect) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            resourceSelect.appendChild(option);
         }
      });
   } catch (error) {
      console.error('Error fetching resources:', error);
      if (resourceList) {
         resourceList.innerHTML = '<p style="color: red;">Failed to load resources from server.</p>';
      }
   }
}

// Handle form submission for creating a booking request
if (bookingForm) {
   bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
         resource_id: Number(resourceSelect.value),
         user_name: document.getElementById('user-name').value.trim(),
         booking_date: document.getElementById('booking-date').value
      };

      try {
         const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
         });

         const result = await response.json();

         if (response.ok) {
            message.style.color = 'green';
            message.textContent = result.message || 'Request submitted successfully!';
            bookingForm.reset();
         } else {
            message.style.color = 'red';
            message.textContent = result.error || 'Failed to submit request.';
         }
      } catch (error) {
         console.error('Error submitting booking:', error);
         message.style.color = 'red';
         message.textContent = 'Network error. Please try again.';
      }
   });
}

// Run immediately when page loads
loadResources();

// Fetch and render all submitted bookings for the admin table
async function loadAdminBookings() {
   const tableBody = document.getElementById('admin-bookings-table');
   if (!tableBody) return;

   try {
      const response = await fetch('/api/bookings');
      const bookings = await response.json();

      if (bookings.length === 0) {
         tableBody.innerHTML = '<tr><td colspan="6">No bookings submitted yet.</td></tr>';
         return;
      }

      tableBody.innerHTML = bookings.map(b => `
      <tr>
        <td>${b.id}</td>
        <td>${b.user_name}</td>
        <td>${b.resource_name}</td>
        <td>${b.booking_date}</td>
        <td><span style="color: orange; font-weight: bold;">${b.status}</span></td>
        <td>
          <button onclick="deleteBooking(${b.id})" style="background: #ff4d4d; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Delete</button>
        </td>
      </tr>
`).join('');
   } catch (error) {
      console.error('Error loading admin bookings:', error);
   }
}

// Handler function to call DELETE API
async function deleteBooking(id) {
   if (!confirm('Are you sure you want to delete this booking?')) return;

   try {
      const response = await fetch(`/api/bookings/${id}`, {
         method: 'DELETE'
      });

      if (response.ok) {
         loadAdminBookings(); // Refresh the table
      } else {
         alert('Failed to delete booking.');
      }
   } catch (error) {
      console.error('Error deleting booking:', error);
   }
}

// Reload the admin table after a new booking is submitted
bookingForm.addEventListener('submit', () => {
   setTimeout(loadAdminBookings, 500);
});

// Load admin bookings when page loads
loadAdminBookings();