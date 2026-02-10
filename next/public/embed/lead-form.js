(function() {
  'use strict';

  const API_URL = 'https://ai-command-lab.netlify.app/api/leads';

  // Find the container element
  const container = document.getElementById('acl-lead-form');
  if (!container) {
    console.error('ACL Lead Form: Container #acl-lead-form not found');
    return;
  }

  // Get brand from data attribute
  const brand = container.getAttribute('data-brand') || 'sotsvc';

  // Create Shadow DOM
  const shadow = container.attachShadow({ mode: 'open' });

  // Styles scoped to Shadow DOM
  const styles = `
    :host {
      display: block;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .acl-form-container {
      background: linear-gradient(135deg, #0B1120 0%, #060B18 100%);
      border: 1px solid rgba(56, 189, 248, 0.15);
      border-radius: 16px;
      padding: 2rem;
      max-width: 420px;
      color: #F1F5F9;
    }

    .acl-form-title {
      font-family: 'Outfit', -apple-system, sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #F1F5F9;
    }

    .acl-form-subtitle {
      font-size: 0.9rem;
      color: #94A3B8;
      margin-bottom: 1.5rem;
    }

    .acl-form-group {
      margin-bottom: 1rem;
    }

    .acl-form-label {
      display: block;
      font-size: 0.8rem;
      color: #94A3B8;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .acl-form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(100, 116, 139, 0.2);
      border-radius: 10px;
      color: #F1F5F9;
      font-family: inherit;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .acl-form-input:focus {
      border-color: rgba(56, 189, 248, 0.5);
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
    }

    .acl-form-input::placeholder {
      color: #64748B;
    }

    .acl-form-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .acl-form-submit {
      width: 100%;
      padding: 0.85rem 1.5rem;
      background: linear-gradient(135deg, #38BDF8, #0EA5E9);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-family: 'Outfit', -apple-system, sans-serif;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      margin-top: 0.5rem;
    }

    .acl-form-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(56, 189, 248, 0.3);
    }

    .acl-form-submit:active {
      transform: translateY(0);
    }

    .acl-form-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .acl-form-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .acl-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: acl-spin 0.8s linear infinite;
    }

    @keyframes acl-spin {
      to { transform: rotate(360deg); }
    }

    .acl-form-success {
      text-align: center;
      padding: 2rem 1rem;
    }

    .acl-success-icon {
      width: 48px;
      height: 48px;
      background: rgba(52, 211, 153, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.5rem;
    }

    .acl-success-title {
      font-family: 'Outfit', -apple-system, sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: #34D399;
      margin-bottom: 0.5rem;
    }

    .acl-success-message {
      font-size: 0.9rem;
      color: #94A3B8;
    }

    .acl-form-error {
      background: rgba(251, 113, 133, 0.1);
      border: 1px solid rgba(251, 113, 133, 0.3);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.85rem;
      color: #FB7185;
    }

    .acl-required {
      color: #FB7185;
      margin-left: 2px;
    }

    @media (max-width: 480px) {
      .acl-form-container {
        padding: 1.5rem;
        border-radius: 12px;
      }

      .acl-form-title {
        font-size: 1.1rem;
      }
    }
  `;

  // Initial form HTML
  const formHTML = `
    <style>${styles}</style>
    <div class="acl-form-container">
      <h3 class="acl-form-title">Get a Free Quote</h3>
      <p class="acl-form-subtitle">Fill out the form below and we'll get back to you shortly.</p>

      <form id="acl-lead-form-element">
        <div class="acl-form-error" id="acl-error" style="display: none;"></div>

        <div class="acl-form-group">
          <label class="acl-form-label" for="acl-name">Name <span class="acl-required">*</span></label>
          <input type="text" id="acl-name" name="name" class="acl-form-input" placeholder="Your name" required>
        </div>

        <div class="acl-form-group">
          <label class="acl-form-label" for="acl-email">Email <span class="acl-required">*</span></label>
          <input type="email" id="acl-email" name="email" class="acl-form-input" placeholder="your@email.com" required>
        </div>

        <div class="acl-form-group">
          <label class="acl-form-label" for="acl-phone">Phone</label>
          <input type="tel" id="acl-phone" name="phone" class="acl-form-input" placeholder="(555) 123-4567">
        </div>

        <div class="acl-form-group">
          <label class="acl-form-label" for="acl-message">Message</label>
          <textarea id="acl-message" name="message" class="acl-form-input acl-form-textarea" placeholder="Tell us about your project..."></textarea>
        </div>

        <button type="submit" class="acl-form-submit" id="acl-submit">
          Send Message
        </button>
      </form>
    </div>
  `;

  // Success HTML
  const successHTML = `
    <style>${styles}</style>
    <div class="acl-form-container">
      <div class="acl-form-success">
        <div class="acl-success-icon">✓</div>
        <h3 class="acl-success-title">Thank You!</h3>
        <p class="acl-success-message">We'll be in touch shortly.</p>
      </div>
    </div>
  `;

  // Render initial form
  shadow.innerHTML = formHTML;

  // Get form elements
  const form = shadow.getElementById('acl-lead-form-element');
  const submitBtn = shadow.getElementById('acl-submit');
  const errorEl = shadow.getElementById('acl-error');

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Hide any previous error
    errorEl.style.display = 'none';

    // Get form data
    const formData = {
      name: shadow.getElementById('acl-name').value.trim(),
      email: shadow.getElementById('acl-email').value.trim(),
      phone: shadow.getElementById('acl-phone').value.trim() || null,
      message: shadow.getElementById('acl-message').value.trim() || null,
      brand_slug: brand,
      source: 'embed'
    };

    // Basic validation
    if (!formData.name || !formData.email) {
      errorEl.textContent = 'Please fill in all required fields.';
      errorEl.style.display = 'block';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.style.display = 'block';
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="acl-form-loading"><span class="acl-spinner"></span> Sending...</span>';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success message
        shadow.innerHTML = successHTML;
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('ACL Lead Form Error:', error);
      errorEl.textContent = 'Something went wrong. Please try again.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message';
    }
  });
})();
