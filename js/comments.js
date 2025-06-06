// Enhanced Comments System JavaScript
// Advanced Security & Interactive Features

class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.init();
  }

  init() {
    this.createContainer();
  }

  createContainer() {
    if (document.querySelector('.notification-container')) return;

    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 5000, title = '') {
    const notification = this.createNotification(message, type, title);
    this.container.appendChild(notification);
    this.notifications.push(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    return notification;
  }

  createNotification(message, type, title) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const titles = {
      success: title || 'نجحت العملية',
      error: title || 'حدث خطأ',
      warning: title || 'تحذير',
      info: title || 'معلومة',
    };

    notification.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">
          <span class="notification-icon">${icons[type] || icons.info}</span>
          ${titles[type]}
        </div>
        <button class="notification-close" onclick="this.closest('.notification').remove()">×</button>
      </div>
      <div class="notification-message">${message}</div>
      <div class="notification-progress"></div>
    `;

    return notification;
  }

  remove(notification) {
    if (notification && notification.parentNode) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, 300);
    }
  }

  success(message, title = '') {
    return this.show(message, 'success', 5000, title);
  }

  error(message, title = '') {
    return this.show(message, 'error', 7000, title);
  }

  warning(message, title = '') {
    return this.show(message, 'warning', 6000, title);
  }

  info(message, title = '') {
    return this.show(message, 'info', 5000, title);
  }
}

class CommentsSystem {
  constructor() {
    this.formElement = null;
    this.commentsList = null;
    this.csrfToken = '';
    this.rateLimitTime = 300000; // 5 minutes in milliseconds
    this.lastCommentTime = 0;
    this.maxCommentLength = 1000;
    this.minCommentLength = 10;
    this.isSubmitting = false;

    this.notificationSystem = new NotificationSystem();

    this.init();
  }

  init() {
    this.formElement = document.getElementById('commentForm');
    this.commentsList = document.getElementById('commentsList');

    if (!this.formElement) return;

    this.generateCSRFToken();
    this.setupFormValidation();
    this.setupSecurityFeatures();
    this.setupCommentInteractions();
    this.setupCommentFiltering();
    this.setupRealTimeFeatures();
    this.checkRateLimit();
  }

  // Security Features
  generateCSRFToken() {
    const token = this.generateRandomString(32);
    const timestamp = Date.now();

    document.getElementById('csrfToken').value = token;
    document.getElementById('timestamp').value = timestamp;

    this.csrfToken = token;

    // Store in session for validation
    sessionStorage.setItem('comment_csrf_token', token);
    sessionStorage.setItem('comment_timestamp', timestamp);
  }

  generateRandomString(length) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  validateCSRFToken() {
    const formToken = document.getElementById('csrfToken').value;
    const sessionToken = sessionStorage.getItem('comment_csrf_token');

    return formToken === sessionToken && formToken === this.csrfToken;
  }

  checkHoneypot() {
    const honeypot = document.getElementById('honeypot');
    return honeypot.value === '';
  }

  checkRateLimit() {
    const lastComment = localStorage.getItem('last_comment_time');
    if (lastComment) {
      this.lastCommentTime = parseInt(lastComment);
      const timeDiff = Date.now() - this.lastCommentTime;

      if (timeDiff < this.rateLimitTime) {
        const remainingTime = Math.ceil(
          (this.rateLimitTime - timeDiff) / 60000
        );
        this.showRateLimitWarning(remainingTime);
        return false;
      }
    }
    return true;
  }

  showRateLimitWarning(minutes) {
    const notice = document.querySelector('.rate-limit-notice');
    if (notice) {
      notice.innerHTML = `
        <i class="fas fa-clock" aria-hidden="true"></i>
        <span>يجب الانتظار ${minutes} دقيقة قبل نشر تعليق آخر</span>
      `;
      notice.style.display = 'flex';
      notice.style.backgroundColor = '#fef3c7';
      notice.style.borderColor = '#f59e0b';
    }
  }

  // Form Validation
  setupFormValidation() {
    const inputs = this.formElement.querySelectorAll('input, textarea');

    inputs.forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });

    // Real-time character counting
    const commentText = document.getElementById('commentText');
    if (commentText) {
      commentText.addEventListener('input', () =>
        this.updateCharacterCount(commentText)
      );
    }

    // Form submission
    this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));

    // Enable submit button when form is valid
    this.formElement.addEventListener('input', () => this.checkFormValidity());
  }

  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'name':
        if (!value) {
          errorMessage = 'الاسم مطلوب';
          isValid = false;
        } else if (value.length < 2 || value.length > 50) {
          errorMessage = 'الاسم يجب أن يكون بين 2-50 حرف';
          isValid = false;
        } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(value)) {
          errorMessage = 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط';
          isValid = false;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errorMessage = 'البريد الإلكتروني مطلوب';
          isValid = false;
        } else if (!emailRegex.test(value)) {
          errorMessage = 'البريد الإلكتروني غير صحيح';
          isValid = false;
        }
        break;

      case 'website':
        if (value && !/^https?:\/\/.+/.test(value)) {
          errorMessage = 'رابط الموقع يجب أن يبدأ بـ http:// أو https://';
          isValid = false;
        }
        break;

      case 'comment':
        if (!value) {
          errorMessage = 'التعليق مطلوب';
          isValid = false;
        } else if (value.length < this.minCommentLength) {
          errorMessage = `التعليق يجب أن يكون ${this.minCommentLength} أحرف على الأقل`;
          isValid = false;
        } else if (value.length > this.maxCommentLength) {
          errorMessage = `التعليق يجب ألا يتجاوز ${this.maxCommentLength} حرف`;
          isValid = false;
        } else if (this.containsSpam(value)) {
          errorMessage = 'التعليق يحتوي على محتوى مشبوه';
          isValid = false;
        }
        break;
    }

    this.showFieldError(field, errorMessage, !isValid);
    return isValid;
  }

  containsSpam(text) {
    const spamPatterns = [
      /https?:\/\/[^\s]+/gi, // Multiple URLs
      /\b(?:viagra|casino|poker|loans|cheap)\b/gi,
      /(.)\1{4,}/gi, // Repeated characters
      /[A-Z]{5,}/g, // All caps
    ];

    return spamPatterns.some((pattern) => pattern.test(text));
  }

  showFieldError(field, message, hasError) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = hasError ? 'block' : 'none';
    }

    field.classList.toggle('error', hasError);
    field.setAttribute('aria-invalid', hasError);
  }

  clearFieldError(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
  }

  updateCharacterCount(textarea) {
    const counter = document.getElementById('commentCounter');
    if (counter) {
      const current = textarea.value.length;
      const max = this.maxCommentLength;
      counter.textContent = `${current}/${max}`;

      // Update color based on usage
      if (current > max * 0.9) {
        counter.style.color = '#ef4444';
      } else if (current > max * 0.7) {
        counter.style.color = '#f59e0b';
      } else {
        counter.style.color = '#64748b';
      }
    }
  }

  checkFormValidity() {
    const requiredFields = this.formElement.querySelectorAll('[required]');
    const termsCheckbox = document.getElementById('termsAgree');
    const submitButton = document.getElementById('submitComment');

    let isFormValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim() || field.classList.contains('error')) {
        isFormValid = false;
      }
    });

    if (termsCheckbox && !termsCheckbox.checked) {
      isFormValid = false;
    }

    if (submitButton) {
      submitButton.disabled = !isFormValid;
    }
  }

  // Form Submission
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    // Security checks
    if (!this.validateCSRFToken()) {
      this.notificationSystem.error('خطأ في الأمان - يرجى إعادة تحميل الصفحة');
      return;
    }

    if (!this.checkHoneypot()) {
      this.notificationSystem.error('تم اكتشاف نشاط مشبوه');
      return;
    }

    if (!this.checkRateLimit()) {
      return;
    }

    // Validate all fields
    const inputs = this.formElement.querySelectorAll('input, textarea');
    let isFormValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.notificationSystem.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    // Check reCAPTCHA if present
    if (typeof grecaptcha !== 'undefined') {
      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        this.notificationSystem.error('يرجى التحقق من أنك لست روبوت');
        return;
      }
    }

    await this.submitComment();
  }

  async submitComment() {
    this.isSubmitting = true;
    const submitButton =
      document.getElementById('submit-btn') ||
      document.getElementById('submitComment');
    const originalText = submitButton.innerHTML;

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

    try {
      const formData = new FormData(this.formElement);

      // Convert FormData to JSON
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        comment: formData.get('comment'),
        csrf_token: this.csrfToken,
        timestamp: Date.now(),
        website_url: formData.get('website_url') || '', // Honeypot
      };

      // Send to enhanced API
      const response = await fetch(
        'http://localhost:8080/api/comments-enhanced.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إرسال التعليق');
      }

      // Success
      this.handleSubmitSuccess(result);
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.isSubmitting = false;
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  }

  async simulateApiCall(formData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure
        if (Math.random() > 0.1) {
          resolve({ success: true, id: Date.now() });
        } else {
          reject(new Error('فشل في إرسال التعليق'));
        }
      }, 2000);
    });
  }

  handleSubmitSuccess() {
    // Reset form
    this.formElement.reset();
    this.generateCSRFToken(); // Generate new token

    // Update rate limit
    localStorage.setItem('last_comment_time', Date.now());

    // Show success message
    this.notificationSystem.success(
      'تم إرسال تعليقك بنجاح! سيظهر بعد المراجعة.'
    );

    // Reset character counter
    const counter = document.getElementById('commentCounter');
    if (counter) {
      counter.textContent = '0/1000';
      counter.style.color = '#64748b';
    }

    // Reset reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.reset();
    }

    // Update comments count
    this.incrementCommentsCount();
  }

  handleSubmitError(error) {
    this.notificationSystem.error(
      error.message || 'حدث خطأ أثناء إرسال التعليق'
    );
  }

  // Comment Interactions
  setupCommentInteractions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.comment-action');
      if (!target) return;

      const action = target.dataset.action;
      const commentId = target.dataset.commentId;

      switch (action) {
        case 'like':
          this.handleCommentLike(target, commentId);
          break;
        case 'reply':
          this.handleCommentReply(target, commentId);
          break;
        case 'share':
          this.handleCommentShare(target, commentId);
          break;
        case 'report':
          this.handleCommentReport(target, commentId);
          break;
      }
    });
  }

  handleCommentLike(button, commentId) {
    if (button.classList.contains('liked')) return;

    const countSpan = button.querySelector('.action-count');
    const currentCount = parseInt(countSpan.textContent.match(/\d+/)[0]);
    const newCount = currentCount + 1;

    countSpan.textContent = `(${newCount})`;
    button.classList.add('liked');
    button.style.color = '#10b981';

    // Store in localStorage to prevent multiple likes
    const likedComments = JSON.parse(
      localStorage.getItem('liked_comments') || '[]'
    );
    likedComments.push(commentId);
    localStorage.setItem('liked_comments', JSON.stringify(likedComments));

    this.notificationSystem.success('تم تسجيل إعجابك!');
  }

  handleCommentReply(button, commentId) {
    // Create reply form or scroll to main form
    const commentItem = button.closest('.comment-item');
    const existingReplyForm = commentItem.querySelector('.reply-form');

    if (existingReplyForm) {
      existingReplyForm.remove();
      return;
    }

    const replyForm = this.createReplyForm(commentId);
    commentItem.appendChild(replyForm);

    // Focus on reply textarea
    const textarea = replyForm.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }

  createReplyForm(commentId) {
    const replyForm = document.createElement('div');
    replyForm.className = 'reply-form';
    replyForm.innerHTML = `
      <form class="comment-reply-form">
        <div class="form-group">
          <textarea
            placeholder="اكتب ردك هنا..."
            maxlength="500"
            rows="3"
            required
          ></textarea>
        </div>
        <div class="reply-actions">
          <button type="submit" class="reply-submit-btn">
            <i class="fas fa-paper-plane"></i>
            إرسال الرد
          </button>
          <button type="button" class="reply-cancel-btn">
            إلغاء
          </button>
        </div>
      </form>
    `;

    // Handle reply form submission
    const form = replyForm.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReply(form, commentId);
    });

    // Handle cancel
    const cancelBtn = replyForm.querySelector('.reply-cancel-btn');
    cancelBtn.addEventListener('click', () => {
      replyForm.remove();
    });

    return replyForm;
  }

  submitReply(form, commentId) {
    const textarea = form.querySelector('textarea');
    const replyText = textarea.value.trim();

    if (!replyText) {
      this.notificationSystem.error('يرجى كتابة رد');
      return;
    }

    if (replyText.length < 5) {
      this.notificationSystem.error('الرد قصير جداً');
      return;
    }

    // Simulate reply submission
    const submitBtn = form.querySelector('.reply-submit-btn');
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.closest('.reply-form').remove();
      this.notificationSystem.success('تم إرسال ردك بنجاح!');
    }, 1500);
  }

  handleCommentShare(button, commentId) {
    const url = `${window.location.href}#comment-${commentId}`;

    if (navigator.share) {
      navigator.share({
        title: 'تعليق مفيد',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.notificationSystem.success('تم نسخ رابط التعليق!');
      });
    }
  }

  handleCommentReport(button, commentId) {
    if (confirm('هل تريد الإبلاغ عن هذا التعليق؟')) {
      // Store report in localStorage (in real app, send to server)
      const reports = JSON.parse(
        localStorage.getItem('reported_comments') || '[]'
      );
      if (!reports.includes(commentId)) {
        reports.push(commentId);
        localStorage.setItem('reported_comments', JSON.stringify(reports));

        button.innerHTML = '<i class="fas fa-check"></i> تم الإبلاغ';
        button.disabled = true;
        button.style.color = '#64748b';

        this.notificationSystem.success('تم الإبلاغ عن التعليق');
      } else {
        this.notificationSystem.info('تم الإبلاغ عن هذا التعليق مسبقاً');
      }
    }
  }

  // Comment Filtering
  setupCommentFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        this.filterComments(filter);

        // Update active state
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  }

  filterComments(filter) {
    const comments = Array.from(document.querySelectorAll('.comment-item'));
    const container = document.querySelector('.comments-thread');

    if (!container) return;

    let sortedComments;

    switch (filter) {
      case 'newest':
        sortedComments = comments.sort((a, b) => {
          const dateA = new Date(a.dataset.date || '2025-01-01');
          const dateB = new Date(b.dataset.date || '2025-01-01');
          return dateB - dateA;
        });
        break;

      case 'oldest':
        sortedComments = comments.sort((a, b) => {
          const dateA = new Date(a.dataset.date || '2025-01-01');
          const dateB = new Date(b.dataset.date || '2025-01-01');
          return dateA - dateB;
        });
        break;

      case 'most-liked':
        sortedComments = comments.sort((a, b) => {
          const likesA = parseInt(a.dataset.likes || '0');
          const likesB = parseInt(b.dataset.likes || '0');
          return likesB - likesA;
        });
        break;

      default:
        sortedComments = comments;
    }

    // Clear container and re-append sorted comments
    container.innerHTML = '';
    sortedComments.forEach((comment) => {
      container.appendChild(comment);
    });

    this.notificationSystem.info(
      `تم ترتيب التعليقات حسب: ${this.getFilterName(filter)}`
    );
  }

  getFilterName(filter) {
    const names = {
      newest: 'الأحدث',
      oldest: 'الأقدم',
      'most-liked': 'الأكثر إعجاباً',
    };
    return names[filter] || filter;
  }

  // Real-time Features
  setupRealTimeFeatures() {
    this.loadLikedComments();
    this.loadReportedComments();
    this.setupLoadMore();
  }

  loadLikedComments() {
    const likedComments = JSON.parse(
      localStorage.getItem('liked_comments') || '[]'
    );

    likedComments.forEach((commentId) => {
      const likeButton = document.querySelector(
        `[data-comment-id="${commentId}"][data-action="like"]`
      );
      if (likeButton) {
        likeButton.classList.add('liked');
        likeButton.style.color = '#10b981';
      }
    });
  }

  loadReportedComments() {
    const reportedComments = JSON.parse(
      localStorage.getItem('reported_comments') || '[]'
    );

    reportedComments.forEach((commentId) => {
      const reportButton = document.querySelector(
        `[data-comment-id="${commentId}"][data-action="report"]`
      );
      if (reportButton) {
        reportButton.innerHTML = '<i class="fas fa-check"></i> تم الإبلاغ';
        reportButton.disabled = true;
        reportButton.style.color = '#64748b';
      }
    });
  }

  setupLoadMore() {
    const loadMoreButton = document.getElementById('loadMoreComments');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        this.loadMoreComments();
      });
    }
  }

  loadMoreComments() {
    const button = document.getElementById('loadMoreComments');
    const status = document.getElementById('loadMoreStatus');

    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    button.disabled = true;

    if (status) {
      status.textContent = 'جاري تحميل المزيد من التعليقات...';
    }

    // Simulate loading
    setTimeout(() => {
      button.innerHTML =
        '<i class="fas fa-chevron-down"></i> تحميل المزيد من التعليقات (15 متبقي)';
      button.disabled = false;

      if (status) {
        status.textContent = 'تم تحميل 5 تعليقات إضافية';
      }

      this.notificationSystem.success('تم تحميل المزيد من التعليقات');
    }, 2000);
  }

  // Utility Functions
  incrementCommentsCount() {
    const countElement = document.getElementById('commentsCount');
    if (countElement) {
      const currentCount = parseInt(countElement.textContent);
      countElement.textContent = currentCount + 1;
    }
  }
}

// reCAPTCHA Callback
function recaptchaCallback() {
  const submitButton = document.getElementById('submitComment');
  if (submitButton) {
    // Re-check form validity when reCAPTCHA is completed
    const commentsSystem = window.commentsSystemInstance;
    if (commentsSystem) {
      commentsSystem.checkFormValidity();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.commentsSystemInstance = new CommentsSystem();
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notification {
    position: relative;
    max-width: 400px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .notification.show {
    opacity: 1;
    transform: translateY(0);
  }

  .notification.success {
    background-color: #10b981;
    color: white;
  }

  .notification.error {
    background-color: #ef4444;
    color: white;
  }

  .notification.warning {
    background-color: #f59e0b;
    color: white;
  }

  .notification.info {
    background-color: #3b82f6;
    color: white;
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .notification-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
  }

  .notification-icon {
    font-size: 1.2rem;
  }

  .notification-message {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .notification-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    animation: progress 5s linear forwards;
  }

  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
`;

document.head.appendChild(notificationStyles);
