# Coming Soon Page - Usage Guide

## 📄 Overview
A professional "Coming Soon" page for features that are under development. Perfect for Training, Premium features, or any upcoming services.

## 🎯 Current Setup

### Training Page Redirect
- `/pages/training.html` → Automatically redirects to `coming-soon.html`
- Original full training page saved as `/pages/training-full.html` for future use

## ✨ Features

### 1. Countdown Timer
- Set to 30 days from current date (customizable)
- Real-time countdown: Days, Hours, Minutes, Seconds
- Automatically displays "We're Live!" when countdown ends

### 2. Email Notification Form
- Collect email addresses from interested visitors
- Client-side validation
- Success message confirmation
- Form data logged to console (connect to backend for actual email collection)

### 3. Features Preview
- 3 feature cards showing what's coming
- Currently configured for:
  - Training Programs
  - Online Platform
  - Certifications

### 4. Professional Design
- Blue gradient background matching site theme
- Glassmorphism effects
- Pulsing icon animation
- Fully responsive
- Social media links
- Back to home navigation

## 🔧 Customization

### Change Launch Date
Edit `coming-soon.html` around line 420:
```javascript
const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + 30); // Change 30 to your desired days
```

Or set specific date:
```javascript
const launchDate = new Date('2025-01-31'); // YYYY-MM-DD format
```

### Update Page Content
Edit `coming-soon.html`:

**Title & Subtitle:**
```html
<h1 class="coming-soon-title">Coming Soon</h1>
<p class="coming-soon-subtitle">
  Your custom message here
</p>
```

**Features Preview:**
```html
<div class="feature-preview-item">
  <div class="feature-preview-icon">
    <i class="fas fa-your-icon"></i>
  </div>
  <div class="feature-preview-title">Feature Name</div>
  <div class="feature-preview-text">Description</div>
</div>
```

**Main Icon:**
```html
<div class="coming-soon-icon">
  <i class="fas fa-rocket"></i> <!-- Change icon here -->
</div>
```

Available icons: rocket, tools, graduation-cap, cog, lightbulb, star, trophy, etc.

### Integrate Email Backend

Replace the console.log with your backend API:

```javascript
notifyForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = emailInput.value;
  
  try {
    // Send to your backend
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });
    
    if (response.ok) {
      successMessage.classList.add('show');
      emailInput.value = '';
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### Remove Countdown
If you don't want countdown timer:
```html
<!-- Comment out or delete this section -->
<!--
<div class="countdown-timer" id="countdown">
  ...
</div>
-->
```

### Change Color Scheme
Edit the CSS in `<style>` section:
```css
.coming-soon-hero {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  /* Change to your colors */
}
```

## 📋 Usage Examples

### Example 1: Training Page (Current)
✅ Already configured
- Redirects from `/pages/training.html`
- Shows training-related features

### Example 2: Premium Features
```html
<!-- Update title -->
<h1 class="coming-soon-title">Premium Features</h1>

<!-- Update features -->
<div class="feature-preview-item">
  <i class="fas fa-crown"></i>
  Premium Dashboard
</div>
```

### Example 3: Mobile App
```html
<h1 class="coming-soon-title">Mobile App Launching Soon</h1>
<div class="feature-preview-item">
  <i class="fas fa-mobile-alt"></i>
  iOS & Android Apps
</div>
```

## 🔄 When Feature is Ready

### Option 1: Remove Redirect
1. Delete `/pages/training.html`
2. Rename `/pages/training-full.html` to `/pages/training.html`
3. Feature is now live!

### Option 2: Progressive Rollout
Keep both pages:
- Use `coming-soon.html` for Beta announcement
- Add "Join Beta" button linking to actual feature
- Gradually migrate users

## 🎨 Color Variations

### Green Theme (Eco/Sustainability)
```css
background: linear-gradient(135deg, #059669 0%, #10B981 100%);
```

### Purple Theme (Premium/VIP)
```css
background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
```

### Orange Theme (Energy/Exciting)
```css
background: linear-gradient(135deg, #EA580C 0%, #F59E0B 100%);
```

## 📱 Mobile Responsive
- Automatically stacks elements on mobile
- Touch-friendly buttons
- Readable text sizes
- Optimized countdown display

## ⚡ Performance
- Lightweight (no external dependencies except Font Awesome)
- Fast load time
- Smooth animations
- Efficient countdown update (1 second intervals)

## 🔒 Email Collection (Production)

### Recommended Services:
1. **FormSubmit.co** (Free)
   ```html
   <form action="https://formsubmit.co/your@email.com" method="POST">
   ```

2. **Mailchimp** - Build mailing list
3. **SendGrid** - Email automation
4. **Firebase** - Store in database

## 📊 Analytics

Add Google Analytics or tracking:
```html
<!-- Before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-ID');
</script>
```

## 🎯 SEO Tips

Update meta tags:
```html
<meta name="description" content="NexEV Training Programs launching soon. Get notified!">
<meta property="og:title" content="Coming Soon - NexEV Training">
<meta property="og:description" content="Professional EV training programs launching soon">
<meta property="og:image" content="URL_TO_IMAGE">
```

## 🚀 Quick Deployment Checklist

- [ ] Set correct launch date
- [ ] Update page title and description
- [ ] Customize features preview
- [ ] Test email form
- [ ] Update social media links
- [ ] Test on mobile devices
- [ ] Add analytics tracking
- [ ] Configure email backend
- [ ] Test countdown timer
- [ ] Verify redirect from training.html

---

**Need help?** Contact: info@nexev.com
