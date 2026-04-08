import { db, auth } from "./firebase.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.querySelector("#card-container");
  const emptyState = document.getElementById("empty-state");
  const loadingState = document.getElementById("loading-state");
  const addBtn = document.getElementById("add-student-btn");
  const adminEmail = "elemide.j.dev@gmail.com"; // Admin email

  function capitalizeWord(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // ===== Admin-only Access =====
  onAuthStateChanged(auth, (user) => {
    if (!user || user.email !== adminEmail) {
      window.location.href = "login.html"; // redirect non-admin
      return;
    }

    // ===== Show loading state =====
    loadingState.style.display = "block";

    const studentsCollection = collection(db, "students");

    // ===== Real-time listener =====
    onSnapshot(studentsCollection, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setTimeout(() => {
        loadingState.style.display = "none";
        cardContainer.innerHTML = "";

        if (students.length === 0) {
          emptyState.classList.remove("hidden");
        } else {
          emptyState.classList.add("hidden");

          students.forEach((student, index) => {
            const studentCard = document.createElement("div");
            studentCard.classList.add("student-card");
            studentCard.setAttribute("role", "button");
            studentCard.setAttribute("tabIndex", 0);

            studentCard.addEventListener("click", () => {
              window.location.href = `students-detail-page.html?id=${student.id}`;
            });

            studentCard.addEventListener("keypress", (e) => {
              if (e.key === "Enter")
                window.location.href = `students-detail-page.html?id=${student.id}`;
            });

            // Fade-in animation
            studentCard.style.opacity = 0;
            studentCard.style.transform = "translateY(20px)";
            studentCard.style.animation = `fadeInUp 0.5s forwards`;
            studentCard.style.animationDelay = `${index * 0.2}s`;

            studentCard.innerHTML = `
              <div class="card-header">
                <img src="${student.imgSrc}" alt="Student Profile" class="avatar">
                <div class="header-info">
                  <h3>${capitalizeWord(student.firstName)} ${capitalizeWord(student.lastName)}</h3>
                  <p class="dept">${capitalizeWord(student.studentDepartment)} Department • Ss 1</p>
                </div>
              </div>

              <div class="card-body">
                <div class="contact-item">
                  <i class="ph ph-phone"></i>
                  <span>${student.phoneNumber ?? "-"}</span>
                </div>
                <div class="contact-item">
                  <i class="ph ph-envelope-simple"></i>
                  <span>${student.email ?? "-"}</span>
                </div>
              </div>

              <div class="card-footer">
                ${capitalizeWord(
                  (student.subjects ?? [])
                    .slice(0, 3)
                    .map((sub) => `<span class="subject-tag">${sub}</span>`)
                    .join(""),
                )}
              </div>
            `;

            cardContainer.appendChild(studentCard);
          });
        }
      }, 300); // smooth loader delay
    });

    // ===== Add student button =====
    addBtn.addEventListener("click", () => {
      window.location.href = "sign-up.html";
    });
  });
});