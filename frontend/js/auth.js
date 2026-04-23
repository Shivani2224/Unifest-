async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById("loginBtn");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-pass").value;

  btn.disabled = true;
  btn.textContent = "Signing in...";

  try {
    const response = await api.auth.login({ email, password });
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    toast(`Welcome, ${response.user.name}!`, "success");

    if (response.user.role === "admin") {
      window.location.href = "admin_home.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById("regBtn");

  const userData = {
    name: document.getElementById("reg-name").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    password: document.getElementById("reg-pass").value,
    department: document.getElementById("reg-dept").value,
    year: document.getElementById("reg-year").value,
  };

  btn.disabled = true;
  btn.textContent = "Creating...";

  try {
    await api.auth.register(userData);
    toast("Account created! Please sign in", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
}
