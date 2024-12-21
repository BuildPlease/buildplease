# Lerna Publish Modes Cheat Sheet

This table summarizes the three main `lerna publish` modes, explaining their behaviors, use cases, and drawbacks.

---

| Mode                      | Behavior                                                                                                   | Use Case                                                                                        | Drawbacks                                                                                          |
|---------------------------|-----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **from-package** ✅ (Current)           | Publishes only packages that have a newer version or dependencies updated in the registry.                | Ideal for automated CI/CD workflows where versions are already bumped manually.                | No Git tags are created automatically; relies on versions already set in `package.json`.            |
| **from-git** | Publishes packages explicitly tagged in Git.                                                              | Suitable for scenarios where you want manual control over tagging and then publish the tags.   | Requires Git tags to be pushed manually before publishing.                                           |
| **default**                | Runs `lerna version` internally, bumps versions, creates Git tags, and then publishes packages.           | Best for simpler workflows where automatic versioning and tagging are preferred.               | Bumps all versions—even those without changes—if dependencies are linked, potentially causing drift.|

---

## Mode Details and Commands

### 1. from-package (Automated Publishing, No Tags) ✅ (Current Setup)

```bash
npx lerna publish from-package --yes
```

- Checks for unpublished versions in the registry and publishes them.
- **Tags**: No Git tags are created by this mode.
- **Use Case**: CI/CD pipelines where versions are already manually updated.

---

### 2. from-git (Tag-Based Publishing)

```bash
npx lerna publish from-git --yes
```

- Publishes packages that are explicitly **tagged** in Git.
- **Tags Format**: `@scope/package@1.0.0`
  - Example: `@nidavellirx/meowv-webkit@1.0.0`
- **Use Case**: Manual control over versioning and tagging before publishing.

---

### 3. Default Mode (Auto-Versioning + Tags)

```bash
npx lerna publish --yes
```

- Automatically **bumps versions**, **creates Git tags**, and **publishes** packages.
- **Tags Format**: `v1.0.0` or `@scope/package@1.0.0`
- **Use Case**: Simple workflows where automated versioning and tagging are preferred.
- **Drawback**: May cause **version drift** if dependencies are linked.

---