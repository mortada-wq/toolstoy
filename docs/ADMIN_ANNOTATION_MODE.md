# Admin Annotation Mode

## Overview

Admin Annotation Mode is a powerful tool for administrators to annotate any element on any page in Toolstoy. Click on elements, add notes, and automatically copy detailed information to share with developers.

## Access

**Who can use it:**
- Super Admins
- Admins

**Not available for:**
- Assistants (read-only access)
- Regular users

## How to Use

### Activate Annotation Mode

**Method 1: Keyboard Shortcut**
- Press `Cmd + Shift + A` (Mac) or `Ctrl + Shift + A` (Windows/Linux)

**Method 2: Click Button**
- Look for the floating pencil icon button in the bottom-right corner
- Click to toggle annotation mode on/off

### When Active

1. **Visual Indicators:**
   - Red banner at top: "Annotation Mode Active - Click any element"
   - Cursor changes to crosshair
   - Elements get red dashed outline when you hover over them

2. **Hover Over Elements:**
   - Move your mouse over any element on the page
   - See a preview of the element description in bottom-right corner
   - Red dashed outline shows what you're targeting

3. **Click to Annotate:**
   - Click on any element to select it
   - Modal opens showing:
     - Element description (tag, id, classes, text)
     - Full CSS path to the element
     - Text area for your note

4. **Add Your Note:**
   - Type what needs to be changed, fixed, or noted
   - Examples:
     - "Change this button color to match brand"
     - "This text should be 14px not 16px"
     - "Add more padding here"
     - "This should link to /dashboard not /home"

5. **Save:**
   - Click "Save & Copy to Clipboard"
   - Annotation is automatically copied to your clipboard
   - Paste it directly into chat, Slack, or any communication tool

### Annotation Format

When you save an annotation, it's copied in this format:

```
📝 ANNOTATION
Page: /admin/playground
Element: <button.bg-[#1A1A1A]> "Generate Image"
Path: div.p-5 > div.space-y-4 > div.bg-white > button.bg-[#1A1A1A]
Note: Change button text to "Start Generation"
Time: 2/21/2026, 3:30:45 PM
```

## Features

### Recent Annotations Panel

- Shows your last 5 annotations in bottom-left corner
- Quick reference while working
- Click "Export JSON" to download all annotations

### Export Annotations

- Click "Export JSON" in the annotations panel
- Downloads a JSON file with all your annotations
- Includes full details: element paths, notes, timestamps, page URLs
- Share with developers or keep for reference

### Keyboard Shortcuts

- `Cmd/Ctrl + Shift + A` - Toggle annotation mode
- `Escape` - Exit annotation mode or cancel current annotation

## Use Cases

### 1. UI/UX Feedback
"This button needs more contrast"
"Spacing between these cards is too tight"

### 2. Bug Reports
"This link goes to wrong page"
"Text is cut off on mobile"

### 3. Content Changes
"Update this copy to match marketing guidelines"
"This heading should be H2 not H3"

### 4. Feature Requests
"Add a tooltip here explaining what this does"
"This should be a dropdown not radio buttons"

### 5. Design Tweaks
"Use primary color here instead of gray"
"Increase font size to 16px"

## Tips

1. **Be Specific:** The more detail in your note, the easier it is to implement
2. **One Issue Per Annotation:** Don't combine multiple changes in one note
3. **Include Context:** Mention why something should change if not obvious
4. **Use Screenshots:** Take a screenshot after annotating for visual reference
5. **Export Regularly:** Download your annotations at end of each session

## Technical Details

### What Gets Captured

- **Element Path:** Full CSS selector path to the element
- **Element Description:** Tag name, ID, classes, and visible text
- **Your Note:** Whatever you type
- **Page URL:** Current page path
- **Timestamp:** When annotation was created

### Where Data is Stored

- **Browser Memory:** Annotations stored in component state (not persisted)
- **Clipboard:** Each annotation copied automatically
- **Export File:** Download JSON for permanent storage
- **Console:** Each annotation logged to browser console

### Privacy & Security

- Annotations are NOT sent to any server
- Data stays in your browser until you export or refresh
- No tracking or analytics
- Only visible to you

## Troubleshooting

**Issue: Button not showing**
- Make sure you're signed in as Super Admin or Admin
- Assistants don't have access to this feature

**Issue: Can't click elements**
- Make sure annotation mode is active (red banner at top)
- Try clicking the element again
- Some elements may be covered by others - try clicking nearby

**Issue: Cursor not changing**
- Refresh the page
- Toggle annotation mode off and on again

**Issue: Annotations disappeared**
- Annotations are cleared on page refresh
- Export to JSON before refreshing
- Check browser console for logged annotations

**Issue: Can't exit annotation mode**
- Press `Escape` key
- Click the red X button in bottom-right
- Refresh the page as last resort

## Future Enhancements

- [ ] Persist annotations to database
- [ ] Share annotations with team
- [ ] Screenshot capture on annotation
- [ ] Annotation threads/comments
- [ ] Mark annotations as "done"
- [ ] Filter annotations by page/date
- [ ] Integration with issue tracking
- [ ] Annotation templates for common feedback

---

**Status:** Active
**Last Updated:** 2026-02-21
**Available To:** Super Admins, Admins
