---
description: 'React development standards and best practices'
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js'
---

# React Development Instructions

Instructions for building high-quality React applications using modern best practices.

## Project Context

- React (functional components)
- TypeScript for type safety
- Component-based architecture

## Development Standards

### Architecture
- Use functional components only
- Prefer composition over inheritance
- Keep components small and reusable
- Separate UI, logic, and data concerns
- Organize by feature/domain, not by file type

### Components
- Use clear and descriptive naming
- One responsibility per component
- Extract reusable logic into custom hooks
- Avoid deeply nested component trees
- Use controlled components for forms

### Hooks
- Use built-in hooks properly (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Avoid unnecessary re-renders
- Keep dependency arrays correct
- Create custom hooks for reusable logic
- Do not call hooks conditionally

### State Management
- Use local state by default
- Lift state up only when necessary
- Use context for global/shared state
- Avoid prop drilling (use context or hooks)
- Consider external state libraries only if needed

### TypeScript
- Enable strict mode
- Define clear interfaces and types
- Avoid `any`
- Use type inference when possible
- Use type guards for safety

### Styling
- Use consistent styling approach (e.g., Tailwind or CSS Modules)
- Maintain responsive design
- Keep styles close to components
- Use semantic HTML
- Support dark mode if required

### Performance
- Use `React.memo` when needed
- Memoize expensive calculations (`useMemo`)
- Memoize callbacks (`useCallback`)
- Avoid unnecessary state updates
- Lazy load components when appropriate

### Data Handling
- Handle loading, error, and empty states
- Keep data fetching logic separated (hooks/services)
- Use async/await with proper error handling
- Avoid fetching inside deeply nested components

### Error Handling
- Use error boundaries where needed
- Handle UI fallback states gracefully
- Validate inputs before processing

## Implementation Process
1. Plan component structure
2. Define types and interfaces
3. Build reusable components
4. Extract logic into hooks
5. Handle states (loading, error, success)
6. Optimize performance
7. Ensure responsive design
8. Add tests
