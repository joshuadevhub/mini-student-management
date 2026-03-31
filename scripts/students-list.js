import { db } from "./firebase.js";
import { collection, onSnapshot} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const cardContainer = document.querySelector("#card-container");
  const emptyState = document.getElementById("empty-state");
  const loadingState = document.getElementById("loading-state");
  const addBtn = document.getElementById("add-student-btn");

  // Show loading animation initially
  loadingState.style.display = "block";

  // Firestore collection reference
  const studentsCollection = collection(db, "students");

  // Real-time listener
  onSnapshot(studentsCollection, (snapshot) => {
    const students = snapshot.docs.map((doc) => doc.data());

    // simulate short loading for smooth UX
    setTimeout(() => {
      loadingState.style.display = "none"; // hide loader
      cardContainer.innerHTML = ""; // clear previous cards

      if (students.length === 0) {
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");

        students.forEach((student, index) => {
          const studentCard = document.createElement("div");
          studentCard.classList.add("student-card");
          studentCard.setAttribute("role", "button");
          studentCard.setAttribute("tabIndex", 0);

          // Stagger fade-in animation
          studentCard.style.opacity = 0;
          studentCard.style.transform = "translateY(20px)";
          studentCard.style.animation = `fadeInUp 0.5s forwards`;
          studentCard.style.animationDelay = `${index * 0.3}s`;

          studentCard.innerHTML = `
            <!-- Top Section -->
            <div class="card-header">
              <img src="${student.imgSrc}" alt="Student Profile" class="avatar">
              <div class="header-info">
                <h3>${student.firstName} ${student.lastName}</h3>
                <p class="dept">${student.studentDepartment} Department • Ss 1</p>
              </div>
            </div>

            <!-- Middle Section -->
            <div class="card-body">
              <div class="contact-item">
                <i class="ph ph-phone"></i>
                <span>${student.phoneNumber}</span>
              </div>
              <div class="contact-item">
                <i class="ph ph-envelope-simple"></i>
                <span>${student.email}</span>
              </div>
            </div>

            <!-- Bottom Section (Tags) -->
            <div class="card-footer">
              ${student.subjects
                .slice(0, 3)
                .map((sub) => `<span class="subject-tag">${sub}</span>`)
                .join("")}
            </div>
          `;

          cardContainer.appendChild(studentCard);
        });
      }
    }, 500); // 500ms delay for loader
  });

  // Add student button
  addBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

});
