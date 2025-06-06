// ===== MAIN JAVASCRIPT FILE =====

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all components
  initMobileMenu();
  initSearch();
  initNewsletter();
  initScrollEffects();
  initCardAnimations();
  initLoadMore();
  initThemeToggle();
  initStickyHeader();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileMenuToggle && mainNav) {
    // Toggle menu function
    function toggleMenu() {
      const isActive = mainNav.classList.contains('active');
      mobileMenuToggle.classList.toggle('active');

      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Open menu function
    function openMenu() {
      mainNav.classList.add('active');
      mobileMenuToggle.querySelector('i').className = 'fas fa-times';
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close menu function
    function closeMenu() {
      mainNav.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    // Menu toggle click handler
    mobileMenuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (
        mainNav.classList.contains('active') &&
        !mobileMenuToggle.contains(e.target) &&
        !mainNav.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Close menu when clicking on nav links
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close menu on window resize (if going to desktop view)
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
        closeMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('active')) {
        closeMenu();
      }
    });
  }
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');
  const searchBox = document.querySelector('.search-box');

  if (searchInput && searchBtn && searchBox) {
    // Search button click
    searchBtn.addEventListener('click', function (e) {
      e.preventDefault();
      performSearch(searchInput.value);
    });

    // Enter key press
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(this.value);
      }
    });

    // Focus effects
    searchInput.addEventListener('focus', function () {
      searchBox.classList.add('expanded');
    });

    searchInput.addEventListener('blur', function () {
      setTimeout(() => {
        searchBox.classList.remove('expanded');
        hideSearchSuggestions();
      }, 200);
    });

    // Live search suggestions
    let searchTimeout;
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (this.value.length > 2) {
          showSearchSuggestions(this.value);
        } else {
          hideSearchSuggestions();
        }
      }, 300);
    });
  }
}

function performSearch(query) {
  if (query.trim() === '') return;

  // Clean query from emojis
  const cleanQuery = query.replace(/[🏢🛡️⚡🔒☁️🐳🤖📊]\s/, '').trim();

  // Show loading state
  showNotification('🔍 جاري البحث عن: ' + cleanQuery, 'info');

  // Simulate search API call
  setTimeout(() => {
    hideNotification();

    // In a real application, this would redirect to search results
    console.log('البحث عن:', cleanQuery);

    // Show success message
    showNotification('✅ تم العثور على نتائج البحث', 'success');

    // Hide success message after 2 seconds
    setTimeout(() => {
      hideNotification();
    }, 2000);
  }, 1000);
}

function showSearchSuggestions(query) {
  // Sample suggestions - replace with actual search API
  const suggestions = [
    '🏢 أفضل شركات الاستضافة 2025',
    '🛡️ دليل حماية المواقع الشامل',
    '⚡ تسريع موقع WordPress',
    '🔒 شهادات SSL المجانية',
    '☁️ مراجعة Cloudflare',
    '🐳 دليل Docker للمطورين',
    '🤖 تطوير AI مع Python',
    '📊 مقارنة أداء الخوادم',
  ]
    .filter(
      (item) =>
        item.toLowerCase().includes(query.toLowerCase()) || query.length > 3
    )
    .slice(0, 5);

  if (suggestions.length > 0) {
    createSuggestionsDropdown(suggestions, query);
  }
}

function createSuggestionsDropdown(suggestions, query) {
  const searchBox = document.querySelector('.search-box');
  let dropdown = searchBox.querySelector('.search-suggestions');

  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions';
    searchBox.appendChild(dropdown);
  }

  dropdown.innerHTML = suggestions
    .map(
      (suggestion) =>
        `<div class="suggestion-item" data-suggestion="${suggestion}">
      ${highlightQuery(suggestion, query)}
    </div>`
    )
    .join('');

  dropdown.classList.add('active');

  // Add click handlers for suggestions
  dropdown.querySelectorAll('.suggestion-item').forEach((item) => {
    item.addEventListener('click', function () {
      const suggestion = this.dataset.suggestion;
      document.querySelector('.search-input').value = suggestion.replace(
        /[🏢🛡️⚡🔒☁️🐳🤖📊]\s/,
        ''
      );
      hideSearchSuggestions();
      performSearch(suggestion);
    });
  });
}

