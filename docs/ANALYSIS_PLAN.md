# 🍛 Kaprao52 - World-Class Overhaul Plan

## 🎯 Vision
Transform Kaprao52 from a functional but "choppy" app into a premium, fluid, and robust "World-Class" food ordering platform.

## 🕵️ Phase 1: Deep Discovery (Technical Audit)
- **Navigation Flow Audit**: Identify the exact cause of "navigation freeze".
  - Check `Suspense` boundaries in `router.tsx`.
  - Analyze `LoadingScreen` and `GlobalLoadingBar` interactions.
  - Review `AnimatePresence` usage for performance bottlenecks.
- **Boot Sequence Optimization**:
  - Refactor `AuthProvider.tsx` to parallelize initialization (LIFF, Supabase, LocalStorage).
  - Move non-critical sync logic out of the initial mount.
- **Service Worker & PWA Audit**:
  - Ensure consistent chunk caching to avoid "white screen" on version updates.
- **UI/UX Audit (Premium Polish)**:
  - Verify compliance with Web Interface Guidelines.
  - Check accessibility (focus states, screen readers).
  - Identify components missing "Micro-animations" (hover/active states).

## 🛠️ Phase 2: Core Engineering (Stability)
- **Instant Navigation**:
  - Implement **Pre-fetching** for main tabs.
  - Use **Skeleton Screens** more effectively to reduce "white-out" time.
  - Fix Z-index stacking order for modals and navigation.
- **Error Resilience**:
  - Implement a graceful fallback for `ChunkLoadError`.
  - Add "Retry" functionality to the `ErrorBoundary`.

## 🎨 Phase 3: World-Class Polish (Design)
- **Rich Aesthetics**:
  - Apply vibrant gradients and consistent glassmorphism.
  - Standardize 4XL border radii for a modern "soft" look.
  - Implement shared element transitions for menu-to-modal animations.
- **Micro-interactions**:
  - Add Haptic feedback (native feel) for all primary actions.
  - Implement magnetic button effects for CTA elements.

## 🤖 Orchestration Matrix
- `project-planner`: Managing the roadmap and tasks.
- `explorer-agent`: Deep dive into file dependencies and state flows.
- `performance-optimizer`: Profiling script execution and bundle sizes.
- `frontend-specialist`: Crafting the premium UI and animations.
- `security-auditor`: Verifying Auth and RLS safety.
- `test-engineer`: Running unit and E2E tests for verification.

---

## 🛑 Socratic Checkpoint
1. **Target Device**: Is this primarily used inside the LINE in-app browser (LIFF) or as a standalone PWA?
2. **Current Feedback**: When the app "freezes", is the "Refresh" button in the Top Nav still clickable, or is the entire browser tab unresponsive?
