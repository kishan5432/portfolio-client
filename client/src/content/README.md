# Content Templates

This directory contains information about the JSON content templates for the portfolio application.

## Location

The actual JSON files are located in `/public/content/` to be served as static assets by Vite:

- `projects.json` - Project portfolio data
- `certificates.json` - Certifications and achievements
- `timeline.json` - Career timeline and education
- `skills.json` - Technical skills and proficiencies

## Structure

Each JSON file follows the API response format:

```json
{
  "data": [...], // Array of items
  "success": true,
  "message": "Items retrieved successfully"
}
```

## Usage

The TanStack Query hooks automatically fall back to these local JSON files when the API is unavailable:

```typescript
// Will try API first, then fall back to local JSON
const { data: projects } = useProjects();
const { data: certificates } = useCertificates();
const { data: timeline } = useTimelineItems();
const { data: skills } = useSkills();
```

## Benefits

1. **Development**: Work on frontend without running backend
2. **Offline**: App remains functional when backend is down
3. **Testing**: Reliable data for UI testing and demos
4. **Quick Edits**: Update content by editing JSON files directly

## Demo

Visit `/demo` route to see the content loading system in action.