function highlightQuery(text, query) {
  if (query.length < 2) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

function hideSearchSuggestions() {
  const dropdown = document.querySelector('.search-suggestions');
  if (dropdown) {
    dropdown.classList.remove('active');
  }
  // Hide suggestions dropdown
  console.log('إخفاء اقتراحات البحث');
}

// ===== NEWSLETTER SUBSCRIPTION =====
function initNewsletter() {
  const newsletterForms = document.querySelectorAll('.newsletter-form');

  newsletterForms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (validateEmail(email)) {
        subscribeNewsletter(email, emailInput);
      } else {
        showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
      }
    });
  });

  // Newsletter button in header
  const newsletterBtn = document.querySelector('.newsletter-btn');
  if (newsletterBtn) {
    newsletterBtn.addEventListener('click', function () {
      showNewsletterModal();
    });
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function subscribeNewsletter(email, inputElement) {
  const submitBtn = inputElement.parentElement.querySelector(
    'button[type="submit"]'
  );
  const originalText = submitBtn.textContent;

  // Show loading state
  submitBtn.textContent = 'جاري الاشتراك...';
  submitBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    // Reset form
    inputElement.value = '';
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Show success message
    showNotification('تم اشتراكك بنجاح! شكراً لك.', 'success');
  }, 2000);
}

function showNewsletterModal() {
  // Create and show newsletter modal
  const modal = document.createElement('div');
  modal.className = 'newsletter-modal';
  modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h3><i class="fas fa-envelope"></i> اشترك في النشرة الأسبوعية</h3>
                <p>احصل على أحدث المقالات التقنية والمراجعات مباشرة في بريدك</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="بريدك الإلكتروني" required>
                    <button type="submit">اشتراك</button>
                </form>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close modal events
  modal.querySelector('.modal-close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.modal-overlay')) {
      document.body.removeChild(modal);
    }
  });

  // Handle form submission
  modal
    .querySelector('.newsletter-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      const email = this.querySelector('input').value;
      if (validateEmail(email)) {
        subscribeNewsletter(email, this.querySelector('input'));
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 2500);
      }
    });
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  // Header scroll effect
  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide/show header on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Back to top button
  createBackToTopButton();
}

function createBackToTopButton() {
  const backToTop = document.createElement('button');
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'العودة للأعلى');
  document.body.appendChild(backToTop);

  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  // Click event
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// ===== CARD ANIMATIONS =====
function initCardAnimations() {
  // Intersection Observer for card animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards
  document
    .querySelectorAll('.featured-card, .article-card, .sidebar-widget')
    .forEach((card) => {
      observer.observe(card);
    });

  // Add hover effects for better UX
  document.querySelectorAll('.featured-card, .article-card').forEach((card) => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(-4px)';
    });
  });
}

// ===== LOAD MORE FUNCTIONALITY =====
function initLoadMore() {
  // Simulate load more for articles
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.textContent = 'تحميل المزيد من المقالات';
  loadMoreBtn.className = 'load-more-btn';

  const articlesGrid = document.querySelector('.articles-grid');
  if (articlesGrid) {
    articlesGrid.parentNode.insertBefore(loadMoreBtn, articlesGrid.nextSibling);

    loadMoreBtn.addEventListener('click', function () {
      this.textContent = 'جاري التحميل...';
      this.disabled = true;

      // Simulate loading more articles
      setTimeout(() => {
        // Add new articles (simulated)
        for (let i = 0; i < 3; i++) {
          const newArticle = createArticleCard({
            title: `مقال جديد ${Date.now()}`,
            excerpt: 'هذا مقال تجريبي تم تحميله ديناميكياً...',
            category: '💻 الأدوات',
            date: 'اليوم',
            readTime: '10 دقائق',
            author: 'كاتب جديد',
            image: 'assets/images/placeholder.jpg',
          });
          articlesGrid.appendChild(newArticle);
        }

        this.textContent = 'تحميل المزيد من المقالات';
        this.disabled = false;

        showNotification('تم تحميل مقالات جديدة بنجاح', 'success');
      }, 1500);
    });
  }
}

function createArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-card';
  card.innerHTML = `
        <div class="card-image">
            <img src="${article.image}" alt="${article.title}">
            <div class="card-category">${article.category}</div>
        </div>
        <div class="card-content">
            <h3 class="card-title">${article.title}</h3>
            <p class="card-excerpt">${article.excerpt}</p>
            <div class="card-meta">
                <span class="meta-author">${article.author}</span>
                <span class="meta-date">${article.date}</span>
                <span class="meta-read-time">${article.readTime}</span>
            </div>
            <a href="#" class="read-more-btn">اقرأ المزيد</a>
        </div>
    `;
  return card;
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  const currentTheme = localStorage.getItem('theme');

  // Apply saved theme or system preference
  if (
    currentTheme === 'dark' ||
    (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon(true);
  }

  // Theme toggle click handler
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark';

      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(false);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(true);
      }
    });
  }

  // Update theme icon
  function updateThemeIcon(isDark) {
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  }

  // Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
          updateThemeIcon(true);
        } else {
          document.documentElement.removeAttribute('data-theme');
          updateThemeIcon(false);
        }
      }
    });
}

// ===== STICKY HEADER =====
function initStickyHeader() {
  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;

  if (header) {
    window.addEventListener('scroll', function () {
      const currentScrollY = window.scrollY;

      // Add scrolled class when scrolling down
      if (currentScrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Optional: Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastScrollY = currentScrollY;
    });
  }
}

// ===== NOTIFICATIONS SYSTEM =====
function showNotification(message, type = 'info') {
  // Remove existing notification
  hideNotification();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="hideNotification()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
}

function hideNotification() {
  const notification = document.querySelector('.notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// ===== UTILITY FUNCTIONS =====
// Lazy loading for images
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach((img) => {
      img.src = img.dataset.src;
    });
  }
}

// Debounce function for performance
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', initLazyLoading);

// Add CSS for notifications and other dynamic elements
const additionalCSS = `
.back-to-top {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    background: var(--primary-color);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: var(--shadow-medium);
    transition: var(--transition-normal);
    opacity: 0;
    visibility: hidden;
    z-index: 1000;
}

.back-to-top.visible {
    opacity: 1;
    visibility: visible;
}

.back-to-top:hover {
    background: var(--accent-color);
    transform: translateY(-2px);
}

.notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: var(--shadow-heavy);
    padding: 1rem;
    z-index: 10000;
    max-width: 400px;
    transform: translateX(100%);
    animation: slideIn 0.3s ease forwards;
}

.notification-success {
    border-left: 4px solid var(--accent-color);
}

.notification-error {
    border-left: 4px solid #ef4444;
}

.notification-info {
    border-left: 4px solid var(--primary-color);
}

.notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-secondary);
}

.notification-hide {
    animation: slideOut 0.3s ease forwards;
}

@keyframes slideIn {
    to { transform: translateX(0); }
}

@keyframes slideOut {
    to { transform: translateX(100%); }
}

.load-more-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast);
    margin: 2rem auto;
    display: block;
}

.load-more-btn:hover:not(:disabled) {
    background: var(--accent-color);
    transform: translateY(-2px);
}

.load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.header.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
}

.header {
    transition: var(--transition-normal);
}

.animate-in {
    animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.newsletter-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
    position: relative;
    text-align: center;
}

.modal-close {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
}

.modal-content h3 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.modal-content p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
}

.modal-content .newsletter-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal-content input {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: var(--font-size-base);
}

.modal-content button {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast);
}

.modal-content button:hover {
    background: #059669;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
