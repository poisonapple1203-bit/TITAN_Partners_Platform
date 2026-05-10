# TITAN Partners Platform UI/UX Guidelines

This document records the UI/UX design principles and lessons learned during the development of the TITAN Partners Platform. All future UI development and page creation must strictly adhere to these guidelines to ensure consistency.

## 1. Font Consistency (The `font-mono` Rule)
- **Issue:** Using `font-mono` for numbers (like dates, times, or profits) causes the zero (`0`) to render with a slash or dot, which breaks the visual consistency of the main application font.
- **Guideline:** Avoid using `font-mono` for standard numerical displays. Use `font-medium`, `font-semibold`, or `font-bold` instead. Only use `font-mono` if strictly necessary for very specific tabular data alignment where the slashed zero is acceptable.

## 2. Popup Positioning & Overflow Prevention
- **Issue:** Popups (like DatePickers) positioned with `absolute left-0` on elements located at the right edge of the screen will overflow outside the viewport.
- **Guideline:** Always check the relative position of the trigger element. If the element is on the right side of the layout, use `right-0` for the absolute popup to ensure it expands inward and stays within the screen bounds.

## 3. UI Interaction Consistency (Input Components)
- **Issue:** Using plain text `<input>` fields for complex data types (Date, Time) forces users to type manually, leading to poor UX and formatting errors.
- **Guideline:** Never use plain text inputs for Dates or Times. Always reuse the common UI dial/calendar components:
  - For Dates: Use the reusable `DayPicker` / `DatePicker` popup.
  - For Times: Use the `TimePicker` dial component (`src/components/TimePicker.tsx`).

## 4. Destructive Action Confirmations
- **Issue:** Immediate deletion without warning leads to accidental data loss.
- **Guideline:** Any destructive action (like deleting a record, ticker, or user) MUST trigger a confirmation modal before proceeding.
  - Use the globally available `ConfirmModal` component (`src/components/ConfirmModal.tsx`).
  - Maintain the TITAN dark theme styling for the modal (`bg-surface-dark`, `border-white/10`, `backdrop-blur-sm`).

## 5. Selection Indicators (Chips vs. Dots)
- **Issue:** Using traditional dot indicators (`•`) for selected items looks outdated compared to the premium dark UI.
- **Guideline:** Use the "Chip" highlight style (background color change, border highlight) instead of text-based dot indicators for representing active/selected states.
