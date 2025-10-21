document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("role").value;
  const msgBox = document.getElementById("signupMsg");

  msgBox.textContent = "";
  msgBox.className = "msg";

  if (!username || !password) {
    msgBox.textContent = "Please fill in all fields.";
    msgBox.classList.add("error");
    return;
  }

  try {
    const response = await fetch("forms/save_user.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      msgBox.textContent = result.message + " Redirecting to login...";
      msgBox.classList.add("success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      msgBox.textContent = result.message;
      msgBox.classList.add("error");
    }
  } catch (err) {
    console.error("Error details:", err);
    msgBox.textContent = `Connection error: ${err.message}. Please try again.`;
    msgBox.classList.add("error");
  }
});
