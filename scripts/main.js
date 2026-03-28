document.addEventListener("DOMContentLoaded", () => {
  const subjectContainer = document.getElementById("subject-container");
  // Script To Dynamically add all offered Subjects
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

  // Create Select Element
  const selectElement = document.createElement("select");
  selectElement.id = "offered-subject";
  selectElement.multiple = true;
  selectElement.size = 1;

  const error = document.createElement("p");
  error.classList.add("error-message");

  listOfSubjects.forEach((subject) => {
    const options = document.createElement("option");
    options.value = subject.toLowerCase();
    options.textContent = subject;

    selectElement.appendChild(options);
  });
  subjectContainer.appendChild(selectElement);
  subjectContainer.appendChild(error);

  // Form Inputs
  const form = document.getElementById("student-form");
  const firstName = document.getElementById("first-name");
  const lastName = document.getElementById("last-name");
  const middleName = document.getElementById("middle-name");
  const studentDepartment = document.getElementById("departments");
  const email = document.getElementById("email");
  const phoneNumber = document.getElementById("phone-number");
  const offeredSubject = document.getElementById("offered-subject");
  const address = document.getElementById("address");

  // Track Touch Fields
  const touched = {};

  // ==========================================================================================
  // Validation Functions
  // ==========================================================================================

  function validateNotEmpty(input, message) {
    if (input.value.trim() === "") {
      setErrorFor(input, message);
      return false;
    } else {
      setSuccessFor(input);
      return true;
    }
  }

  function validateEmail(input) {
    const value = input.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setErrorFor(input, "Enter a valid email!");
      return false;
    } else {
      setSuccessFor(input);
      return true;
    }
  }

  function validatePhone(input) {
    const value = input.value.trim();
    if (!/^\d{11}$/.test(value)) {
      setErrorFor(input, "Enter a valid 11-digit number");
      return false;
    } else {
      setSuccessFor(input);
      return true;
    }
  }

  function validateSubjects(subject) {
    const selected = Array.from(subject.selectedOptions);
    if (selected.length < 9 || selected.length > 10) {
      setErrorFor(subject, "Select between 9 and 10 subjects");
      return false;
    } else {
      setSuccessFor(subject);
      return true;
    }
  }

  // ==========================================================================================
  // Event Helper
  // ==========================================================================================
  function addLiveValidation(input, validateFn, message, key) {
    input.addEventListener("blur", () => {
      touched[key] = true;
      validateFn(input, message);
    });
    input.addEventListener("input", () => {
      if (!touched[key]) return;

      validateFn(input, message);
    });
  }

  // ==========================================================================================
  // Attach Events
  // ==========================================================================================
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

  // Email
  email.addEventListener("blur", () => {
    touched.email = true;
    validateEmail(email);
  });
  email.addEventListener("input", () => {
    if (!touched.email) return;
    validateEmail(email);
  });

  // Phone
  phoneNumber.addEventListener("blur", () => {
    touched.phone = true;
    validatePhone(phoneNumber);
  });

  phoneNumber.addEventListener("input", () => {
    if (!touched.phone) return;
    validatePhone(phoneNumber);
  });

  // Subjects (selects uses change)
  offeredSubject.addEventListener("change", () => {
    touched.subjects = true;
    validateSubjects(offeredSubject);
  });

  // ==========================================================================================
  // Submit
  // ==========================================================================================

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    submitForm();
  });

  function submitForm() {
    const isFirstNameValid = validateNotEmpty(
      firstName,
      "First Name cannot be empty",
    );
    const isLastNameValid = validateNotEmpty(
      lastName,
      "Last Name cannot be empty",
    );
    const isDepartmentValid = validateNotEmpty(
      studentDepartment,
      "Department cannot be empty",
    );
    const isPhoneValid = validatePhone(phoneNumber);
    const isAddressValid = validateNotEmpty(address, "Address cannot be empty");
    const isEmailValid = validateEmail(email);
    const isSubjectValid = validateSubjects(offeredSubject);

    const valid =
      isFirstNameValid &&
      isLastNameValid &&
      isDepartmentValid &&
      isPhoneValid &&
      isAddressValid &&
      isEmailValid &&
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
    const studentExist = existingStudents.some((eachStudent) => {
      return (
        eachStudent.email === student.email ||
        eachStudent.phoneNumber === student.phoneNumber
      );
    });

    if (studentExist) {
      alert("Student already exist");
      form.reset();
    } else {
      existingStudents.push(student);
      localStorage.setItem("students", JSON.stringify(existingStudents));
      alert("Student Registered");
      form.reset();
    }
  }

  // ==========================================================================================
  // UI Feedback Functions
  // ==========================================================================================

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

    if (errorMessage) {
      errorMessage.textContent = "";
    }
  
    formControl.classList.remove("error");
    formControl.classList.add("success");
  }
});