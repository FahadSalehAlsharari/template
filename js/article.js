// Article Page JavaScript Functions

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all article features
  initTableOfContents();
  initReadingProgress();
  initBackToTop();
  initArticleRating();
  initSocialSharing();
  initCommentForm();
  initImageLazyLoading();
  initSmoothScrolling();
  initHostingComparison();
});

// Table of Contents Functionality
function initTableOfContents() {
  const toc = document.querySelector('.toc-list');
  const headings = document.querySelectorAll(
    '.article-content h2, .article-content h3'
  );

  if (!toc || headings.length === 0) return;

  // Clear existing TOC
  toc.innerHTML = '';

  // Generate TOC items
  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;

    const li = document.createElement('li');
    li.className = 'toc-item';

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = `toc-link ${
      heading.tagName.toLowerCase() === 'h3' ? 'level-3' : ''
    }`;
    link.textContent = heading.textContent;

    li.appendChild(link);
    toc.appendChild(li);
  });

  // Handle TOC link clicks
  const tocLinks = document.querySelectorAll('.toc-link');
  tocLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Update active state
        tocLinks.forEach((l) => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Update active TOC item on scroll
  window.addEventListener('scroll', updateActiveTocItem);
}

function updateActiveTocItem() {
  const headings = document.querySelectorAll(
    '.article-content h2, .article-content h3'
  );
  const tocLinks = document.querySelectorAll('.toc-link');

  let currentActive = null;
  const scrollPos = window.scrollY + 100;

  headings.forEach((heading, index) => {
    if (heading.offsetTop <= scrollPos) {
      currentActive = index;
    }
  });

  tocLinks.forEach((link, index) => {
    link.classList.toggle('active', index === currentActive);
  });
}

// Reading Progress Bar
function initReadingProgress() {
  const progressBar = document.querySelector('.reading-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', function () {
    const article = document.querySelector('.article-content');
    if (!article) return;

    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    const progress = Math.max(
      0,
      Math.min(
        100,
        ((scrollTop - articleTop + windowHeight * 0.3) / articleHeight) * 100
      )
    );

    progressBar.style.width = `${progress}%`;
  });
}

// Back to Top Button
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// Article Rating System
function initArticleRating() {
  const stars = document.querySelectorAll('.star');
  const ratingText = document.querySelector('.rating-text');
  let currentRating = 0;

  stars.forEach((star, index) => {
    star.addEventListener('mouseenter', function () {
      highlightStars(index + 1);
    });

    star.addEventListener('mouseleave', function () {
      highlightStars(currentRating);
    });

    star.addEventListener('click', function () {
      currentRating = index + 1;
      highlightStars(currentRating);
      updateRatingText(currentRating);
      saveRating(currentRating);
    });
  });

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      star.classList.toggle('active', index < rating);
    });
  }

  function updateRatingText(rating) {
    const messages = ['', 'ضعيف جداً', 'ضعيف', 'متوسط', 'جيد', 'ممتاز'];
    if (ratingText) {
      ratingText.textContent = `تقييمك: ${messages[rating]} (${rating}/5)`;
    }
  }

  function saveRating(rating) {
    // Here you would typically send the rating to your backend
    console.log('Rating saved:', rating);

    // Show thank you message
    setTimeout(() => {
      if (ratingText) {
        ratingText.textContent += ' - شكراً لتقييمك!';
      }
    }, 500);
  }
}

// Social Sharing Functions
function initSocialSharing() {
  const shareButtons = document.querySelectorAll('.share-btn');

  shareButtons.forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const platform = this.classList[1]; // facebook, twitter, etc.
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      const text = encodeURIComponent(
        document.querySelector('meta[name="description"]')?.content || ''
      );

      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${title}%20${url}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    });
  });

  // Copy link functionality
  const copyLinkBtn = document.querySelector('.copy-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.textContent = 'تم النسخ!';
        setTimeout(() => {
          this.textContent = 'نسخ الرابط';
        }, 2000);
      });
    });
  }
}

// Comment Form Handling
function initCommentForm() {
  const commentForm = document.querySelector('.comment-form form');
  if (!commentForm) return;

  commentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const commentData = {
      name: formData.get('name'),
      email: formData.get('email'),
      comment: formData.get('comment'),
    };

    // Validate form
    if (!commentData.name || !commentData.email || !commentData.comment) {
      showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    // Submit comment (replace with actual API call)
    submitComment(commentData);
  });

  // Comment like/reply functionality
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('comment-like')) {
      handleCommentLike(e.target);
    }

    if (e.target.classList.contains('comment-reply')) {
      handleCommentReply(e.target);
    }
  });
}

function submitComment(commentData) {
  // Show loading state
  const submitBtn = document.querySelector(
    '.comment-form button[type="submit"]'
  );
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'جاري الإرسال...';
  submitBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    // Reset form
    document.querySelector('.comment-form form').reset();

    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Show success message
    showNotification('تم إرسال تعليقك بنجاح! سيظهر بعد المراجعة.', 'success');

    // Add comment to list (in real app, refresh from server)
    addCommentToList(commentData);
  }, 1500);
}

