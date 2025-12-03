document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 2px 30px rgba(19, 36, 64, 0.2)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(19, 36, 64, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
    

    
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const formData = {
                nombre: contactForm.querySelector('input[type="text"]').value,
                email: contactForm.querySelector('input[type="email"]').value,
                mensaje: contactForm.querySelector('textarea').value
            };
            
            // Here you would normally send the data to your backend
            console.log('Form data:', formData);
            
            // Show success message
            alert('¡Gracias por contactarnos! Te responderemos pronto.');
            
            // Reset form
            contactForm.reset();
        });
    }
    

    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .role-card, .benefit-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    
    function animateCounter(element, target, duration = 2000) {
        let current = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }
    
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.textContent);
                if (!isNaN(target)) {
                    animateCounter(entry.target, target);
                    statsObserver.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });

    
    if (typeof authAPI !== 'undefined') {
        const token = authAPI.getToken();
        const userData = authAPI.getUserData();
        
        if (token && userData) {
            // Update nav buttons if user is logged in
            const loginBtn = document.querySelector('.btn-login');
            const registerBtn = document.querySelector('.btn-register');
            
            if (loginBtn && registerBtn) {
                loginBtn.textContent = 'Dashboard';
                loginBtn.href = '#';
                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    authAPI.redirectToDashboard(userData.rol);
                });
                
                registerBtn.textContent = 'Cerrar Sesión';
                registerBtn.href = '#';
                registerBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                        authAPI.logout();
                    }
                });
            }
        }
    }

    
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    });
});


// Format phone number as user types
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    input.value = value;
}

// Add phone formatting to phone inputs
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => formatPhone(input));
});

// Prevent form submission on Enter (except in textareas)
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
});



window.lcboxing = {
    formatPhone
};