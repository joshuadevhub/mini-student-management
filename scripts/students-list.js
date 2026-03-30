document.addEventListener("DOMContentLoaded", () => {
  console.log("Browser Loaded!");

  const students = JSON.parse(localStorage.getItem("students")) || []
  console.log(students);

  const cardContainer = document.querySelector("#card-container");

  students.forEach((student) => {
    const studentCard = document.createElement("div");
    studentCard.classList.add("student-card");
    studentCard.setAttribute("role", "button");
    studentCard.setAttribute("tabIndex", 0);

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
      <span class="subject-tag">${student.subjects[0]}</span>
      <span class="subject-tag">${student.subjects[1]}</span>
      <span class="subject-tag">${student.subjects[2]}</span>
    </div>
    `;
    cardContainer.appendChild(studentCard);
  })
})