function addCommentToList(commentData) {
  const commentsList = document.querySelector('.comment-list');
  if (!commentsList) return;

  const commentHtml = `
        <li class="comment-item">
            <div class="comment-header">
                <img src="assets/images/default-avatar.jpg" alt="${commentData.name}" class="comment-avatar">
                <div>
                    <div class="comment-author">${commentData.name}</div>
                    <div class="comment-date">الآن</div>
                </div>
            </div>
            <div class="comment-content">${commentData.comment}</div>
            <div class="comment-actions">
                <button class="comment-like">
                    <i class="fas fa-thumbs-up"></i>
                    إعجاب (0)
                </button>
                <button class="comment-reply">
                    <i class="fas fa-reply"></i>
                    رد
                </button>
            </div>
        </li>
    `;

  commentsList.insertAdjacentHTML('afterbegin', commentHtml);
}

function handleCommentLike(button) {
  const currentLikes = parseInt(button.textContent.match(/\d+/)[0]);
  const newLikes = currentLikes + 1;
  button.innerHTML = `<i class="fas fa-thumbs-up"></i> إعجاب (${newLikes})`;
  button.style.color = 'var(--accent-color)';
  button.disabled = true;
}

function handleCommentReply(button) {
  // Implementation for reply functionality
  showNotification('ميزة الرد قيد التطوير', 'info');
}

// Image Lazy Loading
function initImageLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

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
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
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
}

// Hosting Comparison Interactive Features
function initHostingComparison() {
  const comparisonTable = document.querySelector('.comparison-table');
  if (!comparisonTable) return;

  // Add sorting functionality to table headers
  const headers = comparisonTable.querySelectorAll('th[data-sort]');
  headers.forEach((header) => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => sortTable(header.dataset.sort));
  });

  // Add filtering functionality
  addHostingFilters();

  // Initialize price calculator
  initPriceCalculator();
}

function sortTable(column) {
  const table = document.querySelector('.comparison-table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  // Toggle sort direction
  const currentSort = table.dataset.sortDirection || 'asc';
  const newSort = currentSort === 'asc' ? 'desc' : 'asc';
  table.dataset.sortDirection = newSort;

  // Sort rows based on column
  rows.sort((a, b) => {
    const aVal = a.querySelector(`[data-${column}]`)?.textContent || '';
    const bVal = b.querySelector(`[data-${column}]`)?.textContent || '';

    // Handle numeric values
    if (column === 'price') {
      const aNum = parseFloat(aVal.replace(/[^0-9.]/g, ''));
      const bNum = parseFloat(bVal.replace(/[^0-9.]/g, ''));
      return newSort === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Handle text values
    return newSort === 'asc'
      ? aVal.localeCompare(bVal, 'ar')
      : bVal.localeCompare(aVal, 'ar');
  });

  // Re-append sorted rows
  rows.forEach((row) => tbody.appendChild(row));

  // Show visual feedback
  showNotification(`تم ترتيب الجدول حسب ${getColumnName(column)}`, 'info');
}

function getColumnName(column) {
  const names = {
    company: 'اسم الشركة',
    price: 'السعر',
    uptime: 'وقت التشغيل',
    support: 'الدعم التقني',
  };
  return names[column] || column;
}

function addHostingFilters() {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'hosting-filters';
  filterContainer.innerHTML = `
        <div class="filter-group">
            <label for="price-range">نطاق السعر الشهري:</label>
            <select id="price-range">
                <option value="">جميع الأسعار</option>
                <option value="0-5">أقل من 5$</option>
                <option value="5-10">5$ - 10$</option>
                <option value="10-20">10$ - 20$</option>
                <option value="20+">أكثر من 20$</option>
            </select>
        </div>

        <div class="filter-group">
            <label for="features-filter">الميزات المطلوبة:</label>
            <select id="features-filter">
                <option value="">جميع الميزات</option>
                <option value="ssl">شهادة SSL مجانية</option>
                <option value="cdn">شبكة CDN</option>
                <option value="backup">النسخ الاحتياطي</option>
                <option value="wordpress">محسّن لـ WordPress</option>
            </select>
        </div>

        <button id="reset-filters" class="filter-reset">إعادة تعيين</button>
    `;

  // Insert filters before the table
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.parentNode.insertBefore(filterContainer, tableContainer);

    // Add event listeners
    filterContainer.addEventListener('change', applyFilters);
    document
      .getElementById('reset-filters')
      .addEventListener('click', resetFilters);
  }
}

function applyFilters() {
  const priceRange = document.getElementById('price-range').value;
  const featuresFilter = document.getElementById('features-filter').value;
  const rows = document.querySelectorAll('.comparison-table tbody tr');

  let visibleCount = 0;

  rows.forEach((row) => {
    let showRow = true;

    // Apply price filter
    if (priceRange) {
      const priceCell = row.querySelector('.price-cell');
      const price = parseFloat(
        priceCell?.textContent.replace(/[^0-9.]/g, '') || '0'
      );

      switch (priceRange) {
        case '0-5':
          showRow = price < 5;
          break;
        case '5-10':
          showRow = price >= 5 && price <= 10;
          break;
        case '10-20':
          showRow = price >= 10 && price <= 20;
          break;
        case '20+':
          showRow = price > 20;
          break;
      }
    }

    // Apply features filter (would need data attributes on rows)
    if (featuresFilter && showRow) {
      const hasFeature = row.dataset[featuresFilter] === 'true';
      showRow = hasFeature;
    }

    row.style.display = showRow ? '' : 'none';
    if (showRow) visibleCount++;
  });

  // Show results count
  updateFilterResults(visibleCount);
}

function resetFilters() {
  document.getElementById('price-range').value = '';
  document.getElementById('features-filter').value = '';

  const rows = document.querySelectorAll('.comparison-table tbody tr');
  rows.forEach((row) => (row.style.display = ''));

  updateFilterResults(rows.length);
}

function updateFilterResults(count) {
  let resultsDiv = document.querySelector('.filter-results');
  if (!resultsDiv) {
    resultsDiv = document.createElement('div');
    resultsDiv.className = 'filter-results';
    const filtersDiv = document.querySelector('.hosting-filters');
    if (filtersDiv) {
      filtersDiv.appendChild(resultsDiv);
    }
  }

  resultsDiv.textContent = `عرض ${count} نتيجة`;
}

function initPriceCalculator() {
  const calculatorHtml = `
        <div class="price-calculator">
            <h3>حاسبة التكلفة السنوية</h3>
            <div class="calculator-content">
                <div class="calc-input">
                    <label for="hosting-period">فترة الاستضافة:</label>
                    <select id="hosting-period">
                        <option value="1">شهر واحد</option>
                        <option value="12" selected>سنة واحدة</option>
                        <option value="24">سنتان</option>
                        <option value="36">ثلاث سنوات</option>
                    </select>
                </div>

                <div class="calc-input">
                    <label for="domain-included">دومين مجاني؟</label>
                    <input type="checkbox" id="domain-included" checked>
                    <span class="checkmark"></span>
                </div>

                <div class="calc-result">
                    <div class="monthly-cost">التكلفة الشهرية: <span id="monthly-price">$0</span></div>
                    <div class="total-cost">التكلفة الإجمالية: <span id="total-price">$0</span></div>
                    <div class="savings">توفير مقارنة بالدفع الشهري: <span id="savings-amount">$0</span></div>
                </div>
            </div>
        </div>
    `;

  // Add calculator after comparison table
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.insertAdjacentHTML('afterend', calculatorHtml);

    // Add event listeners
    document
      .getElementById('hosting-period')
      .addEventListener('change', updateCalculator);
    document
      .getElementById('domain-included')
      .addEventListener('change', updateCalculator);

    // Initialize calculator
    updateCalculator();
  }
}

