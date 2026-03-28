document.addEventListener("DOMContentLoaded", () => {
  const subjectContainer = document.getElementById("subject-container");

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
      clearError(input); // empty → no error
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

  // ===============================
  // Submit
  // ===============================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const isFirstNameValid = validateNotEmpty(firstName);
    const isLastNameValid = validateNotEmpty(lastName);
    const isDepartmentValid = validateNotEmpty(studentDepartment);
    const isPhoneValid = validatePhone(phoneNumber);
    const isEmailValid = validateEmail(email);
    const isAddressValid = validateNotEmpty(address);
    const isSubjectValid = validateSubjects(offeredSubject);

    const valid =
      isFirstNameValid &&
      isLastNameValid &&
      isDepartmentValid &&
      isPhoneValid &&
      isEmailValid &&
      isAddressValid &&
      isSubjectValid;

    if (!valid) return;

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
    };

    const existingStudents = JSON.parse(localStorage.getItem("students")) || [];
    const studentExist = existingStudents.some(
      (s) => s.email === student.email || s.phoneNumber === student.phoneNumber,
    );

    if (studentExist) {
      alert("Student already exists");
      form.reset();
    } else {
      existingStudents.push(student);
      localStorage.setItem("students", JSON.stringify(existingStudents));
      alert("Student Registered");
      form.reset();

      // clear all classes after reset
      document
        .querySelectorAll(".form-group")
        .forEach((fc) => fc.classList.remove("error", "success"));
    }
  });
});