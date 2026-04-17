import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db, auth } from "./firebase.js"; // Make sure you export auth from firebase.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ================= Reusable Functions =================
  function capitalizeWord(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function showErrorFor(input) {
    const formControl = input.parentElement;
    formControl.classList.add("error");
    formControl.classList.remove("success");
  }

  function showSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.classList.remove("error");
    formControl.classList.remove("success");
  }

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function calculateScore(subjectKey) {
    const noteInput = document.getElementById(`note-${subjectKey}`);
    const testInput = document.getElementById(`test-${subjectKey}`);
    const examInput = document.getElementById(`exam-${subjectKey}`);
    const gradeElement = document.getElementById(`grade-${subjectKey}`);
    const badgeStatus = document.getElementById(`passfail-${subjectKey}`);

    const note = parseFloat(noteInput.value) || 0;
    const test = parseFloat(testInput.value) || 0;
    const exam = parseFloat(examInput.value) || 0;

    let isValid = true;

    if (note > 10) {
      showErrorFor(noteInput);
      isValid = false;
    } else {
      showSuccessFor(noteInput);
    }
    if (test > 30) {
      showErrorFor(testInput);
      isValid = false;
    } else {
      showSuccessFor(testInput);
    }

    if (exam > 60) {
      showErrorFor(examInput);
      isValid = false;
    } else {
      showSuccessFor(examInput);
    }
    if (!isValid) return;

    const finalScore = note + test + exam;
    const percentGrade = (finalScore / 100) * 100;

    let grade = "-";
    if (percentGrade >= 70) grade = "A";
    else if (percentGrade >= 60) grade = "B";
    else if (percentGrade >= 50) grade = "C";
    else if (percentGrade >= 40) grade = "D";
    else grade = "F";

    // Update grade color
    if (grade === "A") gradeElement.style.color = "#10b981";
    else if (grade === "F") gradeElement.style.color = "#ef4444";
    else gradeElement.style.color = "orange";

    // Update badge status
    if (["A", "B", "C"].includes(grade)) {
      badgeStatus.textContent = "Passed";
      badgeStatus.style.color = "#10b981";
    } else {
      badgeStatus.textContent = "FAILED";
      badgeStatus.style.color = "#ef4444";
    }

    document.getElementById(`total-${subjectKey}`).textContent = finalScore;
    document.getElementById(`percent-${subjectKey}`).textContent =
      percentGrade.toFixed(1) + "%";
    gradeElement.textContent = grade;
  }

  function calculateOverallResults(subjects) {
    let totalScore = 0;
    let subjectCount = subjects.length;

    subjects.forEach((subject) => {
      const key = subject.toLowerCase().replace(/\s+/g, "-");
      const note =
        parseFloat(document.getElementById(`note-${key}`).value) || 0;
      const test =
        parseFloat(document.getElementById(`test-${key}`).value) || 0;
      const exam =
        parseFloat(document.getElementById(`exam-${key}`).value) || 0;

      totalScore += note + test + exam;
    });

    // Calculate average per subject
    const average = totalScore / subjectCount;

    // Determine total grade
    let totalGrade = "-";
    if (average >= 70) totalGrade = "A";
    else if (average >= 60) totalGrade = "B";
    else if (average >= 50) totalGrade = "C";
    else if (average >= 40) totalGrade = "D";
    else totalGrade = "F";

    // Determine overall status
    const totalStatus = ["A", "B", "C"].includes(totalGrade)
      ? "PASSED"
      : "FAILED";

    // Update HTML elements
    document.getElementById("overall-total").textContent = totalScore;
    document.getElementById("overall-avg").textContent = average.toFixed(1);
    document.getElementById("overall-grade").textContent = totalGrade;
    document.getElementById("overall-status").textContent = totalStatus;

    // Optional color coding
    const gradeEl = document.getElementById("overall-grade");
    const statusEl = document.getElementById("overall-status");
    gradeEl.style.color =
      totalGrade === "F"
        ? "#ef4444"
        : totalGrade === "A"
          ? "#10b981"
          : "orange";
    statusEl.style.color = totalStatus === "FAILED" ? "#ef4444" : "#10b981";

    return { totalScore, average, totalGrade, totalStatus };
  }

  async function saveAllResults(studentId, subjects) {
    const saveBtn = document.getElementById("save-scores-btn");
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    try {
      const studentRef = doc(db, "students", studentId);
      const updates = {};

      subjects.forEach((subject) => {
        const subjectKey = subject.toLowerCase().replace(/\s+/g, "-");
        const note =
          parseFloat(document.getElementById(`note-${subjectKey}`).value) || 0;
        const test =
          parseFloat(document.getElementById(`test-${subjectKey}`).value) || 0;
        const exam =
          parseFloat(document.getElementById(`exam-${subjectKey}`).value) || 0;

        if (!note && !test && !exam) return;

        const total = note + test + exam;
        let grade = "F";
        if (total >= 70) grade = "A";
        else if (total >= 60) grade = "B";
        else if (total >= 50) grade = "C";
        else if (total >= 40) grade = "D";

        const comment = document.getElementById(`comment-${subjectKey}`).value;

        updates[`results.${subjectKey}`] = {
          note,
          test,
          exam,
          total,
          grade,
          comment,
        };
      });

      // Compute overall total
      const overall = calculateOverallResults(subjects);
      updates["overallResults"] = {
        totalScore: overall.totalScore,
        average: overall.average,
        grade: overall.totalGrade,
        status: overall.totalStatus,
      };

      await updateDoc(studentRef, updates);
      showToast("Saved successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save. Try again", "error");
    } finally {
      saveBtn.textContent = "Save Results";
      saveBtn.disabled = false;
    }
  }

  // ================= Variables =================
  const studentProfilePic = document.querySelector("#student-avatar");
  const studentName = document.querySelector("#student-name");
  const studentDepartment = document.querySelector("#student-department");
  const subjectContainer = document.querySelector("#subjects-container");
  const saveButton = document.getElementById("save-scores-btn");
  const finalizeButton = document.getElementById("finalize-scores-btn");
  const param = new URLSearchParams(window.location.search);
  const studentId = param.get("id");
  const ADMIN_EMAILS = ["elemide.j.dev@gmail.com", "peedaddy007@gmail.com"].map(
    (email) => email.toLowerCase(),
  );


  // ================= Load student data =================
  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) return console.log("Student not Found");

  const student = studentSnap.data();

  if (!student.firstName || !student.lastName || !student.subjects) {
    // Redirect to profile completion if missing key info
    window.location.href = `complete-profile.html?uid=${studentId}`;
    return;
  }

  const overall = student.overallResults;

  if (overall) {
    document.getElementById("overall-total").textContent =
      overall.totalScore ?? 0;
    document.getElementById("overall-avg").textContent =
      overall.average?.toFixed(1) ?? "0";
    document.getElementById("overall-grade").textContent = overall.grade ?? "-";
    document.getElementById("overall-status").textContent =
      overall.status ?? "PENDING";

    // Optional color styling
    const gradeEl = document.getElementById("overall-grade");
    const statusEl = document.getElementById("overall-status");

    if (overall.grade === "A") gradeEl.style.color = "#10b981";
    else if (overall.grade === "F") gradeEl.style.color = "#ef4444";
    else gradeEl.style.color = "orange";

    statusEl.style.color = overall.status === "FAILED" ? "#ef4444" : "#10b981";
  }

  studentProfilePic.setAttribute("src", `${student.imgSrc}`);
  studentProfilePic.setAttribute("alt", `${student.firstName} Image`);
  studentName.textContent = capitalizeWord(
    student.firstName + " " + student.lastName,
  );
  studentDepartment.textContent = `Department of ${capitalizeWord(student.studentDepartment)}`;

  student.subjects.forEach((subject) => {
    const subjectCardContainer = document.createElement("div");
    subjectCardContainer.classList.add("subject-card");
    const subjectKey = subject.toLowerCase().replace(/\s+/g, "-");

    subjectCardContainer.innerHTML = `
      <div class="card-header">
        <span class="subject-name">${capitalizeWord(subject)}</span>
        <span class="badge" id="passfail-${subjectKey}">PENDING</span>
      </div>
      <div class="card-content">
        <div class="card-grid-desktop">
          <div class="input-section">
            <div class="field-group">
              <label>Note (/10)</label>
              <input type="number" class="note-score" placeholder="0" min="0" max="10" id="note-${subjectKey}">
            </div>
            <div class="field-group">
              <label>Test (/30)</label>
              <input type="number" class="test-score" placeholder="0" min="0" max="30" id="test-${subjectKey}">
            </div>
            <div class="field-group">
              <label>Exam (/60)</label>
              <input type="number" class="exam-score" placeholder="0" min="0" max="60" id="exam-${subjectKey}">
            </div>
          </div>
          <div class="results-well">
            <div class="res-box"><span class="res-label">Final</span><span class="res-data" id="total-${subjectKey}">0</span></div>
            <div class="res-box"><span class="res-label">Percent</span><span class="res-data" id="percent-${subjectKey}">0%</span></div>
            <div class="res-box"><span class="res-label">Grade</span><span class="res-data" id="grade-${subjectKey}" style="color: var(--accent)">-</span></div>
          </div>
        </div>
        <div class="comment-box">
          <label>Instructor Remarks</label>
          <textarea id="comment-${subjectKey}" placeholder="Add a comment..."></textarea>
        </div>
      </div>
    `;

    subjectContainer.appendChild(subjectCardContainer);

    const results = student.results || {};
    if (results[subjectKey]) {
      const data = results[subjectKey];
      document.getElementById(`note-${subjectKey}`).value = data.note ?? "";
      document.getElementById(`test-${subjectKey}`).value = data.test ?? "";
      document.getElementById(`exam-${subjectKey}`).value = data.exam ?? "";
      document.getElementById(`comment-${subjectKey}`).value =
        data.comment ?? "";
      calculateScore(subjectKey);
    }

    ["note", "test", "exam"].forEach((type) => {
      document.getElementById(`${type}-${subjectKey}`).addEventListener("input", () => {
        calculateScore(subjectKey);
        calculateOverallResults(student.subjects);
      });
    });
  });

  calculateOverallResults(student.subjects);

  // ================= Admin check =================
  onAuthStateChanged(auth, (user) => {
    const userEmail = user.email.trim().toLowerCase()
    if (user && ADMIN_EMAILS.includes(userEmail)) {
      // Admin View
      saveButton.style.display = "block";
      finalizeButton.style.display = "block";
      saveButton.addEventListener("click", () =>
        saveAllResults(studentId, student.subjects),
      );

      finalizeButton.addEventListener("click", async () => {
        finalizeButton.textContent = "Finalizing...";
        finalizeButton.disabled = true;

        try {
          const studentsSnap = await getDocs(collection(db, "students"));
          const batchUpdates = [];
          studentsSnap.forEach((docSnap) => {
            const studentRef = doc(db, "students", docSnap.id);
            batchUpdates.push(updateDoc(studentRef, { scoresFinalized: true }));
          });
          await Promise.all(batchUpdates);
          showToast("All scores finalized!", "success");
        } catch (error) {
          console.error(error);
          showToast("Failed to Finalize, Try Again", "error");
        } finally {
          finalizeButton.textContent = "Finalize All Scores";
          finalizeButton.disabled = false;
        }
      });
    } else {
      // Student View

      saveButton.style.display = "none";
      finalizeButton.style.display = "none";

      const allInput = document.querySelectorAll("input, textarea");
      allInput.forEach(el => el.setAttribute("disabled", "true"));

      if (!student.scoresFinalized) {
        const infoMsg = document.createElement("p");
        infoMsg.textContent = "Scores are not ready yet. Please check back later";
        infoMsg.style.color = "gray";
        infoMsg.style.fontStyle = "italic";
        infoMsg.style.marginBottom = "1rem";
        subjectContainer.prepend(infoMsg);
      } else {
        const infoMsg = document.createElement("p");
        infoMsg.textContent = "You can view your scores below but cannot edit or save them.";
        infoMsg.style.color = "gray";
        infoMsg.style.fontStyle = "italic";
        infoMsg.style.marginBottom = "1rem";
        subjectContainer.prepend(infoMsg);
      }
    }
  });

  const viewReportCard = document.getElementById("view-report-card");
  viewReportCard.addEventListener("click", () => {
    window.location.href = `report-card.html?id=${studentId}`;
  })
});