function updateCalculator() {
  // This would typically get values from the selected hosting plan
  const basePriceMonthly = 8.99; // Example price
  const period = parseInt(document.getElementById('hosting-period').value);
  const domainIncluded = document.getElementById('domain-included').checked;

  // Calculate discounts based on period
  let discount = 0;
  if (period >= 12) discount = 0.25; // 25% discount for yearly
  if (period >= 24) discount = 0.35; // 35% discount for 2 years
  if (period >= 36) discount = 0.45; // 45% discount for 3 years

  const discountedMonthly = basePriceMonthly * (1 - discount);
  const totalCost = discountedMonthly * period;
  const regularCost = basePriceMonthly * period;
  const savings = regularCost - totalCost;

  // Add domain cost if not included
  let domainCost = 0;
  if (!domainIncluded && period >= 12) {
    domainCost = 15.99; // Annual domain cost
  }

  document.getElementById(
    'monthly-price'
  ).textContent = `$${discountedMonthly.toFixed(2)}`;
  document.getElementById('total-price').textContent = `$${(
    totalCost + domainCost
  ).toFixed(2)}`;
  document.getElementById('savings-amount').textContent = `$${savings.toFixed(
    2
  )}`;
}

// Utility Functions
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === 'success'
            ? '#10b981'
            : type === 'error'
            ? '#ef4444'
            : '#3b82f6'
        };
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Handle close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    removeNotification(notification);
  });

  // Auto remove after 5 seconds
  setTimeout(() => {
    removeNotification(notification);
  }, 5000);
}

function removeNotification(notification) {
  notification.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// Print Article Function
function printArticle() {
  const printContent = document.querySelector('.article-content').innerHTML;
  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${document.title}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                h1, h2, h3 { color: #1e3a8a; }
                img { max-width: 100%; height: auto; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <h1>${document.querySelector('.article-title').textContent}</h1>
            ${printContent}
        </body>
        </html>
    `);

  printWindow.document.close();
  printWindow.print();
}

// Export functions for global access
window.articleFunctions = {
  printArticle,
  showNotification,
};
