# Toolstoy User Workflow Test Guide

**Dev Server**: http://localhost:5174/

## Complete User Journey: Homepage → Studio

### 🏠 Step 1: Homepage (/)
**What to test:**
- [ ] Hero section loads with main headline
- [ ] "Get Started" CTA button visible
- [ ] Showcase section with 7 layout cards
- [ ] Click any showcase card → Demo modal opens
- [ ] Demo modal shows character + chat interface
- [ ] "How It Works" section (3 steps)
- [ ] "Works Anywhere" platform logos
- [ ] Final CTA section
- [ ] Footer with links

**Key interactions:**
1. Click "Get Started" → Should go to `/signup`
2. Click any showcase card → Modal opens
3. Close modal → Returns to homepage
4. Scroll through entire page → Animations trigger

---

### 🔐 Step 2: Sign Up (/signup)
**What to test:**
- [ ] Sign up form with email, password, name fields
- [ ] "Store URL" optional field
- [ ] Password requirements shown
- [ ] "Create Account" button
- [ ] Link to sign in page
- [ ] Terms and Privacy links in footer

**Test flow:**
1. Fill in email: `test@example.com`
2. Fill in password: `TestPass123!`
3. Fill in name: `Test User`
4. Click "Create Account"
5. Should redirect to `/verify` for email verification

**Note**: Currently using AWS Cognito - real email verification required

---

### ✉️ Step 3: Email Verification (/verify)
**What to test:**
- [ ] Verification code input (6 digits)
- [ ] "Verify Email" button
- [ ] Resend code option
- [ ] Clear instructions

**Test flow:**
1. Check email for verification code
2. Enter 6-digit code
3. Click "Verify Email"
4. Should redirect to `/welcome` (first-time users)

---

### 👋 Step 4: Welcome Flow (/welcome)
**What to test:**

**Screen 1:**
- [ ] Toolstoy logo at top
- [ ] "Welcome to Toolstoy" headline
- [ ] Subtext about products getting a voice
- [ ] "Let's Go" button
- [ ] "Skip setup" link

**Screen 2:**
- [ ] "Which product goes first?" headline
- [ ] Product URL input field
- [ ] "Start Building" button
- [ ] "I'll add it manually" link

**Test flow:**
1. Click "Let's Go" → Goes to screen 2
2. Enter product URL: `https://example.com/product`
3. Click "Start Building" → Redirects to `/dashboard/studio?url=...`
4. OR click "I'll add it manually" → Goes to `/dashboard/studio`

---

### 🎨 Step 5: Character Studio (/dashboard/studio)

#### Step Indicator
- [ ] 5 steps shown: Product → Character → Personality → Knowledge → Launch
- [ ] Current step highlighted
- [ ] Completed steps filled in
- [ ] Progress line between steps

---

#### 📦 Studio Step 1: Product
**What to test:**
- [ ] Product URL input field
- [ ] "Extract" button
- [ ] OR divider
- [ ] Image upload dropzone
- [ ] Product name field (pre-filled if URL provided)
- [ ] Description textarea
- [ ] "Next: Build the Character" button

**Test flow:**
1. Enter URL: `https://yourstore.com/products/test-product`
2. Click "Extract" (currently mock - no real extraction)
3. Edit product name and description
4. Click "Next" → Goes to Step 2

---

#### 🎭 Studio Step 2: Character
**What to test:**
- [ ] 4 character type cards:
  - The Expert
  - The Entertainer
  - The Advisor
  - The Enthusiast
- [ ] Each card has icon, title, description
- [ ] Selected card has dark border
- [ ] 8 vibe tags (Trustworthy, Playful, Premium, etc.)
- [ ] Multiple vibes can be selected
- [ ] Selected vibes have dark background
- [ ] "Back" and "Next: Personality" buttons

**Test flow:**
1. Click "The Expert" → Card highlights
2. Click different vibes → They toggle on/off
3. Select 2-3 vibes
4. Click "Next: Personality" → Goes to Step 3

---

#### 🗣️ Studio Step 3: Personality
**What to test:**
- [ ] Character name input (default: "Your Character Name")
- [ ] Signature phrase input with helper text
- [ ] Opening line textarea
- [ ] 3 personality dials:
  - Serious ↔ Playful
  - Formal ↔ Casual
  - Reserved ↔ Enthusiastic
- [ ] Sliders work smoothly
- [ ] "Back" and "Next: Knowledge Base" buttons

**Test flow:**
1. Change name to: `Max the Expert`
2. Add signature phrase: `Let me break it down for you.`
3. Add greeting: `Hey there! Ready to learn about this product?`
4. Adjust sliders to desired personality
5. Click "Next: Knowledge Base" → Goes to Step 4

