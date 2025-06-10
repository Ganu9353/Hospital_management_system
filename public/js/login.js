document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  document.getElementById("msg").textContent = data.message;

  if (res.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = `/dashboard/${data.role.toLowerCase()}`;
  }
});
