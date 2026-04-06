import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
  const firstName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const middleName = document.getElementById("middle-name");
  const studentDepartment = document.getElementById("departments");
  const email = document.getElementById("email");
  const phoneNumber = document.getElementById("phone-number");
  const offeredSubject = document.getElementById("offered-subject");
  const address = document.getElementById("address");
  const profilePic = document.getElementById("profile-pic");
  const genderRadios = document.getElementsByName("gender");

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

  function validateEmail(input) {
    const value = input.value.trim();
    if (value === "") {
      clearError(input);
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setErrorFor(input, "Enter a valid email");
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
    const selected = Array.from(genderRadios).some(radio => radio.checked);
    const errorMessage = genderRadios[0].closest(".form-group").querySelector(".error-message");

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
    if (selected.length < 9 || selected.length > 10) {
      setErrorFor(subject, "Select between 9 and 10 subjects");
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

  // Email & Phone
  email.addEventListener("blur", () => {
    touched.email = true;
    if (email.value.trim() !== "") validateEmail(email);
  });
  email.addEventListener("input", () => {
    if (touched.email) {
      if (email.value.trim() === "") {
        clearError(email);
      } else validateEmail(email);
    }
  });

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
  })

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
    const isEmailValid = email.value.trim() || validateEmail(email);
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
      isSubjectValid
      

    if (!valid) return;
    if (!imgSrcValue) {
      setErrorFor(profilePic, "Image is required");
      return;
    }
    const student = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      middleName: middleName.value.trim(),
      studentDepartment: studentDepartment.value.trim(),
      email: email.value.trim(),
      phoneNumber: phoneNumber.value.trim(),
      subjects: Array.from(offeredSubject.selectedOptions).map(
        (opt) => opt.value,
      ),
      address: address.value.trim(),
      imgSrc: imgSrcValue,
      gender: Array.from(genderRadios).find(radio => radio.checked)?.value,
    };

    const querySnapShot = await getDocs(collection(db, "students"));
    // const existingStudents = JSON.parse(localStorage.getItem("students")) || [];
    const studentExist = querySnapShot.docs.some(doc => {
      const s = doc.data();
      return s.email === student.email || s.phoneNumber === student.phoneNumber
    });

    if (studentExist) {
      showToast("Student already exists", "error");
      form.reset();
      imgSrcValue = null;
      Object.keys(touched).forEach((key) => (touched[key] = false));
      document
        .querySelectorAll(".form-group")
        .forEach((fc) => fc.classList.remove("error", "success"));
    } else {
      console.log(student)
      await addDoc(collection(db, "students"), student);
      showToast("Student registered successfully", "success");
      form.reset();
      imgSrcValue = null;
      Object.keys(touched).forEach((key) => (touched[key] = false));

      // clear all classes after reset
      document
        .querySelectorAll(".form-group")
        .forEach((fc) => fc.classList.remove("error", "success"));
    }
  });
});
