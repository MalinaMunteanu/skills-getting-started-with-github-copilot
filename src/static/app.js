document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Clear & reset activity select to avoid duplicated options
      activitySelect.innerHTML = '<option value="">Choose an activity</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants (${details.participants.length}/${details.max_participants}):</strong>
            <div class="participants-container"></div>
          </div>
        `;

        // Populate participants as DOM nodes so we can attach delete handlers
        const participantsContainer = activityCard.querySelector('.participants-container');
        if (details.participants.length === 0) {
          participantsContainer.innerHTML = "<p class='no-participants'>No participants yet</p>";
        } else {
          const ul = document.createElement('ul');
          ul.className = 'participants-list';
          details.participants.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p + ' ';

            const del = document.createElement('span');
            del.className = 'delete-icon';
            del.textContent = '🗑️';
            del.dataset.email = p;
            del.style.cursor = 'pointer';
            del.addEventListener('click', async () => {
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/remove?email=${encodeURIComponent(p)}`, { method: 'POST' });
                const body = await res.json();
                if (res.ok) {
                  messageDiv.textContent = body.message;
                  messageDiv.className = 'success';
                  messageDiv.classList.remove('hidden');
                  setTimeout(() => messageDiv.classList.add('hidden'), 3000);
                  await fetchActivities();
                } else {
                  messageDiv.textContent = body.detail || 'Failed to remove participant';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                }
              } catch (err) {
                console.error('Error removing participant:', err);
                messageDiv.textContent = 'Failed to remove participant';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
              }
            });

            li.appendChild(del);
            ul.appendChild(li);
          });
          participantsContainer.appendChild(ul);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so the new participant appears without a page reload
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