---

#### 📚 Studio Step 4: Knowledge
**What to test:**
- [ ] Product URL input (pre-filled)
- [ ] "Generate Q&A" button
- [ ] 5 sample Q&A pairs displayed
- [ ] Each pair has checkbox, question, answer, edit button
- [ ] "Load all 30" link
- [ ] "+ Add custom Q&A pair" dashed box
- [ ] "Back" and "Next: Launch" buttons

**Test flow:**
1. Review the 5 sample Q&A pairs
2. Check/uncheck some pairs
3. Click edit icon on one pair (currently no edit modal)
4. Click "Next: Launch" → Goes to Step 5

---

#### 🚀 Studio Step 5: Launch
**What to test:**

**Before Generation:**
- [ ] "Your character is ready to generate" headline
- [ ] Summary table with 5 rows:
  - Product
  - Character Type
  - Character Name
  - Knowledge Base
  - Widget Layout
- [ ] Info box about what Bedrock will generate
- [ ] "Generate My Character" button (full width, bold)

**After Clicking Generate:**
- [ ] Digital Alchemy animation appears
- [ ] 4 progress steps shown:
  - Soul extraction
  - Knowledge base
  - Image generation
  - Creating animations
- [ ] Steps complete one by one (1.5s each)
- [ ] Progress indicators animate
- [ ] "Usually ready in a few minutes" message
- [ ] "Back to Dashboard" link

**Test flow:**
1. Review the summary
2. Click "Generate My Character"
3. Watch the generation animation (6 seconds total)
4. Click "Back to Dashboard" → Goes to `/dashboard`

---

### 📊 Step 6: Dashboard (/dashboard)
**What to test:**
- [ ] Sidebar with navigation
- [ ] Stats cards (Characters, Conversations, etc.)
- [ ] Character cards grid
- [ ] Recent activity feed
- [ ] Knowledge gaps alert (if any)
- [ ] All sidebar links work

**Expected behavior:**
- If 0 characters and onboarding not complete → Redirects to `/welcome`
- If characters exist → Shows dashboard
- Character cards show edit/delete options

---

## 🎯 Critical User Flow Checkpoints

### Happy Path (New User)
1. ✅ Homepage → Click "Get Started"
2. ✅ Sign Up → Create account
3. ✅ Verify Email → Enter code
4. ✅ Welcome Screen 1 → Click "Let's Go"
5. ✅ Welcome Screen 2 → Enter URL or skip
6. ✅ Studio Step 1 → Add product details
7. ✅ Studio Step 2 → Choose character type
8. ✅ Studio Step 3 → Name and personality
9. ✅ Studio Step 4 → Review knowledge
10. ✅ Studio Step 5 → Generate character
11. ✅ Dashboard → See new character

### Alternative Paths
- Skip onboarding → Goes directly to dashboard
- Manual product entry → No URL extraction
- Edit character later → `/dashboard/characters/:id/edit`

---

## 🐛 Known Issues to Watch For

1. **Authentication State**
   - Refresh during flow → Should maintain auth
   - Token expiry → Should redirect to sign in

2. **Form Validation**
   - Empty fields → Should show validation
   - Invalid URLs → Should handle gracefully

3. **Navigation**
   - Back button in browser → Should work
   - Direct URL access → Should check auth

4. **Mobile Responsiveness**
   - Studio steps → Should stack on mobile
   - Sidebar → Should become overlay
   - Touch targets → Should be 44×44px minimum

---

## 🧪 Quick Test Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Test Results Template

**Date**: ___________
**Tester**: ___________
**Browser**: ___________
**Device**: ___________

| Step | Status | Notes |
|------|--------|-------|
| Homepage | ⬜ Pass / ⬜ Fail | |
| Sign Up | ⬜ Pass / ⬜ Fail | |
| Verify Email | ⬜ Pass / ⬜ Fail | |
| Welcome Flow | ⬜ Pass / ⬜ Fail | |
| Studio Step 1 | ⬜ Pass / ⬜ Fail | |
| Studio Step 2 | ⬜ Pass / ⬜ Fail | |
| Studio Step 3 | ⬜ Pass / ⬜ Fail | |
| Studio Step 4 | ⬜ Pass / ⬜ Fail | |
| Studio Step 5 | ⬜ Pass / ⬜ Fail | |
| Dashboard | ⬜ Pass / ⬜ Fail | |

**Overall Experience**: ⬜ Excellent / ⬜ Good / ⬜ Needs Work

**Blockers Found**: ___________

**Suggestions**: ___________
