import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const signupForm = document.getElementById("signup-form");
const errorMsg = document.getElementById("error-msg");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    errorMsg.textContent = "Email and password are required";
    return;
  }

  try {
    // Create account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Redirect to profile completion page with UID
    window.location.href = `profile-completion-page.html?uid=${userCredential.user.uid}`;
  } catch (error) {
    console.error("Sign up error:", error);
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMsg.textContent =
          "This email is already registered. Please log in instead.";
        break;
      case "auth/invalid-email":
        errorMsg.textContent = "Invalid email address.";
        break;
      case "auth/weak-password":
        errorMsg.textContent = "Password must be at least 6 characters.";
        break;
      default:
        errorMsg.textContent = "Signup failed. Please try again.";
        break;
    }
  }
});
