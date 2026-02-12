(function() {
  'use strict';

  // Get the current script tag to read data attributes
  const currentScript = document.currentScript || document.querySelector('script[src*="lead-form.js"]');
  const brand = currentScript?.getAttribute('data-brand') || 'sotsvc';
  const color = currentScript?.getAttribute('data-color') || '#00e5ff';

  const API_URL = 'https://ai-command-lab.netlify.app/api/leads/capture';

  // Create container div
  const container = document.createElement('div');
  container.id = 'acl-lead-form-container';

  // Attach Shadow DOM
  const shadow = container.attachShadow({ mode: 'open' });

  // Inject styles into Shadow DOM - light/neutral theme that adapts to host site
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .lead-form-wrapper {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .lead-form-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .lead-form-subtitle {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #444;
      margin-bottom: 0.375rem;
    }

    .required {
      color: #e53e3e;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 0.75rem;
      font-size: 0.9375rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fff;
      color: #333;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      font-family: inherit;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: ${color};
      box-shadow: 0 0 0 3px ${color}20;
    }

    input::placeholder,
    textarea::placeholder {
      color: #999;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      background: ${color};
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.1s ease;
      margin-top: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff60;
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .success-message {
      text-align: center;
      padding: 2rem;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      background: #48bb78;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .success-text {
      font-size: 0.9375rem;
      color: #666;
      line-height: 1.6;
    }

    .error-message {
      padding: 0.75rem 1rem;
      background: #fff5f5;
      border: 1px solid #fc8181;
      border-radius: 6px;
      color: #c53030;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 600px) {
      .lead-form-wrapper {
        margin: 1rem;
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .lead-form-title {
        font-size: 1.25rem;
      }
    }
  `;

  // Create style element
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  shadow.appendChild(styleSheet);

  // Form state
  let formState = {
    loading: false,
    error: null,
    success: false,
    submittedName: ''
  };

  // Render form
  function renderForm() {
    const formHTML = `
      <div class="lead-form-wrapper">
        <h2 class="lead-form-title">Get Your Free Quote</h2>
        <p class="lead-form-subtitle">Professional commercial cleaning services</p>

        ${formState.error ? `<div class="error-message">${formState.error}</div>` : ''}

        <form id="lead-capture-form">
          <div class="form-group">
            <label>Name <span class="required">*</span></label>
            <input type="text" name="name" placeholder="Your name" required />
          </div>

          <div class="form-group">
            <label>Company Name <span class="required">*</span></label>
            <input type="text" name="company" placeholder="Company name" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Phone <span class="required">*</span></label>
              <input type="tel" name="phone" placeholder="(555) 123-4567" required />
            </div>

            <div class="form-group">
              <label>Email <span class="required">*</span></label>
              <input type="email" name="email" placeholder="you@company.com" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Square Footage</label>
              <select name="sqft">
                <option value="">Select size</option>
                <option value="<1000">Under 1,000 sq ft</option>
                <option value="1000-5000">1,000 - 5,000 sq ft</option>
                <option value="5000-10000">5,000 - 10,000 sq ft</option>
                <option value="10000-25000">10,000 - 25,000 sq ft</option>
                <option value="25000-50000">25,000 - 50,000 sq ft</option>
                <option value="50000+">50,000+ sq ft</option>
              </select>
            </div>

            <div class="form-group">
              <label>Cleaning Frequency</label>
              <select name="frequency">
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="2-3-week">2-3 times/week</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="one-time">One-time</option>
                <option value="as-needed">As needed</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Additional Details</label>
            <textarea name="notes" placeholder="Tell us about your cleaning needs (optional)"></textarea>
          </div>

          <button type="submit" class="submit-btn" ${formState.loading ? 'disabled' : ''}>
            ${formState.loading ? '<span class="spinner"></span>Sending...' : 'Get My Free Cleaning Quote'}
          </button>
        </form>
      </div>
    `;

    shadow.innerHTML = '';
    shadow.appendChild(styleSheet);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = formHTML;
    shadow.appendChild(wrapper);

    // Attach form submit handler
    const form = shadow.getElementById('lead-capture-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }

  // Render success state
  function renderSuccess() {
    const successHTML = `
      <div class="lead-form-wrapper">
        <div class="success-message">
          <div class="success-icon">✓</div>
          <h3 class="success-title">Thank you, ${formState.submittedName}!</h3>
          <p class="success-text">
            We've received your request and will contact you within 24 hours with your free cleaning quote.
          </p>
        </div>
      </div>
    `;

    shadow.innerHTML = '';
    shadow.appendChild(styleSheet);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = successHTML;
    shadow.appendChild(wrapper);
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    // Get form data
    const form = e.target;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      sqft: formData.get('sqft') || null,
      frequency: formData.get('frequency') || null,
      notes: formData.get('notes') || null,
      brand: brand
    };

    // Update state to loading
    formState.loading = true;
    formState.error = null;
    formState.submittedName = data.name;
    renderForm();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        formState.success = true;
        renderSuccess();
      } else {
        formState.loading = false;
        formState.error = result.error || 'Failed to submit form. Please try again.';
        renderForm();
      }
    } catch (error) {
      formState.loading = false;
      formState.error = 'Network error. Please check your connection and try again.';
      renderForm();
    }
  }

  // Initial render
  renderForm();

  // Append to body
  document.body.appendChild(container);
})();
