import { auth, db } from "./firebase.js"
import { doc, getDoc} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const navLinks = document.querySelectorAll(".nav-link");
  const profileBtn = document.getElementById("profile-btn");

  /**
   * Toggle Sidebar Functionality
   */
  const toggleSidebar = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");

    // Change menu icon based on state
    const icon = menuToggle.querySelector("i");
    if (sidebar.classList.contains("open")) {
      icon.setAttribute("data-lucide", "x");
    } else {
      icon.setAttribute("data-lucide", "menu");
    }
    lucide.createIcons(); // Refresh icon
  };

  menuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);

  /**
   * Active Link State Handler
   */
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));

      // Add active class to clicked link
      link.classList.add("active");

      // Close sidebar on mobile after clicking a link
      if (window.innerWidth < 1024) {
        toggleSidebar();
      }

      // Update Page Title in Navbar
      const pageTitle = document.querySelector(".page-title");
      pageTitle.textContent = link.textContent.trim();
    });
  });

  /**
   * Profile Button Animation
   */
  // profileBtn.addEventListener("click", () => {
  //   profileBtn.style.transform = "scale(0.95)";
  //   setTimeout(() => {
  //     profileBtn.style.transform = "scale(1)";
  //     alert("Profile settings would open here.");
  //   }, 150);
  // });

  /**
   * Responsive Logic: Handle window resizing
   */
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");

      // Reset menu icon
      const icon = menuToggle.querySelector("i");
      icon.setAttribute("data-lucide", "menu");
      lucide.createIcons();
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in User:", user.uid);
      loadStudentData(user.uid);
    } else {
      window.location.href = "login.html";
    }
  });

  async function loadStudentData(uid) {
    const docRef = doc(db, "students", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(data);
      displayData(data);
    } else {
      console.log("Student Does not Exist");
    }
  }

  const welcomeMsg = document.getElementById("welcome-msg");
  const profilePic = document.getElementById("avatar");
  const totalSubValue = document.getElementById("total-subject-value");
  const latestResult = document.getElementById("latest-result");
  const attendanceScore = document.getElementById("attendance-score");
  const averageScore = document.getElementById("average-score");

  function displayData(data) {
    welcomeMsg.textContent = `Welcome back ${data.firstName}`;
    profilePic.setAttribute("src", `${data.imgSrc}`)
    profilePic.setAttribute("alt", `${data.firstName} Image`);
    profilePic.setAttribute("lazy", "loading");

    totalSubValue.textContent = `${data.subjects.length}`;

    if (data.scoresFinalized === true) {
      latestResult.textContent = `${data.overallResults.grade}`;
      averageScore.textContent = `${data.overallResults.average.toFixed(1)}%`
      console.log("Bread");
    } else {
      latestResult.textContent = 'Pending...';
      attendanceScore.textContent = "Pending...";
      averageScore.textContent = "Pending..."

      latestResult.style.fontSize = "0.9rem";
      attendanceScore.style.fontSize = "0.9rem";
      averageScore.style.fontSize = "0.9rem";
    }

  }
});