# Personal Expense Tracker

A Node.js, Express, MongoDB, and HTML expense tracker with charts, filtering, comparison tools, INR/USD display, and saving advice.
Live demo https://personal-expense-tracker-gauo.onrender.com

## Features

- Add, edit, and delete expenses
- Store expenses in MongoDB
- Filter by category and month
- Analyze spending with bar and pie charts
- Compare selected date/month spending with current filtered spending
- INR and USD currency display

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB on your computer.

3. Start the server:

```bash
npm start
```

4. Open:

```text
http://localhost:3000/HTML/personal_expense.html
```

## Environment

By default, the app uses:

```text
mongodb://127.0.0.1:27017/personal_expense_tracker
```

For deployment, set `MONGODB_URI` in your hosting platform.

## Copyright

© 2026 SHREYANSH. All rights reserved. SHREYANSH™
