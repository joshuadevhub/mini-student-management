import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("login-error");

const ADMIN_EMAIL = "elemide.j.dev@gmail.com";

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredentials = await signInWithEmailAndPassword( auth, email, password);
    const user = userCredentials.user;

    // -----------------
    // Admin check
    // -----------------
    if (user.email === ADMIN_EMAIL) {
      window.location.href = "students-list.html";
      return;
    }

    // -----------------
    // Student check
    // -----------------
    const studentRef = doc(db, "students", user.uid);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      // Somehow no student doc exists → force profile completion
      window.location.href = "profile-completion-page.html";
      return;
    }

    const studentData = studentSnap.data();

    // Check if essential fields are filled
    const profileComplete =
      studentData.firstName &&
      studentData.studentDepartment &&
      studentData.subjects &&
      studentData.imgSrc;

    if (!profileComplete) {
      window.location.href = "profile-completion-page.html";
    } else {
      window.location.href = `students-detail-page.html?id=${user.uid}`;
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Login failed: " + error.message;
  }
});