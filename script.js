document.addEventListener('DOMContentLoaded', () => {

    // --- Edit Mode & Persistence Logic ---
    const editToggle = document.getElementById('edit-mode-toggle');
    const editableElements = document.querySelectorAll('.editable');

    // 1. Load saved content from localStorage
    editableElements.forEach(el => {
        const key = el.getAttribute('data-key');
        const savedContent = localStorage.getItem('serenity_content_' + key);
        if (savedContent) {
            el.innerText = savedContent;
        }
    });

    // 2. Toggle Edit Mode
    editToggle.addEventListener('change', (e) => {
        const isEditable = e.target.checked;
        document.body.classList.toggle('is-editing', isEditable);

        editableElements.forEach(el => {
            el.contentEditable = isEditable;

            // Add input listener only when editable to save changes
            if (isEditable) {
                el.addEventListener('input', handleInput);
            } else {
                el.removeEventListener('input', handleInput);
            }
        });
    });

    // 3. Save to LocalStorage on input
    function handleInput(e) {
        const el = e.target;
        const key = el.getAttribute('data-key');
        if (key) {
            localStorage.setItem('serenity_content_' + key, el.innerText);
        }
    }


    // --- UI Interactions ---

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Observer for fade-in animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply initial styles for animation to sections (can also be done in CSS)
    const animatedSections = document.querySelectorAll('.feature-card, .testimonial-card, .section-header');
    animatedSections.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

});
