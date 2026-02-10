# Video Player Application

A mobile-first video player web application built as part of the Dino Ventures Frontend Engineer assignment.

The application delivers a seamless video playback experience similar to YouTube Mobile, with gesture interactions, mini-player support, autoplay, and smooth UI transitions.

---

## Live Demo

Example: https://video-player.vercel.app

---

## GitHub Repository

Example: https://github.com/asmithachandinitg/video-player-assignment

---

## Tech Stack

- React.js
- React Router
- Framer Motion (animations & gestures)
- LocalStorage (playback persistence)
- Inline CSS styling
- HTML5 Video API

---

## Features Implemented

### Home Page – Video Feed
- Scrollable video feed grouped by categories
- Video cards include:
  - Thumbnail
  - Title
  - Duration badge
  - Category badge
- Show More / Show Less per category
- Responsive grid layout
- Smooth navigation to player

---

### Full Page Video Player
- Auto-play on open
- Resume playback from last watched time
- Custom controls:
  - Play / Pause
  - Skip +10s / −10s
  - Seekable progress bar
  - Current time / total duration
- Double-tap gesture:
  - Left → rewind 10s
  - Right → forward 10s

---

### Replay Logic
- When video completes:
  - Only replay button is shown
  - Skip controls hidden
- Prevents invalid seek at 100%

---

### Auto-Play Next (Bonus)
- Automatically plays next related video
- 2-second countdown overlay
- Cancel option available
- Triggers only on natural video completion

---

### In-Player Related Videos
- “More from Category” section
- Filters videos by same category
- Click → instantly switches playback
- Updates resume + storage state

---

### Drag-to-Minimize Mini Player
- Drag video downward to minimize
- Video docks to bottom mini-player
- Continues playback while browsing home

Mini-player includes:
- Video preview
- Title
- Play / Pause
- Close button
- Restore to full player on click

---

###  Playback Persistence
- Saves progress per video
- Restores on refresh/navigation
- Completed videos reset to replay state
- Prevents autoplay conflict on restore

---

### Visual & Gesture Enhancements
- Skip ripple animation feedback
- Hover & press button interactions
- Mobile-first responsive layout
- Smooth motion transitions (Framer Motion)

---

## Edge Cases Handled

- Resume vs completed playback conflict
- Autoplay triggering on restored videos
- Drag vs scroll gesture conflicts
- Double-tap timing detection
- Missing video state fallback
- Metadata loading guards
- Storage recovery on refresh

---

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/asmithachandinitg/video-player-assignment.git
cd video-player
