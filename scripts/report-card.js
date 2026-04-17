import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db, auth } from "./firebase.js"; // Make sure you export auth from firebase.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page Loaded!");
  const param = new URLSearchParams(window.location.search);
  const studentId = param.get("id");
  console.log(studentId);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const studentRef = doc(db, "students", studentId);
    const snap = await getDoc(studentRef);

    if (!snap.exists()) {
      alert("Student Not Found!");
      return;
    }

    const student = snap.data();

    renderReportCard(student);
  })

  let teacherComment = document.getElementById("teacher-comment");
  let principalComment = document.getElementById("principal-comment");
  // Variables
  let studentName = document.getElementById("student-name");
  const studentClass = document.getElementById("class");
  const studentGender = document.getElementById("gender");
  const studentPassport = document.getElementById("student-passport");
  const tableBody = document.getElementById("results-body");
  let currentStudentName = "student";
  const totalScore = document.getElementById("total-score");
  const averageScore = document.getElementById("average-score");
  const grade = document.getElementById("grade");

  function renderReportCard(student) {
    currentStudentName = `${student.firstName} ${student.lastName}`;
    studentName.textContent = currentStudentName;
    studentClass.textContent = `SS 1 - ${student.studentDepartment.toUpperCase()}`;
    studentGender.textContent = `${student.gender}`
    studentPassport.setAttribute("src", `${student.imgSrc}`);
    studentPassport.setAttribute("alt", `${student.firstName} ${student.lastName} Image`);
    studentPassport.setAttribute("loading", "lazy");

    const totalSubject = student.subjects.length * 100;
    totalScore.textContent = `${student.overallResults.totalScore} / ${totalSubject}`;

    averageScore.textContent = `${student.overallResults.average.toFixed(1)}%`

    let gradeResult = student.overallResults.grade;
    grade.textContent = gradeResult;

    // Code for Teachers Comment
    if (gradeResult === "A") {
      teacherComment.textContent =
        "Excellent performance this term. You have shown great dedication and hard work. Keep maintaining this high standard and continue striving for greater success.";
      principalComment.textContent = "An excellent performance. Keep the ball rolling"
      grade.style.color = "#16A34A";
    } else if (gradeResult === "B") {
      teacherComment.textContent =
        "Very good performance this term. Your effort is commendable, and you are doing well. With a little more focus and consistency, you can reach the highest level.";
      principalComment.textContent = "A brilliant performance. Keep the good work on."
        grade.style.color = "#2563EB";

    } else if (gradeResult === "C") {
      teacherComment.textContent =
        "Good performance this term. You have made a fair effort, but there is still room for improvement. Put in more dedication next term and you will achieve better results.";
      principalComment.textContent = "An average result, put more effort next term in your weaker subject."
        grade.style.color = "#F59E0B";
    } else if (gradeResult === "D") {
      teacherComment.textContent =
        "Fair performance this term. You need to be more serious and consistent with your studies. With greater effort and determination, you can improve significantly.";
      principalComment.textContent = "A fair performance, put more effort next term."
        grade.style.color = "#EA580C";
    } else {
      teacherComment.textContent =
        "Below average performance this term. More attention and hard work are needed in your studies. Stay determined and put in extra effort next term for better results.";
      principalComment.textContent = "Poor performance, you can still improve in your weaker subject"
        grade.style.color = "#DC2626";
    }

    // Loop through the table
    tableBody.innerHTML = "";
    const studentResults = student.results || {};

    if (Object.keys(studentResults).length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No results available yet</td>
        </tr>
      `;
      return;
    }

    Object.entries(studentResults).forEach(([subjectKey, data]) => {
      const subjectName = subjectKey
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
      
      const row = `
        <tr>
          <td>${subjectName}</td>
          <td>${data.note ?? 0}</td>
          <td>${data.test ?? 0}</td>
          <td>${data.exam ?? 0}</td>
          <td><strong>${data.total ?? 0}</strong></td>
          <td><span class="grade grade-${(data.grade || "f").toLowerCase()}">${data.grade ?? "-"}</span></td>
          <td>${data.comment ?? "-"}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    })
  }


  const downloadButton = document.getElementById("download-pdf");
  const element = document.querySelector(".report-container");

  downloadButton.addEventListener("click", () => {

    element.classList.add("pdf-mode");

    downloadButton.disabled = true;
    downloadButton.textContent = "Generating PDF...";

    requestAnimationFrame(() => {
      setTimeout(() => {
        html2pdf()
          .from(element)
          .set({
            margin: 0,
            filename: `${currentStudentName.replace(/\s+/g, "_")}-report-card.pdf`,
            image: { type: "jpeg", quality: 1 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              scrollY: 0,
              scrollX: 0,
            },
            jsPDF: { format: "a4", orientation: "portrait", unit: "mm" },
          })
          .save()
          .finally(() => {
            element.classList.remove("pdf-mode");
            downloadButton.disabled = false;
            downloadButton.textContent = "Download Report Card (PDF)";
          });
      }, 300);
    })


  })
})