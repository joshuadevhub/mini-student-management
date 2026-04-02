import { doc, getDoc, updateDoc} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Reuseable Functions
  function capitalizeWord(str) {
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

    if(!isValid) return

    const finalScore = note + test + exam
    const percentGrade = (finalScore / 100) * 100;

    let grade = "-";

    // State for the percentage
    if (percentGrade >= 70) {
      grade = "A";
    } else if(percentGrade >= 60){
      grade = "B";
    }else if (percentGrade >= 50) {
      grade = "C";
    }else if (percentGrade >= 40) {
      grade = "D";
    } else {
      grade = "F";
    }

    // State for the grade
    if (grade === "A") gradeElement.style.color = "#10b981";
    else if (grade === "F") gradeElement.style.color = "#ef4444";
    else gradeElement.style.color = "orange";

    // State for the badge status
    if (grade === "A" || grade === "B" || grade === "C") {
      badgeStatus.textContent = "Passed";
      badgeStatus.style.color = "#10b981";
    } else {
      badgeStatus.textContent = "FAILED";
      badgeStatus.style.color = "#ef4444";
    }

    document.getElementById(`total-${subjectKey}`).textContent = finalScore;
    document.getElementById(`percent-${subjectKey}`).textContent = percentGrade.toFixed(1) + "%";
    gradeElement.textContent = grade;
  }


  async function saveAllResults(studentId, subjects) {
    const saveBtn = document.getElementById("save-scores-btn");

    // 🔄 Loading state
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    try {
      const studentRef = doc(db, "students", studentId);
      const updates = {};

      subjects.forEach((subject) => {
        const subjectKey = subject.toLowerCase().replace(/\s+/g, "-");

        const noteInput = document.getElementById(`note-${subjectKey}`);
        const testInput = document.getElementById(`test-${subjectKey}`);
        const examInput = document.getElementById(`exam-${subjectKey}`);

        if (!noteInput.value && !testInput.value && !examInput.value) return;

        const note = parseFloat(noteInput.value) || 0;
        const test = parseFloat(testInput.value) || 0;
        const exam = parseFloat(examInput.value) || 0;

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

      await updateDoc(studentRef, updates);

      // ✅ Success feedback
      showToast("Saved successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save. Try again", "error");
    } finally {
      // 🔄 Reset button
      saveBtn.textContent = "Save Results";
      saveBtn.disabled = false;
    }
  }


  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }


  function showErrorFor(input) {
    const formControl = input.parentElement;
    formControl.classList.add("error");
    formControl.classList.remove("success");
  }

  function showSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.classList.remove("success");
    formControl.classList.remove("error");
  }

  // Variables
  const studentProfilePic = document.querySelector("#student-avatar");
  const studentName = document.querySelector("#student-name");
  const studentDepartment = document.querySelector("#student-department");
  const subjectContainer = document.querySelector("#subjects-container");

  const param = new URLSearchParams(window.location.search);
  const studentId = param.get("id");

  // console.log("Student ID:", studentId);

  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    const student = studentSnap.data();
    console.log(student);

    // Populate Student Details
    studentProfilePic.setAttribute("src", `${student.imgSrc}`);
    studentProfilePic.setAttribute("alt", `${student.firstName} Image`);

    studentName.textContent = capitalizeWord(student.firstName + " " + student.lastName);

    const capitalizeDepartment = capitalizeWord(student.studentDepartment);
    studentDepartment.textContent = `Department of ${capitalizeDepartment}`;

    // Populate the subject data as card
    student.subjects.forEach((subject) => {
      const subjectCardContainer = document.createElement("div");
      subjectCardContainer.classList.add("subject-card");

      // Generate unique ID based on subject name
      const subjectKey = subject.toLowerCase().replace(/\s+/g, "-");

      subjectCardContainer.innerHTML = `
      <div class="card-header">
        <span class="subject-name">${capitalizeWord(subject)}</span>
        <span class="badge" id="passfail-${subjectKey}">PENDING</span>
      </div>

      <div class="card-content">
        <div class="card-grid-desktop">
          <!-- Left: Inputs -->
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

          <!-- Right: Calculated (Layout Shift Proof) -->
          <div class="results-well">
            <div class="res-box">
              <span class="res-label">Final</span>
              <span class="res-data" id="total-${subjectKey}">0</span>
            </div>
            <div class="res-box">
              <span class="res-label">Percent</span>
              <span class="res-data" id="percent-${subjectKey}">0%</span>
            </div>
            <div class="res-box">
              <span class="res-label">Grade</span>
              <span class="res-data" id="grade-${subjectKey}" style="color: var(--accent)">-</span>
            </div>
          </div>
        </div>

        <!-- Full Width: Comments -->
        <div class="comment-box">
          <label>Instructor Remarks</label>
          <textarea id="comment-${subjectKey}" placeholder="Add a comment..."></textarea>
        </div>
      </div>
      `;

      subjectContainer.appendChild(subjectCardContainer);
      // console.log(document.querySelector(`#total-${subjectKey}`));

      const results = student.results || {};

      if (results[subjectKey]) {
        const data = results[subjectKey];

        document.getElementById(`note-${subjectKey}`).value = data.note ?? "";
        document.getElementById(`test-${subjectKey}`).value = data.test ?? "";
        document.getElementById(`exam-${subjectKey}`).value = data.exam ?? "";
        document.getElementById(`comment-${subjectKey}`).value =
          data.comment ?? "";

        // Recalculate UI (total, grade, percent)
        calculateScore(subjectKey);
      }

      // Attach Event Listeners
      ["note", "test", "exam"].forEach((type) => {
        document.getElementById(`${type}-${subjectKey}`).addEventListener("input", () => {
            calculateScore(subjectKey);
          });
      });
    });

    const saveButton = document.getElementById("save-scores-btn");
    saveButton.addEventListener("click", () => {
      saveAllResults(studentId, student.subjects);
    });

  } else {
    console.log("Student not Found")
  }

})