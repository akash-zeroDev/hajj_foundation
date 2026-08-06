# Missing Backend Integrations Report

This document outlines the UI features that have been successfully built and implemented in the frontend Dashboard, but are currently relying on simulated UI logic or fallbacks because the required data/endpoints are not yet present in the backend. 

You can use this report to draft tasks for the backend engineering team.

---

## 1. Call Audio Recordings (Streaming/Playback)
**Frontend Status:** Fully designed. The Call History table features an inline expanding waveform player (accordion style), and the Call Details sidebar has a functional audio play/pause toggle with a progress bar.
**Backend Blockers:**
* The `GET /calls` endpoint returns a `recording_url` string, but there is no secure backend endpoint to actually fetch, stream, or sign the audio file for playback in the browser. 
* **Required Backend Addition:** Create a `GET /calls/:id/audio` endpoint that pipes the audio file from your storage provider (e.g., S3 or Telnyx) securely to the client, or returns a short-lived signed URL.
* *Current Frontend Behavior:* The UI visually simulates playback (progress bar moves) when the play button is clicked, but no actual audio is played.

## 2. Call Transcripts (Speaker Diarization)
**Frontend Status:** Fully designed. The Call Details sidebar has a dedicated "Transcript" box styled to show a back-and-forth conversation between speakers (e.g., `Agent:` and `Caller:`).
**Backend Blockers:**
* There is no endpoint to fetch the transcript chunks for a specific call. 
* **Required Backend Addition:** Create a `GET /calls/:id/transcript` endpoint that returns an array of transcript segments with `speaker`, `text`, and `timestamp` fields.
* *Current Frontend Behavior:* The UI checks for a `transcript` array on the call object. Since it doesn't exist, it displays a fallback message: *"No transcript available for this call."*

## 3. Team Member Phone Numbers
**Frontend Status:** The "Team" table includes a column specifically designated for the team member's assigned/direct phone number.
**Backend Blockers:**
* The user and membership tables do not currently expose a phone number. The `GET /organizations/:orgId/members` endpoint returns member objects, but they lack phone number fields.
* **Required Backend Addition:** Add a `phone` or `assigned_number` field to the user profile or organization membership schema, and include it in the member list response.
* *Current Frontend Behavior:* The frontend attempts to read `user.phone`. Since it is missing, it falls back to displaying `"N/A"`.

## 4. Server-Side Call Filtering (Optional but Recommended)
**Frontend Status:** The Call History table includes search functionality, date filtering, outcome filtering, and agent/user filtering.
**Backend Blockers:**
* Currently, the frontend requests all calls via `GET /calls?organizationId=...` and performs the filtering, sorting, and pagination locally in the browser (client-side).
* **Required Backend Addition:** As the call volume grows, this will become slow. The backend `GET /calls` endpoint should ideally accept query parameters like `?agent_id=...`, `?status=...`, `?start_date=...`, and `?search=...` to handle this at the database level.
* *Current Frontend Behavior:* Fully functional, but scales poorly for organizations with thousands of calls since it relies entirely on client-side array filtering.
