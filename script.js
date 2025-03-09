// Toggle between login and signup forms
document.getElementById('show-signup').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('signup-section').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('signup-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
});

// Handle Signup
document.getElementById('signup-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;

  // Generate a random verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  // Save user data temporarily (for demo purposes)
  localStorage.setItem('tempName', name);
  localStorage.setItem('tempEmail', email);
  localStorage.setItem('verificationCode', verificationCode);

  // Simulate sending verification email
  alert(`Verification code sent to ${email}: ${verificationCode}`);

  // Redirect to verification page
  window.location.href = 'verification.html';
});

// Handle Login
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Retrieve saved user data
  const savedEmail = localStorage.getItem('email');
  const savedPassword = localStorage.getItem('password');

  if (email === savedEmail && password === savedPassword) {
    alert('Login successful!');
    window.location.href = 'main.html';
  } else {
    alert('Invalid email or password');
  }
});