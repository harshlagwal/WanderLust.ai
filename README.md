WanderLust.ai — AI Travel Itinerary Planner
A lightweight TypeScript React app that converts simple trip preferences into personalized, multi-day travel itineraries using Google Gemini (Gemini Developer API). The app shows day-by-day plans and maps POIs for an interactive planning experience while keeping the original data and features intact.

Features

AI Itinerary Generation: Uses geminiService.ts to call Google Gemini and produce structured, multi-day itineraries.
Responsive Travel Form: TravelForm.tsx collects destination, dates, travelers, interests, budget, and dietary preferences.
Map Integration: LeafletMap.tsx plots activities and hotels with interactive markers and routes.
Day-by-Day Display: ItineraryDisplay.tsx shows activities, times, descriptions, and suggested restaurants.
3D Visual Hero: Hero3D.tsx provides a 3D scene for visual polish.
Type Safety: types.ts stores shared interfaces for predictable data flows.
Exportable Output: Itineraries are available as readable JSON and text for export/copying.
Non-destructive: All original data and features from the downloaded Google AI Studio project are preserved.
Output

Personalized itinerary (multi-day JSON + readable text)
Interactive map markers and polylines for locations
POI details including approximate coordinates
Developer logs to aid prompt tuning and debugging
Quick Start

Requirements:

Node.js 18.x or 20.x recommended
npm (bundled with Node) or pnpm / yarn
A Google Gemini (Gemini Developer API) key from AI Studio
Clone or prepare your local copy (if not already):

# If you haven't initialized git:
git init
git add --all
git commit -m "Initial commit: Wanderlust AI Planner"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/<your-username>/wanderlust-ai-planner2.git

# Ensure branch name and push
git branch -M main
git push -u origin main

Install dependencies and run locally (PowerShell):
npm install
npm run dev

Open the app at the address Vite shows (usually http://localhost:5173).
Gemini API Key (required to generate itineraries)

Obtain a free API key at https://aistudio.google.com/app/apikey
On first load the app will prompt for your Gemini API key — paste it and click Save & Continue.
The app stores the key in localStorage under gemini_api_key for local development.
If you prefer environment variables instead, you can set VITE_GEMINI_API_KEY and I can show a minimal change to read import.meta.env.VITE_GEMINI_API_KEY (this is optional and does not change features).
Security note: Do not commit your API key to the repository. Use local storage or environment variables for dev only.

Project Structure (important files)

index.html — Vite entry HTML
index.tsx — React entry & mounting logic
App.tsx — top-level app, mounts TravelForm and handles generateItinerary
geminiService.ts — Gemini integration (creates GoogleGenAI and calls ai.models.generateContent)
components/* — TravelForm.tsx, ItineraryDisplay.tsx, LeafletMap.tsx, Hero3D.tsx, etc.
types.ts — shared TypeScript types
.gitignore — excludes node_modules and dist

How to Use:
Run the app locally.
Enter your Gemini API key in the modal.
Fill the travel form (destination, dates, travelers, interests, budget).
Click generate to receive a structured itinerary and see it on the map.

Troubleshooting

If npm install fails:
Confirm your Node and npm versions (node -v, npm -v).
Delete node_modules and run npm install again.
If a package compile step fails on Windows, ensure you have build tools (e.g., windows-build-tools) or use Node >=18.
If you see authentication errors while pushing to GitHub, create a Personal Access Token (PAT) and use it as the password for HTTPS pushes, or configure SSH keys and use the SSH remote.
If Gemini calls fail:
Check browser console logs for messages starting with Gemini API Error:.
Verify your API key and quota on AI Studio.

Contributing
Keep changes focused; avoid altering user-facing data/features without explicit agreement.
For feature branches:

git checkout -b feature/your-feature
# make changes, then:
git add .
git commit -m "feat: short description"
git push origin feature/your-feature

icense

Add your license here if you want (e.g., MIT). If you want I can add a standard LICENSE file.
Contact

Repo: https://github.com/<your-username>/wanderlust-ai-planner2
Maintainer: harshlagwal (replace with your preferred contact)
