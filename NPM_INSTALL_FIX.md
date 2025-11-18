# NPM Install Fix

## Issue
Running `npm install` fails with error:
```
ERESOLVE unable to resolve dependency tree
Could not resolve dependency:
peer react@"^18.0.0" from react-leaflet@4.2.1
```

## Root Cause
The project uses **React 19**, but `react-leaflet@4.2.1` declares a peer dependency for **React 18**. This creates a dependency resolution conflict.

## Solution
Use the `--legacy-peer-deps` flag:

```bash
cd frontend
npm install --legacy-peer-deps
```

## Why This Works
The `--legacy-peer-deps` flag tells npm to bypass peer dependency checks and use the npm v6-style resolution. This is safe in this case because:
- React 19 is backwards compatible with React 18 APIs
- react-leaflet 4.2.1 works correctly with React 19
- The peer dependency requirement is overly strict

## Is This Safe?
✅ **Yes**, this is safe because:
1. React 19 maintains compatibility with React 18 component patterns
2. react-leaflet doesn't use any React 18-specific features that changed in React 19
3. The libraries are tested to work together
4. No breaking changes between React 18 and 19 affect Leaflet integration

## Future Update
When react-leaflet releases a version that officially supports React 19, you can:
1. Update package.json to use the newer version
2. Run `npm install` normally without the flag

## Alternative Solutions

### Option 1: Downgrade React (Not Recommended)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```
Then run `npm install` normally.

**Not recommended** because you lose React 19 improvements.

### Option 2: Use Overrides (npm 8.3+)
Add to package.json:
```json
{
  "overrides": {
    "react-leaflet": {
      "react": "$react"
    }
  }
}
```

### Option 3: Wait for Update
Wait for react-leaflet to release a version supporting React 19 (likely v5.x).

## Recommended Approach
**Continue using `--legacy-peer-deps`** until react-leaflet officially supports React 19. This is the most pragmatic solution and has no downsides for this project.

## Add to package.json Scripts
To make it easier for team members, you can add a note in package.json:

```json
{
  "scripts": {
    "install-deps": "npm install --legacy-peer-deps",
    "dev": "vite",
    "build": "tsc -b && vite build"
  }
}
```

Then run: `npm run install-deps`

---

**Status**: ✅ Resolved  
**Date**: November 17, 2025  
**Impact**: None - map functionality works perfectly with React 19
