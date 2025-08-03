# 🎭 Automation Testing with Playwright

This project demonstrates end-to-end automation testing of a sample e-commerce site using **Playwright** with JavaScript. It follows industry-standard practices including the Page Object Model (POM), reusable test data, GitHub Actions CI integration, and comprehensive test coverage of different user roles.

---

## 📂 Folder Structure

Automation_Testing_with_Playwright/

│

├── .github/workflows/ # CI workflow for GitHub Actions

│ 
└── playwright.yml

│

├── page-objects/ # Page Object Model files

│ 
├── CartPage.js

│ 
├── CheckoutPage.js

│ 
├── LoginPage.js

│ 
└── ProductsPage.js

│

├── tests/ # Playwright test files

│ 
├── locked-user.spec.js

│ 
├── performance-user.spec.js

│ 
└── standard-user.spec.js

│

├── utils/ # Utility functions and test data

│ 
└── test-data.js

│

├── playwright.config.js # Playwright configuration

├── package.json # NPM scripts and dependencies

├── package-lock.json

└── README.md # Project documentation

---

## 🔧 Technologies & Tools Used

- Playwright
- JavaScript (ES6)
- Page Object Model (POM) Design
- GitHub Actions (CI Pipeline)
- Node.js
- npm

---

## 🚀 Getting Started

### 1. Clone the Repository

```

git clone https://github.com/HimaniDas/Automation_Testing_with_Playwright.git
cd Automation_Testing_with_Playwright

```
### 2. Install Dependencies

```

npm install

```
### 3. Run All Tests

```

npx playwright test

```
### 4. Open HTML Report

```

npx playwright show-report

```
---

## 🧪 Test Scenarios

| Test File                  | Description                                      |
|---------------------------|--------------------------------------------------|
| `locked-user.spec.js`     | Verifies login failure for a locked-out user     |
| `performance-user.spec.js`| Checks performance glitch user login and flow    |
| `standard-user.spec.js`   | Validates full purchase flow for standard user   |

---

## 📄 Page Object Model (POM)

Each page is abstracted into its own class for maintainability and reuse:

- `LoginPage.js`
- `ProductsPage.js`
- `CartPage.js`
- `CheckoutPage.js`

---

## 🧰 Utility

- `test-data.js`: Stores test users and static input data

---

## 🛠 NPM Scripts

| Command                         | Purpose                             |
|---------------------------------|-------------------------------------|
| `npx playwright test`           | Run all tests                       |
| `npx playwright show-report`    | View test report in browser         |
| `npx playwright test --headed`  | Run tests with browser UI           |
| `npx playwright test --debug`   | Run tests in debug mode             |

---

## 🔁 Continuous Integration

GitHub Actions is configured to run tests automatically on every push or pull request.

📁 `.github/workflows/playwright.yml`

---

## 📸 Reports

Playwright’s built-in HTML reporter is used for test results visualization.  
Optionally, anyone can integrate **Allure Report** if needed for reporting.
