import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { db } from "./firebase.js";
import { doc, setDoc} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");
const errorMsg = document.getElementById("login-error");

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

    const user = userCredential.user;

    // Create student document in fire store
    await setDoc(doc(db, "students", user.uid), {
      email: user.email,
      createdAt: new Date(),
      profileCompleted: false,
    });

    // Redirect to profile completion page
    window.location.href = `profile-completion-page.html`;
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

const toggleBtn = document.querySelector("#togglePassword");
const passwordInput = document.querySelector("#password");

toggleBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";

  // Replace the icon properly
  toggleBtn.innerHTML = isPassword
    ? '<i data-lucide="eye-off"></i>'
    : '<i data-lucide="eye"></i>';

  lucide.createIcons();
});
