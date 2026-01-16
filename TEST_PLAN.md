# Test Coverage Plan

## Goal: 100% Test Coverage

### Current Status
- ✅ Test infrastructure configured (Jest + React Testing Library)
- ✅ Test scripts added to package.json
- ✅ Coverage thresholds set to 100%
- ⏳ Comprehensive tests in progress

### Test Files Created
1. ✅ `src/lib/__tests__/contentful.test.ts` - Complete coverage for Contentful library functions
2. ✅ `src/components/__tests__/FieldRenderer.test.tsx` - Comprehensive component testing

### Remaining Tests Needed

#### Components
- [ ] `ContentPreviewToggle.test.tsx` - Preview/Debug toggle component
- [ ] `RichText.test.tsx` - Rich text rendering
- [ ] `ContentfulImage.test.tsx` - Image component with live updates
- [ ] `PreviewBanner.test.tsx` - Preview mode banner

#### Pages
- [ ] `page.test.tsx` - Homepage dashboard
- [ ] `content-type/[id]/page.test.tsx` - Content type listing page
- [ ] `entry/[id]/page.test.tsx` - Entry detail page
- [ ] `layout.test.tsx` - Root layout component

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# CI mode (used in GitHub Actions)
npm run test:ci
```

### Test Coverage Requirements

All files must achieve 100% coverage in:
- Branches
- Functions  
- Lines
- Statements

### Notes

#### Package Installation Issue
There appears to be a node_modules caching or installation issue. If tests fail to run:

1. **Complete clean reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verify jest installation:**
   ```bash
   npm ls jest jest-environment-jsdom
   ```

3. **If packages are missing, install explicitly:**
   ```bash
   npm install --save-dev \
     jest@29 \
     jest-environment-jsdom@29 \
     @testing-library/react@16 \
     @testing-library/jest-dom@6 \
     @testing-library/user-event@14 \
     @types/jest@29
   ```

#### Integration with CI/CD

See `.github/workflows/test.yml` for automated testing on every push and PR.

### Testing Best Practices

1. **Mock external dependencies** - Contentful client, Next.js components
2. **Test all code paths** - Especially conditional logic and error handling
3. **Use data-testid** - For reliable element selection
4. **Test user interactions** - Use @testing-library/user-event
5. **Snapshot testing** - For complex component output

### Coverage Report

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/lcov-report/index.html
```

This shows exactly which lines/branches need additional test coverage.
