import { auth, db } from "./firebase.js";
import { doc, getDoc, setDoc} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const subjectContainer = document.getElementById("subject-container");
  // console.log("entered")

  // ===============================
  // Dynamically add offered subjects
  // ===============================
  const listOfSubjects = [
    "Mathematics",
    "English",
    "Chemistry",
    "Civic",
    "Economics",
    "Agric",
    "Biology",
    "Physics",
    "Government",
    "Accounting",
    "Book-Keeping",
    "Commerce",
    "C.R.S",
    "Literature",
    "Marketing",
    "Computer Science",
  ];

  const selectElement = document.createElement("select");
  selectElement.id = "offered-subject";
  selectElement.multiple = true;
  selectElement.size = 1; // better UX than 1

  const error = document.createElement("p");
  error.classList.add("error-message");

  listOfSubjects.forEach((subject) => {
    const option = document.createElement("option");
    option.style.backgroundColor = "#0f172a80";
    option.style.color = "#0f172a";
    option.value = subject.toLowerCase();
    option.textContent = subject;
    selectElement.appendChild(option);
  });

  subjectContainer.appendChild(selectElement);
  subjectContainer.appendChild(error);

  // ===============================
  // Form Inputs
  // ===============================
  const form = document.getElementById("student-form");
  form.style.opacity = "0.5";
  form.style.pointerEvents = "none";

  const firstName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const middleName = document.getElementById("middle-name");
  const studentDepartment = document.getElementById("departments");
  const phoneNumber = document.getElementById("phone-number");
  const offeredSubject = document.getElementById("offered-subject");
  const address = document.getElementById("address");
  const profilePic = document.getElementById("profile-pic");
  const genderRadios = document.getElementsByName("gender");
  let isLoaded = false;

  const touched = {}; // track fields touched for live validation

  // ===============================
  // Helper Functions
  // ===============================
  function clearError(input) {
    const formControl = input.parentElement;
    const errorMessage = formControl.querySelector(".error-message");
    if (errorMessage) errorMessage.textContent = "";
    formControl.classList.remove("error");
    formControl.classList.remove("success");
  }

  function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const errorMessage = formControl.querySelector(".error-message");
    if (!errorMessage) return;
    errorMessage.textContent = message;
    formControl.classList.add("error");
    formControl.classList.remove("success");
  }

  function setSuccessFor(input) {
    const formControl = input.parentElement;
    const errorMessage = formControl.querySelector(".error-message");
    if (errorMessage) errorMessage.textContent = "";
    formControl.classList.remove("error");
    formControl.classList.add("success");
  }

  // ===============================
  // Validation Functions
  // ===============================
  function validateNotEmpty(input, message) {
    const value = input.value.trim();
    if (value === "") {
      setErrorFor(input, message); // empty → no error
      return false;
    }
    setSuccessFor(input);
    return true;
  }


  function validatePhone(input) {
    const value = input.value.trim();
    if (value === "") {
      clearError(input);
      return false;
    }
    if (!/^\d{11}$/.test(value)) {
      setErrorFor(input, "Enter a valid 11-digit number");
      return false;
    }
    setSuccessFor(input);
    return true;
  }

  function validateGender() {
    const selected = Array.from(genderRadios).some((radio) => radio.checked);
    const errorMessage = genderRadios[0]
      .closest(".form-group")
      .querySelector(".error-message");

    if (!selected) {
      if (errorMessage) errorMessage.textContent = "Please select a gender";
      return false;
    } else {
      if (errorMessage) errorMessage.textContent = "";
      return true;
    }
  }

  function validateSubjects(subject) {
    const selected = Array.from(subject.selectedOptions);
    if (selected.length === 0) {
      clearError(subject); // empty → no error
      return false;
    }
    if (selected.length < 8 || selected.length > 10) {
      setErrorFor(subject, "Select between 8 and 10 subjects");
      return false;
    }
    setSuccessFor(subject);
    return true;
  }

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    const icon = type === "success" ? "✔️" : "⚠️";
    toast.innerHTML = `${icon} ${message}`;

    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // ===============================
  // Live Validation Event Helper
  // ===============================
  function addLiveValidation(input, validateFn, message, key) {
    input.addEventListener("blur", () => {
      touched[key] = true;
      if (input.value.trim() !== "") validateFn(input, message);
    });

    input.addEventListener("input", () => {
      if (!touched[key]) return;
      if (input.value.trim() === "") {
        clearError(input);
      } else {
        validateFn(input, message);
      }
    });
  }

  // ===============================
  // Attach Live Validation
  // ===============================
  addLiveValidation(
    firstName,
    validateNotEmpty,
    "First Name cannot be empty",
    "firstName",
  );
  addLiveValidation(
    lastName,
    validateNotEmpty,
    "Last Name cannot be empty",
    "lastName",
  );
  addLiveValidation(
    studentDepartment,
    validateNotEmpty,
    "Department cannot be empty",
    "department",
  );
  addLiveValidation(
    address,
    validateNotEmpty,
    "Address cannot be empty",
    "address",
  );

  phoneNumber.addEventListener("blur", () => {
    touched.phone = true;
    if (phoneNumber.value.trim() !== "") validatePhone(phoneNumber);
  });
  phoneNumber.addEventListener("input", () => {
    if (touched.phone) {
      if (phoneNumber.value.trim() === "") {
        clearError(phoneNumber);
      } else validatePhone(phoneNumber);
    }
  });

  // Subjects multi-select
  offeredSubject.addEventListener("change", () => {
    touched.subjects = true;
    if (offeredSubject.selectedOptions.length === 0) {
      clearError(offeredSubject);
    } else {
      validateSubjects(offeredSubject);
    }
  });

  genderRadios.forEach((radio) => {
    radio.addEventListener("change", () => validateGender());
  });

  // Get the value of image uploaded
  let imgSrcValue;
  profilePic.addEventListener("change", (e) => {
    if (e.target.files.length === 0) {
      setErrorFor(profilePic, "No image selected");
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        imgSrcValue = event.target.result;
        setSuccessFor(profilePic);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not logged in, redirect to login
      window.location.href = "sign-up.html";
      return;
    }

    const studentId = user.uid;
    const studentRef = doc(db, "students", studentId);

    try {
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        console.log("Student Docs not found!");
        showToast("Profile not initialized. Please contact support.", "error");
        return;
      }

      const student = studentSnap.data();
      isLoaded = true;
      form.style.opacity = "1";
      form.style.pointerEvents = "auto";

      // Fill form fields with existing data (if any)
      firstName.value = student.firstName || "";
      lastName.value = student.lastName || "";
      middleName.value = student.middleName || "";
      studentDepartment.value = student.studentDepartment || "";
      phoneNumber.value = student.phoneNumber || "";
      address.value = student.address || "";
      genderRadios.forEach((radio) => {
        if (radio.value === student.gender) radio.checked = true;
      });
      if (student.subjects) {
        Array.from(offeredSubject.options).forEach((opt) => {
          if (student.subjects.includes(opt.value)) opt.selected = true;
        });
      }
      if (student.imgSrc) {
        // optionally show profile pic preview
        imgSrcValue = student.imgSrc;
      }
    } catch (err) {
      console.log("Error Fetching Student: ", err);
      showToast("Failed to Fetch Student", "error");
    }

  });




  // ===============================
  // Submit
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isFirstNameValid = validateNotEmpty(
      firstName,
      "First Name is required",
    );
    const isLastNameValid = validateNotEmpty(lastName, "Last Name is required");
    const isDepartmentValid = validateNotEmpty(
      studentDepartment,
      "Department is required",
    );
    const isPhoneValid = validatePhone(phoneNumber);
    const isAddressValid = validateNotEmpty(address, "Address is required");
    const isSubjectValid = validateSubjects(offeredSubject);
    const isGenderValid = validateGender();

    const valid =
      isFirstNameValid &&
      isLastNameValid &&
      isDepartmentValid &&
      isGenderValid &&
      isPhoneValid &&
      isAddressValid &&
      isSubjectValid;

    if (!valid) return;

    if (!imgSrcValue) {
      setErrorFor(profilePic, "Image is required");
      return;
    }

    const updatedStudent = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      middleName: middleName.value.trim(),
      studentDepartment: studentDepartment.value.trim(),
      phoneNumber: phoneNumber.value.trim(),
      subjects: Array.from(offeredSubject.selectedOptions).map(
        (opt) => opt.value,
      ),
      address: address.value.trim(),
      imgSrc: imgSrcValue,
      gender: Array.from(genderRadios).find((radio) => radio.checked)?.value,
      scoreFinalized: false,
      updatedAt: new Date(),
    };

    // Disable Submit button when saving
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    try {
      await setDoc(doc(db, "students", auth.currentUser.uid), updatedStudent, {
        merge: true,
      });
      showToast("Profile Updated Successfully", "success");

      const uid = auth.currentUser.uid;
      setTimeout(() => {
        window.location.href = `student-dashboard.html`;
      }, 2000);
    } catch (error) {
      console.log(error);
      showToast("Failed to update profile", "error");
    } finally {
      // Remove the state from button
      submitBtn.disabled = false;
      submitBtn.textContent = "Save profile";
    }
  });
});