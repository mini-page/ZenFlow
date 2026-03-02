## 2026-03-02 - Reusable Accessible IconButton
**Learning:** Forcing `aria-label` as a required prop in the component interface guarantees accessibility compliance and is a powerful way to enforce standards when working with icon-only buttons. Using `React.forwardRef` ensures broader component compatibility.
**Action:** Always wrap generic UI components like `IconButton` in `React.forwardRef` and use strictly typed props for accessibility attributes.
