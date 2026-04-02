import { auth } from "./firebase.js"; // make sure your firebase.js exports `auth`
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

console.log("page loaded")
const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("login-error");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // prevent page reload

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // redirect to student detail page or dashboard
    window.location.href = "students-list.html"; // or dashboard.html
  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Login failed: " + error.message;
  }
});