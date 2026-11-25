
// CodeNest - Frontend JavaScript

document.addEventListener("DOMContentLoaded", function () {

    console.log("CodeNest Online Compiler is ready!");

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a, .start-btn');

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {

            const targetId = link.getAttribute('href');

            if (targetId && targetId.startsWith("#") && targetId.length > 1) {
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    event.preventDefault();

                    targetSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        });
    });

});
