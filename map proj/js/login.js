document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim(); 
  const msgBox = document.getElementById("loginMsg");

  msgBox.textContent = "";
  msgBox.className = "msg";

  if (!username || !password) {
    msgBox.textContent = "Please enter both username and password.";
    msgBox.classList.add("error");
    return;
  }
  try {
    const response = await fetch("forms/validate_login.php", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status} (${response.statusText})`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      msgBox.textContent = result.message + " Redirecting...";
      msgBox.classList.add("success");
      
      // Log the user role for verification
      console.log("User role:", result.role);
      
      setTimeout(() => {
        window.location.href = result.redirect; 
      }, 1000); 

    } else {
      msgBox.textContent = result.message || "Login failed. Invalid JSON response.";
      msgBox.classList.add("error");
    }
  } catch (err) {
    console.error("Fetch/Connection Error:", err);
    msgBox.textContent = "Could not connect to server. Please check console.";
    msgBox.classList.add("error");
  }
});