# Building an AI-Powered-Finance-Tracker

## Initial Code

### Setting Up Workspace for the Project Discussed in the Session

**Session Initial Code:** Building an AI-Powered Personal Finance Tracker

[Download Project Files](AI-Based-Finance-Tracker-Initial-Codes.zip)

---

### Instructions

- Download the folder containing both frontend and backend
- Open it in **VS Code**
- Start building your project

---

# AI-Powered Finance Tracker

---

## Table of Contents

1. [Problem Identification](about:blank#1-problem-identification)
2. [What Are We Solving?](about:blank#2-what-are-we-solving)
3. [Project Introduction](about:blank#3-project-introduction)
4. [Application Flow](about:blank#4-application-flow)
5. [Main Functionalities](about:blank#5-main-functionalities)
6. [Advantages](about:blank#6-advantages)
7. [Prerequisites](about:blank#7-prerequisites)
8. [Tech Stack](about:blank#8-tech-stack)
9. [Project Setup – From Scratch](about:blank#9-project-setup--from-scratch)
10. [Initial Code Structure (Skeleton)](about:blank#10-initial-code-structure-skeleton)
11. [Backend Implementation – Step-by-Step](about:blank#11-backend-implementation--step-by-step)
12. [Frontend Implementation – Step-by-Step](about:blank#12-frontend-implementation--step-by-step)
13. [Running the Complete Project](about:blank#13-running-the-complete-project)

---

## Problem Identification

 **The Current Problem in Personal Finance Management**

Every month, millions of people open their bank app, stare at a long list of debits and credits, and have no idea where their money actually went. The existing support system for personal finance is fundamentally broken:

- **No idea where money goes** – People know their salary credited and their balance dropped, but cannot quickly see how much went to food, rent, transport, or entertainment.
- **Overspending goes undetected** – Without a category-level limit, people only realise they overspent after the month ends, when it is too late to course-correct.
- **Budgeting feels manual and tedious** – Maintaining a spreadsheet of income and expenses for every transaction is time-consuming and easy to abandon after a few weeks.
- **No personalized advice** – Generic finance blogs cannot tell you that *your* food spending is 38% of expenses or that *your* discretionary categories are growing month over month.
- **Reports are buried in statements** – Bank statements show transactions, not trends. Users cannot easily see month-over-month income vs expense or category breakdowns.
- **No spending forecast** – People want to know “based on how I have been spending, will I exceed my budget this month?”, but their banking app cannot answer that.

### The Impact

These problems combine into a frustrating monthly experience. The user has no clarity on category-level spending, gets no early warning when budgets are about to break, cannot prove savings progress, and ends up making financial decisions based on a feeling rather than data – even though every transaction has already been recorded somewhere.

---

##  What Are We Solving?

We are building an **AI-powered personal finance platform** that turns raw income and expense entries into structured insights, predictions, and downloadable reports.

| Problem | Our Solution |
| --- | --- |
| Don’t know where money goes | Categorised transactions with charts and breakdowns |
| Overspending goes undetected | Monthly + per-category budgets with progress bars and overspend alerts |
| Budgeting feels manual | One-form CRUD with filters, search, sorting, and pagination |
| No personalized advice | AI insights generated from the user’s actual transactions |
| Reports are buried | Monthly report page with PDF export via PDFKit |
| No spending forecast | Average-based prediction with confidence and budget-risk flag |

Specifically, we are solving:

1. **Authenticated, per-user finance data** – Using JWT + bcrypt so every user’s transactions and budgets are isolated and secure.
2. **Structured transaction management** – Income/expense entries with category, payment method, and date, plus filters, search, sort, and pagination.
3. **Monthly and category budgets** – A single budget document per user with a global limit and an array of category limits.
4. **AI insights with a heuristic fallback** – Using OpenAI (`gpt-4o-mini`) when an API key is configured, and falling back to a deterministic rules-based engine otherwise so the feature always works.
5. **Spending prediction** – Averaging monthly expense buckets to forecast expense, attaching a confidence score and a budget-risk flag.
6. **Monthly reports + PDF export** – A reports page that summarises a chosen month and streams a downloadable PDF using PDFKit.

---

##  Project Introduction

**AI-Powered-Finance-Tracker** is a full-stack web application built on the MERN stack (MongoDB, Express, React, Node.js). A user signs up, records their income and expenses, sets a monthly and category-wise budget, and receives AI-powered insights, a spending prediction, and a downloadable monthly report.

Under the hood, two analysis layers power the application:

- **`financeAnalyzer.js`** computes deterministic summaries – totals, savings, category breakdown, monthly trend, predicted expense, and rule-based insights. This is always run.
- **`aiService.js`** wraps the analyzer. When `OPENAI_API_KEY` is configured, it forwards the analysis to OpenAI (`gpt-4o-mini`) and returns AI-generated insight strings. When the key is missing or the call fails, it falls back to the heuristic insights so the user always sees recommendations.

All transactions and budgets are persisted in **MongoDB** (Atlas or local), and authenticated requests are protected by a JWT middleware that scopes every query to the logged-in user.

There is full authentication in this app – every API route except `/auth/signup` and `/auth/login` requires a Bearer token, and the React app stores the token plus the user object in `localStorage`.

---

## Application Flow

```
User signs up / logs in
        ↓
Frontend (React + Redux) stores JWT in localStorage
        ↓
Axios interceptor attaches "Authorization: Bearer <token>" on every request
        ↓
Backend (Express) authMiddleware verifies the JWT and sets req.userId
        ↓
User adds income/expense transactions (CRUD)
User sets monthly budget + category limits
        ↓
Dashboard:
    → GET /api/dashboard/summary
    → financeAnalyzer.summarizeTransactions(transactions, budget)
    → totals, savings, budgetRemaining, monthlyTrend, categoryBreakdown,
      recentTransactions
    → Recharts renders Line, Pie, and Bar charts

Insights:
    → POST /api/ai/insights
    → If OPENAI_API_KEY present: OpenAI gpt-4o-mini returns JSON array of insights
    → Else: heuristic insights from analyzeFinance() are returned
    → POST /api/ai/predict
    → Average of monthly expense buckets + confidence + budgetRisk flag

Reports:
    → GET /api/reports/monthly?year=YYYY&month=MM
    → JSON: period, totals, categoryBreakdown, monthlyTrend, transactions
    → GET /api/reports/monthly?year=YYYY&month=MM&format=pdf
    → PDFKit streams a finance-report-YYYY-MM.pdf attachment

Profile:
    → Update name/email, change password, view account stats
```

---

## Main Functionalities

### Authentication and Account Management

The user signs up with name, email, and password. The backend hashes the password with bcrypt, persists the user, and signs a JWT with the user `id` as payload. Subsequent requests attach the token and pass through `protect` middleware, which decodes it and sets `req.userId`. The user can update profile details, change password, and fetch account statistics.

### Transaction CRUD with Filters and Pagination

Users record income and expenses with title, amount, category, payment method, description, and transaction date. The transactions list supports query parameters for `page`, `limit`, `category`, `type`, `search` (regex on title/category/description), and `sort` (`latest`, `oldest`, `amount_desc`, `amount_asc`). The response includes a pagination block with `total` and `pages`.

### Budget with Category Limits

The budget for a user is a single document keyed by `userId` (unique). It stores `monthlyBudget` and an array of `categoryBudgets` (`{ category, limit }`). The Budget page combines the saved budget with the live dashboard summary to show, per category, how much has been spent, what percent of the limit is used, and a progress bar. An overspending alert appears when remaining budget drops below zero.

### Dashboard with Summary, Trend, and Recent Activity

The dashboard fetches `/api/dashboard/summary` once on mount. The response contains `totalIncome`, `totalExpense`, `savings`, `budgetRemaining`, `monthlyTrend`, `categoryBreakdown`, and the five most recent transactions. The page renders four `SummaryCard` tiles, a Recharts `LineChart` for monthly spend trend, a `PieChart` for category distribution, a `BarChart` for income vs expense, and a recent-transactions list.

### AI Insights with Deterministic Fallback

The Insights page calls `POST /api/ai/insights`. The backend always runs `analyzeFinance()` first to produce a deterministic summary plus heuristic insights and recommendations. If `OPENAI_API_KEY` is configured, it sends the analysis to OpenAI (`gpt-4o-mini`) with a prompt requesting “only a JSON array of strings” and returns those. If the key is missing or the call fails, it returns the heuristic insights. The UI shows a small badge revealing the active provider (`openai` or `heuristic`).

### Spending Prediction

`POST /api/ai/predict` computes the average expense across the monthly buckets in `monthlyTrend`, returns it as `predictedExpense`, computes a `confidence` between 55–95 based on transaction count, and flags `budgetRisk: true` when the prediction exceeds the configured monthly budget.

### Reports and PDF Export

The Reports page picks a year/month, fetches `/api/reports/monthly`, and renders a four-card summary, a Recharts `BarChart` of category amounts, and the period’s transactions. Clicking *Export PDF* calls the same endpoint with `format=pdf`, streams a PDF generated via PDFKit, and downloads it as `finance-report-YYYY-MM.pdf`.

---

##  Advantages

- **Per-user data isolation** – Every controller uses `userId: req.userId` in queries, so a user can never read or modify another user’s transactions or budget.
- **Indexed queries** – Compound indexes on `Transaction` (`userId + transactionDate`, `userId + type`, `userId + category`) keep the dashboard and filters fast as transactions grow.
- **Insights always work** – The heuristic engine in `financeAnalyzer.js` returns useful, concrete insights with zero external dependencies; OpenAI is purely an upgrade when a key is configured.
- **Single source of truth for analytics** – `summarizeTransactions()` is reused by `dashboardController`, `reportController`, and `authController.getAccountStats`, ensuring consistent numbers across pages.
- **Server-streamed PDFs** – Reports are generated with PDFKit on the server and piped directly to the response, avoiding heavy client-side libraries.
- **Resilient auth UX** – On any 401 response the Axios interceptor clears the token and user from `localStorage`; the `refreshUser` thunk re-validates the token on app load.
- **Hardened HTTP layer** – `helmet`, CORS with an allowed-origins whitelist, and `express-rate-limit` (300 requests / 15 minutes) protect the API out of the box.
- **No vendor lock-in for AI** – The OpenAI integration is one self-contained service. Switching providers means editing `aiService.js` only; the rest of the codebase consumes provider-agnostic JSON.

---

## Prerequisites – Software & Accounts

### Software to Install

- **Node.js v18 or later** – [nodejs.org](https://nodejs.org/)
- **Git** – [git-scm.com](https://git-scm.com/)
- **VS Code** (recommended) – [code.visualstudio.com](https://code.visualstudio.com/)

### Accounts to Create (All Free)

| Service | Where | What For |
| --- | --- | --- |
| **MongoDB Atlas** | [cloud.mongodb.com](https://cloud.mongodb.com/) | Database – free M0 tier (or local MongoDB) |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/) | AI insights – optional; heuristic engine works without it |

### Prior Knowledge Expected

- Basic JavaScript and Node.js (ES Modules)
- React fundamentals (components, hooks, props)
- Redux Toolkit (`createSlice`, `createAsyncThunk`)
- REST APIs and JWT-based auth
- MongoDB / Mongoose schemas and queries

---

##  Tech Stack

### Backend (Server)

| Technology | Purpose |
| --- | --- |
| **Node.js (ES Modules)** | JavaScript runtime; `"type": "module"` in `package.json` |
| **Express.js** | Web framework for building REST APIs |
| **MongoDB + Mongoose** | NoSQL database + ODM for User, Transaction, Budget |
| **bcrypt** | Password hashing in `User` model |
| **jsonwebtoken** | JWT generation and verification |
| **helmet** | Secure HTTP headers |
| **express-rate-limit** | 300 requests / 15-minute rolling window |
| **cors** | Origin whitelist for the React dev server |
| **OpenAI SDK** | AI insight generation (`gpt-4o-mini`) |
| **PDFKit** | Server-side PDF generation for monthly reports |
| **dotenv** | Environment variable management |

### Frontend (Client)

| Technology | Purpose |
| --- | --- |
| **React 18** | UI library – component-based architecture |
| **Vite** | Fast build tool and development server |
| **React Router v6** | Client-side routing with `ProtectedRoute` and nested layout |
| **Redux Toolkit + react-redux** | Global state via `auth`, `transactions`, `budget`, `insights` slices |
| **Axios** | HTTP client with request/response interceptors |
| **Recharts** | Line, Bar, and Pie charts on Dashboard and Reports |
| **Tailwind CSS** | Utility-first styling with custom `primary`/`secondary`/`accent` colors |

---

##  Project Setup – From Scratch



### Step 1 : Set Up MongoDB

1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com/) (or run MongoDB locally on `mongodb://localhost:27017/ai-finance-tracker`)
2. Create a **Free Cluster** (M0 tier)
3. Go to **Database Access** → Add a database user with a username and password
4. Go to **Network Access** → Add IP → **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Connect** on your cluster → **Drivers** → Copy the connection string
6. Replace `<password>` in the URI with your actual database user password

### Step 2: Get Your OpenAI API Key (Optional)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Create an API key and copy it
3. Without this key, the app will automatically use the heuristic insight engine in `financeAnalyzer.js`

---

##  Server & Client Initialization

### Server Setup

```bash
cd server
npm init -y
```

**Install all backend dependencies:**

```bash
npm install express mongoose dotenv cors helmet express-rate-limit jsonwebtoken bcrypt multer axios openai pdfkit
```

**Install dev dependencies:**

```bash
npm install --save-dev nodemon jest supertest
```

Update the `scripts` section in `server/package.json` and set `"type": "module"`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles"
  }
}
```

> **AI-related package:**
> 
> 
> ```bash
> npm install openai   # OpenAI SDK – powers AI-generated finance insights (gpt-4o-mini)
> ```
> 
> One SDK, one model ID – `gpt-4o-mini` is used for insight generation. Prediction is computed locally in `financeAnalyzer.js` without an external call.
> 

### Client Setup

```bash
cd client
npm create vite@latest . -- --template react
npm install axios react-router-dom @reduxjs/toolkit react-redux recharts tailwindcss postcss autoprefixer
```

---

##  Initial Folder Structure

After setup, the project structure looks like this:

```
AI-Based-Finance-Tracker/
│
├── server/                              ← Backend (Node.js + Express, ES Modules)
│   ├── config/                          ← Reserved for future config helpers
│   ├── models/
│   │   ├── User.js                      ← name, email, hashed password, matchPassword()
│   │   ├── Transaction.js               ← userId, type, title, amount, category, paymentMethod, date
│   │   └── Budget.js                    ← userId (unique), monthlyBudget, categoryBudgets[]
│   ├── controllers/
│   │   ├── authController.js            ← signup, login, getMe, updateProfile, changePassword, getAccountStats
│   │   ├── transactionController.js     ← create, list (filters/sort/pagination), update, delete
│   │   ├── budgetController.js          ← set, get, update
│   │   ├── aiController.js              ← generateInsights, predictSpending
│   │   ├── dashboardController.js       ← getDashboardSummary
│   │   └── reportController.js          ← getMonthlyReport (JSON or PDF)
│   ├── middleware/
│   │   └── authMiddleware.js            ← protect: verifies JWT, sets req.userId
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   ├── financeAnalyzer.js           ← summarizeTransactions, analyzeFinance, getMonthRange
│   │   └── aiService.js                 ← generateAIInsights (OpenAI + heuristic fallback), predictExpense
│   ├── utils/                           ← Reserved for future helpers
│   ├── app.js                           ← Express app, middleware, routes, error handler
│   ├── server.js                        ← dotenv + connectDB() + app.listen
│   └── .env                             ← MONGODB_URI, JWT_SECRET, OPENAI_API_KEY, etc.
│
└── client/                              ← Frontend (React + Vite + Redux Toolkit)
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx                ← Email/password form, dispatches loginUser
    │   │   ├── Signup.jsx               ← Name/email/password/confirm, dispatches signupUser
    │   │   ├── Dashboard.jsx            ← Summary cards + Line/Pie/Bar charts + recent
    │   │   ├── Transactions.jsx         ← CRUD modal, filters, search, sort, pagination
    │   │   ├── Budget.jsx               ← Monthly limit + per-category limits with progress bars
    │   │   ├── Insights.jsx             ← AI insights + spending prediction
    │   │   ├── Reports.jsx              ← Month picker, charts, PDF export
    │   │   └── Profile.jsx              ← Update profile, change password, account stats
    │   ├── components/
    │   │   ├── layout/Layout.jsx        ← Sidebar + Navbar + Outlet
    │   │   ├── layout/Sidebar.jsx       ← Nav links + Logout
    │   │   ├── layout/Navbar.jsx        ← User name/email
    │   │   └── dashboard/SummaryCard.jsx← Tinted summary tile
    │   ├── redux/
    │   │   ├── store.js                 ← configureStore({ auth, transactions, budget, insights })
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       ├── transactionSlice.js
    │   │       ├── budgetSlice.js
    │   │       └── insightSlice.js
    │   ├── services/
    │   │   ├── api.js                   ← Axios instance with token interceptor
    │   │   ├── authService.js
    │   │   ├── transactionService.js
    │   │   ├── budgetService.js
    │   │   ├── dashboardService.js
    │   │   ├── reportService.js         ← Includes blob-based PDF download helper
    │   │   └── aiService.js
    │   ├── utils/format.js              ← formatCurrency, formatDate, categories, paymentMethods
    │   ├── App.jsx                      ← Router + ProtectedRoute + Layout
    │   ├── App.css
    │   ├── index.css                    ← Tailwind directives
    │   └── main.jsx                     ← ReactDOM + <Provider store>
    ├── index.html
    ├── vite.config.js                   ← Proxy /api → http://localhost:5000
    ├── tailwind.config.js               ← Custom primary/secondary/accent colors
    └── postcss.config.cjs               ← tailwindcss + autoprefixer
```

---

##  Environment Variables

Create the file `server/.env` with the following content:

```
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ai-finance-tracker?retryWrites=true&w=majority

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d

# Optional – when present, AI insights are generated by OpenAI; otherwise heuristics are used
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> Never commit `.env` to Git. Add it to `.gitignore`.
> 

---

##  API Endpoints Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create user, hash password, return JWT |
| POST | `/api/auth/login` | Validate credentials, return JWT |
| GET | `/api/auth/me` | Return the authenticated user (protected) |
| PUT | `/api/auth/profile` | Update name and email (protected) |
| PUT | `/api/auth/password` | Change password (protected) |
| GET | `/api/auth/stats` | Account statistics (protected) |
| POST | `/api/transactions` | Create a transaction (protected) |
| GET | `/api/transactions` | List with filters, sort, pagination (protected) |
| PUT | `/api/transactions/:id` | Update a transaction (protected) |
| DELETE | `/api/transactions/:id` | Delete a transaction (protected) |
| POST | `/api/budget` | Set / upsert the budget (protected) |
| GET | `/api/budget` | Get the budget (protected) |
| PUT | `/api/budget` | Update the budget (protected) |
| POST | `/api/ai/insights` | AI insights with heuristic fallback (protected) |
| POST | `/api/ai/predict` | Spending prediction (protected) |
| GET | `/api/dashboard/summary` | Totals + trend + breakdown + recent (protected) |
| GET | `/api/reports/monthly` | JSON or PDF report for `?year=&month=` (protected) |
| GET | `/health` | Health check endpoint |

---


##  Backend Step 1 – Database Connection

**File: `server/app.js`** (excerpt)

**What we’re implementing:** A reusable async function that connects Mongoose to MongoDB. If the connection fails, the error is rethrown so the bootstrap script in `server.js` can exit the process.

```jsx
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance-tracker');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};
```

**Line-by-line explanation:**
• `mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance-tracker')` computes the connection using the `.env` URI and falls back to a local MongoDB instance on the default port. The database name is embedded directly inside the URI (`/ai-finance-tracker`).

• `console.log('MongoDB connected')` logs a success message so the developer can confirm the server is connected to the correct MongoDB cluster.

• `throw err` rethrows the database connection error to the caller (`startServer` in `server.js`), which then exits with `process.exit(1)`. Since the application depends entirely on the database, the server should not continue running without a successful connection.

---

##  Backend Step 2 – AI Service Initialization

**File: `server/services/aiService.js`**

**What we’re implementing:** A service that wraps the OpenAI SDK and gracefully falls back to the heuristic analyzer when no API key is configured. The OpenAI client is created on-demand inside the request handler, not at module load, so the server still boots without the key.

```jsx
import OpenAI from 'openai';
import { analyzeFinance } from './financeAnalyzer.js';

const hasOpenAIKey = () => {
  const key = process.env.OPENAI_API_KEY;
  return key && key !== 'your_openai_api_key_here';
};

export const generateAIInsights = async ({ transactions, budget }) => {
  const analysis = analyzeFinance({ transactions, budget });

  if (!hasOpenAIKey()) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = [
      'Generate concise personal finance insights for this user.',
      'Return only a JSON array of strings.',
      JSON.stringify({
        totalIncome: analysis.totalIncome,
        totalExpense: analysis.totalExpense,
        savings: analysis.savings,
        budgetRemaining: analysis.budgetRemaining,
        categoryBreakdown: analysis.categoryBreakdown,
        monthlyTrend: analysis.monthlyTrend
      })
    ].join('\n');

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const text = response.choices?.[0]?.message?.content || '[]';
    const insights = JSON.parse(text);

    return {
      provider: 'openai',
      insights: Array.isArray(insights) && insights.length ? insights : analysis.insights
    };
  } catch (error) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }
};

export const predictExpense = async ({ transactions, budget }) => {
  const analysis = analyzeFinance({ transactions, budget });

  return {
    predictedExpense: analysis.predictedExpense,
    confidence: analysis.confidence,
    budgetRisk: analysis.monthlyBudget > 0 ? analysis.predictedExpense > analysis.monthlyBudget : false,
    recommendations: analysis.recommendations
  };
};
```

**Key implementation points:**
• `hasOpenAIKey()` rejects both an unset key and the placeholder `your_openai_api_key_here`, so a forgotten `.env` value never sends a doomed request.

• `analyzeFinance()` is always called first. Its `insights` and `recommendations` act as the deterministic safety net for the `heuristic` branch.

• The prompt embeds **only summary numbers** — not raw transactions — so the OpenAI request stays short, cheap, and avoids leaking individual entries.

• `temperature: 0.4` keeps the output focused, while `'Return only a JSON array of strings.'` minimises the need for regex extraction because the SDK returns only the JSON array text.

• Any thrown error inside the `try` block (network, parsing, or rate-limit failure) is silently caught and the heuristic insights are returned instead. The user always receives useful output.

• `predictExpense` is completely local — it reuses `analyzeFinance()` and adds a `budgetRisk` boolean derived from `predictedExpense > monthlyBudget`.

---

##  Backend Step 3 – User Model

**File: `server/models/User.js`**

**What we’re implementing:** The Mongoose schema for an authenticated user. Passwords are hashed via a `pre('save')` hook and never returned by default (`select: false`).

```jsx
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.updatedAt = new Date();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
```

**Key implementation points:**
• `select: false` on `password` prevents Mongoose from returning the password field during normal `find` queries. The `login` controller explicitly opts into retrieving it using `.select('+password')`.

• `pre('save')` hashes the password only when the `password` field was modified, so updating fields like `name` or `email` does not re-hash an already encrypted value.

• `matchPassword` is implemented as an instance method that wraps `bcrypt.compare`, keeping password comparison logic inside the model instead of duplicating it across controllers.

• `email` validation combines both `match` (regex validation) and `unique` with a dedicated database index. Database-level uniqueness remains the final source of truth.

• `lowercase: true` normalises stored email values so entries like `User@Example.com` and `user@example.com` are treated as the same account and cannot both register.

---

##  Backend Step 4 – Transaction & Budget Models

**File: `server/models/Transaction.js`**

```jsx
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please select a category']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other'],
    default: 'card'
  },
  description: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Transaction', transactionSchema);
```

**File: `server/models/Budget.js`**

```jsx
import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  monthlyBudget: {
    type: Number,
    required: [true, 'Please provide a monthly budget'],
    min: [0, 'Budget cannot be negative']
  },
  categoryBudgets: [
    {
      category: {
        type: String,
        required: true
      },
      limit: {
        type: Number,
        required: true,
        min: [0, 'Limit cannot be negative']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

budgetSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
```

**Key implementation points:**
• `Transaction.userId` is an ObjectId reference to `User` and is included in every compound index, ensuring that all user-scoped queries in the application can efficiently use indexed lookups.

• `type` is a strict enum with only two allowed values: `income` or `expense`. The summary logic inside `financeAnalyzer.js` depends on these exact spellings.

• `paymentMethod` uses an enum that mirrors the `paymentMethods` array exported to the frontend from `client/src/utils/format.js`. Adding a new payment method requires updates in both the backend schema and frontend utility.

• `Budget.userId` is marked as `unique`, guaranteeing exactly one budget document per user. This allows `setBudget` to use `findOneAndUpdate` with `upsert: true` instead of maintaining separate create and update controllers.

• `categoryBudgets` is an array of subdocuments following the structure `{ category, limit }`. The Budget page directly renders this array to display per-category spending limits.

---

##  Backend Step 5 – Auth Middleware

**File: `server/middleware/authMiddleware.js`**

**What we’re implementing:** A JWT-verifying middleware that runs before every protected route. It extracts the `Bearer` token from the `Authorization` header, verifies it with `JWT_SECRET`, and attaches the decoded user id to `req.userId`.

```jsx
import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
```

**Key implementation points:**
• `authHeader.split(' ')` expects the exact format `Bearer <token>`. Any variation — such as `Token`, a missing space, or a missing scheme — immediately results in a `401 Unauthorized` response.

• `process.env.JWT_SECRET` is validated inside the `try` block so that a server misconfiguration still returns a generic `401` response without exposing internal error details to the client.

• `req.userId = decoded.id` stores only the authenticated user’s ID on the request object. Downstream controllers rely exclusively on `req.userId` for query scoping and avoid using `req.user`, which would otherwise require an additional database lookup.

• Both authentication failure paths return identical error messages, preventing attackers from distinguishing between cases like “missing token”, “invalid token”, or “expired token”.

---

## Backend Step 6 – Auth Controller

**File: `server/controllers/authController.js`**

**What we’re implementing:** Six handlers covering signup, login, me, profile update, password change, and account statistics. Tokens are signed with the user `id` only; profile responses go through a `sanitizeUser` helper that strips the password and Mongoose internals.

```jsx
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), email: normalizedEmail, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and a new password of at least 6 characters'
      });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAccountStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    res.status(200).json({
      success: true,
      data: {
        transactionCount: transactions.length,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.savings,
        budgetRemaining: summary.budgetRemaining
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Key implementation points:**
• `generateToken` signs only the user `id`. Including the email inside the token is unnecessary because authenticated flows can always retrieve the latest user data from the database when required.

• `signup` applies `email.trim().toLowerCase()` before both the duplicate-email check and the user creation step, matching the schema-level `lowercase: true` behaviour. Without this normalisation, differently cased emails could bypass the unique constraint.

• `login` uses `.select('+password')` because the `User` schema hides the password field by default with `select: false`. Without explicitly selecting it, `matchPassword` would receive `undefined`.

• `updateProfile` checks for email conflicts against all users except the currently authenticated user using `_id: { $ne: req.userId }`. This prevents false-positive duplicate errors when a user saves their existing email again.

• `changePassword` assigns the new value using `user.password = newPassword` and then calls `user.save()`. The schema’s `pre('save')` hook automatically hashes the updated password before persistence.

• `getAccountStats` reuses `summarizeTransactions`, ensuring the Profile page displays the exact same financial totals and calculations as the Dashboard.

---

## Backend Step 7 – Transaction Controller

**File: `server/controllers/transactionController.js`**

**What we’re implementing:** Four handlers for create, list (with filters/sort/pagination), update, and delete. Every query is scoped by `userId: req.userId`.

```jsx
import Transaction from '../models/Transaction.js';

export const createTransaction = async (req, res) => {
  try {
    const { type, title, amount, category, paymentMethod, description, transactionDate } = req.body;

    if (!type || !title?.trim() || amount === undefined || Number(amount) <= 0 || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, title, amount greater than zero and category'
      });
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      paymentMethod,
      description: description?.trim(),
      transactionDate: transactionDate || new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search, sort = 'latest' } = req.query;

    const query = { userId: req.userId };
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortMap = {
      latest: { transactionDate: -1 },
      oldest: { transactionDate: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 }
    };

    const transactions = await Transaction.find(query)
      .sort(sortMap[sort] || sortMap.latest)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, amount, category, paymentMethod, description, transactionDate } = req.body;

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be income or expense'
      });
    }

    const update = {
      ...(type && { type }),
      ...(title !== undefined && { title: title.trim() }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(category !== undefined && { category: category.trim() }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(transactionDate !== undefined && { transactionDate })
    };

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Key implementation points:**

• The query object is built dynamically, meaning only filter keys actually present in `req.query` are added. This prevents invalid filters like `{ category: undefined }` from accidentally matching no documents.

• `search` performs a case-insensitive regex match across `title`, `category`, and `description` using `$or`. For a single-user finance tracker, regex-based search is sufficient, though a text index would be more appropriate at larger scale.

• `sortMap` explicitly whitelists only four valid sorting modes. Any unknown value automatically falls back to `latest`, preventing raw user input from being injected directly into the MongoDB sort clause.

• `findOneAndUpdate({ _id: id, userId: req.userId })` and `findOneAndDelete({ _id: id, userId: req.userId })` enforce resource ownership within the query itself, ensuring users cannot modify or delete transactions belonging to another account even if they know the document ID.

• `runValidators: true` forces Mongoose to reapply schema validation rules such as enums and minimum values during updates, since `findOneAndUpdate` does not run validators by default.



---

##  Backend Step 8 – Budget Controller

**File: `server/controllers/budgetController.js`**

```jsx
import Budget from '../models/Budget.js';

export const setBudget = async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;

    if (monthlyBudget === undefined || monthlyBudget === null || monthlyBudget === '' || Number(monthlyBudget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly budget'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId },
      {
        monthlyBudget: Number(monthlyBudget),
        categoryBudgets: categoryBudgets || [],
        updatedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.userId });

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: {
          monthlyBudget: 0,
          categoryBudgets: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;

    if (monthlyBudget === undefined || monthlyBudget === null || monthlyBudget === '' || Number(monthlyBudget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly budget'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId },
      {
        monthlyBudget: Number(monthlyBudget),
        categoryBudgets,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Key implementation points:**
• `setBudget` uses `upsert: true` together with `setDefaultsOnInsert: true`, allowing the same handler to either create a new budget document or update an existing one. The frontend therefore does not need separate POST and PUT flows for the initial save.

• `getBudget` returns a default object `{ monthlyBudget: 0, categoryBudgets: [] }` when no budget exists instead of responding with `404`. This allows the frontend to render the budget form immediately without maintaining a separate “no budget found” UI state.

• Validation explicitly rejects `''` (empty string) in addition to `undefined`, `null`, and negative values because HTML number inputs often submit values as strings.

• `updateBudget` intentionally does not use upsert behaviour. If no budget document exists yet, it returns `404`, which aligns with the intended PUT semantics since budget creation is already handled separately by `setBudget`.

---

## Backend Step 9 – Finance Analyzer Service

**File: `server/services/financeAnalyzer.js`**

**What we’re implementing:** A pure-function analytics service that turns an array of transactions and an optional budget into totals, savings, breakdowns, trends, predictions, and human-readable insights. Used by Dashboard, Reports, AI Insights, and Account Stats.

```jsx
const currency = (value) => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

export const summarizeTransactions = (transactions = [], budget = null) => {
  const income = transactions.filter((item) => item.type === 'income');
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalExpense;
  const monthlyBudget = budget?.monthlyBudget || 0;
  const budgetRemaining = monthlyBudget ? monthlyBudget - totalExpense : savings;

  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyBuckets = new Map();
  transactions.forEach((item) => {
    const date = new Date(item.transactionDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyBuckets.get(key) || { month: key, income: 0, expense: 0 };
    current[item.type] += item.amount;
    monthlyBuckets.set(key, current);
  });

  const monthlyTrend = Array.from(monthlyBuckets.values()).sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalIncome,
    totalExpense,
    savings,
    budgetRemaining,
    monthlyBudget,
    categoryBreakdown,
    monthlyTrend
  };
};

export const analyzeFinance = ({ transactions = [], budget = null }) => {
  const summary = summarizeTransactions(transactions, budget);
  const expenses = transactions.filter((item) => item.type === 'expense');
  const insights = [];
  const recommendations = [];

  if (!transactions.length) {
    return {
      ...summary,
      insights: [
        'Add your first income and expense entries to unlock personalized finance insights.',
        'Set a monthly budget so FinTrack can flag overspending before it becomes a problem.'
      ],
      recommendations: ['Start with recurring expenses like rent, subscriptions, groceries, and transport.'],
      predictedExpense: 0,
      confidence: 0
    };
  }

  const topCategory = summary.categoryBreakdown[0];
  if (topCategory) {
    const share = summary.totalExpense ? Math.round((topCategory.amount / summary.totalExpense) * 100) : 0;
    insights.push(`${topCategory.category} is your biggest spending category at${currency(topCategory.amount)} (${share}% of expenses).`);
  }

  if (summary.monthlyBudget > 0) {
    const used = Math.round((summary.totalExpense / summary.monthlyBudget) * 100);
    if (used >= 100) {
      insights.push(`You have exceeded your monthly budget by${currency(Math.abs(summary.budgetRemaining))}.`);
    } else if (used >= 80) {
      insights.push(`You have used${used}% of your monthly budget. Slow down discretionary spending this month.`);
    } else {
      insights.push(`You still have${currency(summary.budgetRemaining)} available from this month's budget.`);
    }
  }

  budget?.categoryBudgets?.forEach((item) => {
    const spent = summary.categoryBreakdown.find((entry) => entry.category === item.category)?.amount || 0;
    if (item.limit > 0 && spent > item.limit) {
      insights.push(`${item.category} spending exceeded its category budget by${currency(spent - item.limit)}.`);
    }
  });

  if (summary.savings < 0) {
    insights.push(`Your expenses are higher than income by${currency(Math.abs(summary.savings))}.`);
    recommendations.push('Prioritize reducing flexible categories until monthly cash flow is positive again.');
  } else {
    recommendations.push(`You are currently saving${currency(summary.savings)}. Consider moving part of it to a dedicated savings goal.`);
  }

  if (topCategory) {
    recommendations.push(`A 10% reduction in${topCategory.category} could save about${currency(topCategory.amount * 0.1)} this period.`);
  }

  const monthlyExpenses = summary.monthlyTrend.map((item) => item.expense);
  const predictedExpense = monthlyExpenses.length
    ? Math.round(monthlyExpenses.reduce((sum, item) => sum + item, 0) / monthlyExpenses.length)
    : Math.round(summary.totalExpense);
  const confidence = Math.min(95, Math.max(55, 60 + expenses.length * 3));

  return {
    ...summary,
    insights,
    recommendations,
    predictedExpense,
    confidence
  };
};
```

**Key implementation points:**
• `summarizeTransactions` is a pure function — it accepts transaction data, computes results, and returns derived values without performing any database operations. This makes it reusable across the Dashboard, Reports, and Account Stats pages without duplicating logic.

• `categoryBreakdown` is sorted in descending order by amount, ensuring that `categoryBreakdown[0]` always represents the highest spending category used inside `analyzeFinance`.

• The `monthlyBuckets` Map uses keys in the `YYYY-MM` format, which sort lexically in the same order as chronological dates. This allows `Array.from(...).sort(...)` to produce a correctly ordered monthly timeline without custom date parsing.

• `confidence = Math.min(95, Math.max(55, 60 + expenses.length * 3))` clamps the confidence score between `55` and `95`. Every expense entry increases confidence by `3` percentage points until the upper limit is reached.

• `predictedExpense` is calculated as the mean of all monthly expense buckets. With only one month of data, it equals the current month’s expense total; with multiple months, it smooths short-term volatility.

• The empty-transactions branch returns onboarding-focused guidance instead of showing only zero-value statistics, ensuring that a brand-new user immediately receives actionable suggestions and useful UI feedback.

---

## Backend Step 10 – AI, Dashboard, and Report Controllers

**File: `server/controllers/aiController.js`**

```jsx
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { generateAIInsights, predictExpense } from '../services/aiService.js';

export const generateInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const result = await generateAIInsights({ transactions, budget });

    res.status(200).json({
      success: true,
      data: result,
      insights: result.insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const predictSpending = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const prediction = await predictExpense({ transactions, budget });

    res.status(200).json({
      success: true,
      data: prediction,
      prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**File: `server/controllers/dashboardController.js`**

```jsx
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ transactionDate: -1 });
    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.savings,
        budgetRemaining: summary.budgetRemaining,
        monthlyTrend: summary.monthlyTrend,
        categoryBreakdown: summary.categoryBreakdown,
        recentTransactions: transactions.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**File: `server/controllers/reportController.js`**

```jsx
import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

const formatCurrency = (value) => `INR${Math.round(value || 0).toLocaleString('en-IN')}`;

export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const transactions = await Transaction.find({
      userId: req.userId,
      transactionDate: { $gte: start, $lt: end }
    }).sort({ transactionDate: -1 });
    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    const report = {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      savings: summary.savings,
      budgetRemaining: summary.budgetRemaining,
      categoryBreakdown: summary.categoryBreakdown,
      monthlyTrend: summary.monthlyTrend,
      transactions
    };

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=finance-report-${report.period}.pdf`);

      const doc = new PDFDocument({ margin: 48 });
      doc.pipe(res);
      doc.fontSize(22).text('FinTrack Monthly Report');
      doc.moveDown(0.5).fontSize(12).text(`Period:${report.period}`);
      doc.moveDown();
      doc.fontSize(14).text(`Income:${formatCurrency(report.totalIncome)}`);
      doc.text(`Expense:${formatCurrency(report.totalExpense)}`);
      doc.text(`Savings:${formatCurrency(report.savings)}`);
      doc.text(`Budget Remaining:${formatCurrency(report.budgetRemaining)}`);
      doc.moveDown().fontSize(16).text('Category Breakdown');
      report.categoryBreakdown.forEach((item) => {
        doc.fontSize(11).text(`${item.category}:${formatCurrency(item.amount)}`);
      });
      doc.moveDown().fontSize(16).text('Transactions');
      report.transactions.slice(0, 40).forEach((item) => {
        doc.fontSize(10).text(`${new Date(item.transactionDate).toLocaleDateString('en-IN')} |${item.type} |${item.title} |${formatCurrency(item.amount)}`);
      });
      doc.end();
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Key implementation points:**
• The AI controller acts as a thin orchestration layer, while all business logic resides inside `aiService.js`. This separation makes it possible to swap AI providers without modifying controller code.

• `getDashboardSummary` already retrieves transactions sorted in descending order by `transactionDate`, so `transactions.slice(0, 5)` can directly generate the “recent transactions” list without performing an additional database query.

• The reports feature uses a single endpoint with a `format` query parameter to support both JSON and PDF responses. In the PDF branch, the server sets `Content-Disposition: attachment` and streams a PDFKit document directly into the HTTP response.

• The transaction date filter `{ $gte: start, $lt: end }` uses an exclusive upper bound, correctly excluding transactions from the first day of the next month while still including all data within the intended range.

• The generated PDF intentionally includes a maximum of 40 transactions to keep the exported file lightweight and fast to download, while the complete dataset remains available through the JSON response.

---

##  Backend Step 11 – Routes

**File: `server/routes/authRoutes.js`**

```jsx
import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAccountStats
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/stats', protect, getAccountStats);

export default router;
```

**File: `server/routes/transactionRoutes.js`**

```jsx
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
```

**File: `server/routes/budgetRoutes.js`**

```jsx
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { setBudget, getBudget, updateBudget } from '../controllers/budgetController.js';

const router = express.Router();

router.use(protect);

router.post('/', setBudget);
router.get('/', getBudget);
router.put('/', updateBudget);

export default router;
```

**File: `server/routes/aiRoutes.js`**

```jsx
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateInsights, predictSpending } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);

router.post('/insights', generateInsights);
router.post('/predict', predictSpending);

export default router;
```

**File: `server/routes/dashboardRoutes.js`**

```jsx
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);
router.get('/summary', getDashboardSummary);

export default router;
```

**File: `server/routes/reportRoutes.js`**

```jsx
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMonthlyReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);
router.get('/monthly', getMonthlyReport);

export default router;
```

**Key implementation points:**
• `router.use(protect)` is applied once at the router level for modules like transactions, budget, ai, dashboard, and report, ensuring that every route handler inside those files is protected by default. This prevents newly added routes from accidentally bypassing authentication.

• `authRoutes.js` is the only router that contains both public routes (`signup`, `login`) and protected routes, so the `protect` middleware is attached individually at the route level instead of globally for the entire router.

• All routers are mounted in `app.js` using `/api/<resource>` prefixes. The project does not include an API version segment because it operates as a single deployment surface rather than maintaining multiple public API versions.

---

##  Backend Step 12 – Server Entry Point

**File: `server/app.js`**

```jsx
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Middleware
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance-tracker');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

export default app;
```

**File: `server/server.js`**

```jsx
import app, { connectDB } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
```

**Key implementation points:**
• `app.js` exports both `app` and `connectDB`, while `server.js` acts as the application bootstrap layer. This separation allows automated tests to import the Express app directly without establishing a real MongoDB connection.

• `helmet()` is registered before other middleware so that security-related HTTP headers are attached to every response, even when a later middleware terminates the request early.

• The CORS configuration accepts requests that do not include an `origin` header — such as server-to-server calls, mobile apps, or `curl` requests — while rejecting browser origins that are not part of the configured whitelist.

• The rate limiter permits up to `300` requests per `15-minute` window for each IP address and uses the modern `RateLimit-*` response headers. Legacy `X-RateLimit-*` headers are intentionally disabled.

• The global error handler uses the four-parameter middleware signature `(err, req, res, next)`. Express recognises middleware with this arity as error-handling middleware and forwards thrown or propagated errors to it automatically.

• `connectDB()` executes before `app.listen`, ensuring that the server only begins accepting incoming traffic after a successful Mongoose database connection has been established.

---


## Frontend Step 1 – Vite & Tailwind Configuration

**File: `client/vite.config.js`**

**What we’re implementing:** The Vite dev server proxy – all `/api` requests from the React app are forwarded to the Express backend on port 5000, so the browser never hits CORS.

```jsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

**File: `client/tailwind.config.js`**

```jsx
/**@type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#3b82f6',
        accent: '#10b981'
      }
    },
  },
  plugins: [],
}
```

**File: `client/postcss.config.cjs`**

```jsx
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
```

**File: `client/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

**Key implementation points:**
• The development proxy transparently forwards `/api/*` requests to the backend running on port `5000`, allowing calls like `axios.get('/api/dashboard/summary')` to work without configuring an absolute API base URL during local development.

• `changeOrigin: true` modifies the outgoing `Host` header so it matches the target backend server, ensuring compatibility with the backend’s configured CORS allowlist.

• Tailwind’s custom theme colors — `primary` (`#1f2937` slate), `secondary` (`#3b82f6` blue), and `accent` (`#10b981` emerald) — are reused consistently across components such as Login, Signup, Sidebar, and shared action buttons to maintain a unified design system.

• `postcss.config.cjs` uses the `.cjs` extension because the client project is configured for ES modules using `"type": "module"` in `package.json`. PostCSS configuration loading still works more reliably with CommonJS modules in this setup.

---

##  Frontend Step 2 – Axios Instance and Services

**File: `client/src/services/api.js`**

**What we’re implementing:** The shared Axios instance. A request interceptor injects the JWT from `localStorage` on every call, and a response interceptor clears the token on any 401 response.

```jsx
import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    return Promise.reject(error)
  }
)

export default API
```

**File: `client/src/services/authService.js`**

```jsx
import API from './api'

export const signup = (data) => API.post('/auth/signup', data)
export const login = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')
export const updateProfile = (data) => API.put('/auth/profile', data)
export const changePassword = (data) => API.put('/auth/password', data)
export const getAccountStats = () => API.get('/auth/stats')
```

**File: `client/src/services/transactionService.js`**

```jsx
import API from './api'

export const getTransactions = (params) => API.get('/transactions', { params })
export const createTransaction = (data) => API.post('/transactions', data)
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`)
```

**File: `client/src/services/budgetService.js`**

```jsx
import API from './api'

export const getBudget = () => API.get('/budget')
export const setBudget = (data) => API.post('/budget', data)
export const updateBudget = (data) => API.put('/budget', data)
```

**File: `client/src/services/dashboardService.js`**

```jsx
import API from './api'

export const getDashboardSummary = () => API.get('/dashboard/summary')
```

**File: `client/src/services/reportService.js`**

```jsx
import API from './api'

export const getMonthlyReport = (params) => API.get('/reports/monthly', { params })
export const downloadMonthlyReport = (params) => API.get('/reports/monthly', {
  params: { ...params, format: 'pdf' },
  responseType: 'blob'
})
```

**File: `client/src/services/aiService.js`**

```jsx
import API from './api'

export const generateInsights = () => API.post('/ai/insights')
export const predictSpending = () => API.post('/ai/predict')
```

**Key implementation points:**
• `baseURL` is read from `import.meta.env.VITE_API_URL` first, allowing production builds to target a deployed backend without requiring code changes, while the Vite development server continues to use `/api` proxying locally.

• The request interceptor reads the authentication token from `localStorage` on every request instead of caching it in memory. This ensures that login or logout actions immediately affect all subsequent API calls without requiring a page refresh.

• `downloadMonthlyReport` sets `responseType: 'blob'` so the PDF response is handled as binary data. The Reports page then wraps the response inside a `Blob` object and programmatically triggers a browser file download.

• The `401 Unauthorized` response handler only removes the stored authentication token and does not perform navigation directly. Route redirection is instead handled centrally by `App.jsx` through `ProtectedRoute`, which reacts to the updated `isAuthenticated` state during the next render cycle.

---

## Frontend Step 3 – Redux Store and Slices

**File: `client/src/redux/store.js`**

```jsx
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import budgetReducer from './slices/budgetSlice'
import insightReducer from './slices/insightSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
    insights: insightReducer
  }
})

export default store
```

**File: `client/src/redux/slices/authSlice.js`**

```jsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authService from '../../services/authService'

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong'

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.login(data)
    return response.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const signupUser = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.signup(data)
    return response.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const refreshUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getMe()
    return response.data.user
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(data)
    return response.data.user
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

const storedUser = localStorage.getItem('user')
const parseStoredUser = () => {
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const initialState = {
  user: parseStoredUser(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: '',
  isAuthenticated: !!localStorage.getItem('token')
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token)
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    updateUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(refreshUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
  }
})

export const { setLoading, setUser, updateUser, logout } = authSlice.actions
export default authSlice.reducer
```

**Key implementation points:**
• `parseStoredUser` acts as a defensive utility helper. If the `localStorage.user` value has been corrupted or manually tampered with and is no longer valid JSON, the invalid entry is removed so the auth slice can initialise safely without crashing.

• `initialState.isAuthenticated = !!localStorage.getItem('token')` hydrates the authentication state synchronously from `localStorage`, preventing `ProtectedRoute` from briefly flashing the login page during a hard refresh while `refreshUser` is still pending.

• `loginUser.fulfilled` and `signupUser.fulfilled` both persist the authenticated user object and token back into `localStorage`, ensuring the Redux slice state and persistent browser storage remain consistent.

• `refreshUser.rejected` serves as the fallback path for expired or invalid authentication tokens. It clears both the Redux auth state and the corresponding `localStorage` entries, forcing the application back into an unauthenticated state and redirecting the user to `/login`.

---

##  Frontend Step 3 – Transaction, Budget & Insight Slices

**File: `client/src/redux/slices/transactionSlice.js`**

```jsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as transactionService from '../../services/transactionService'

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong'

export const fetchTransactions = createAsyncThunk('transactions/fetch', async (params, { rejectWithValue }) => {
  try {
    const response = await transactionService.getTransactions(params)
    return response.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const saveTransaction = createAsyncThunk('transactions/save', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = id
      ? await transactionService.updateTransaction(id, data)
      : await transactionService.createTransaction(data)
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const removeTransactionById = createAsyncThunk('transactions/delete', async (id, { rejectWithValue }) => {
  try {
    await transactionService.deleteTransaction(id)
    return id
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

const initialState = {
  transactions: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 1 },
  loading: false,
  error: '',
  filters: {},
  selectedTransaction: null
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    setSelectedTransaction: (state, action) => {
      state.selectedTransaction = action.payload
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(t => t._id === action.payload._id)
      if (index !== -1) {
        state.transactions[index] = action.payload
      }
    },
    removeTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t._id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(saveTransaction.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(saveTransaction.fulfilled, (state, action) => {
        state.loading = false
        const index = state.transactions.findIndex(t => t._id === action.payload._id)
        if (index === -1) state.transactions.unshift(action.payload)
        else state.transactions[index] = action.payload
      })
      .addCase(saveTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(removeTransactionById.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t._id !== action.payload)
      })
  }
})

export const {
  setTransactions,
  setLoading,
  setFilters,
  setSelectedTransaction,
  addTransaction,
  updateTransaction,
  removeTransaction
} = transactionSlice.actions
export default transactionSlice.reducer
```

**File: `client/src/redux/slices/budgetSlice.js`**

```jsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as budgetService from '../../services/budgetService'

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong'

export const fetchBudget = createAsyncThunk('budget/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await budgetService.getBudget()
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const saveBudget = createAsyncThunk('budget/save', async (data, { rejectWithValue }) => {
  try {
    const response = await budgetService.setBudget(data)
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

const initialState = {
  monthlyBudget: 0,
  categories: [],
  remaining: 0,
  loading: false,
  error: ''
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget: (state, action) => {
      state.monthlyBudget = action.payload.monthlyBudget
      state.categories = action.payload.categoryBudgets || []
      state.remaining = action.payload.monthlyBudget
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    updateRemaining: (state, action) => {
      state.remaining = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false
        state.monthlyBudget = action.payload.monthlyBudget || 0
        state.categories = action.payload.categoryBudgets || []
        state.remaining = action.payload.monthlyBudget || 0
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(saveBudget.fulfilled, (state, action) => {
        state.monthlyBudget = action.payload.monthlyBudget || 0
        state.categories = action.payload.categoryBudgets || []
        state.remaining = action.payload.monthlyBudget || 0
      })
  }
})

export const { setBudget, setLoading, updateRemaining } = budgetSlice.actions
export default budgetSlice.reducer
```

**File: `client/src/redux/slices/insightSlice.js`**

```jsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as aiService from '../../services/aiService'

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong'

export const fetchInsights = createAsyncThunk('insights/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await aiService.generateInsights()
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const fetchPrediction = createAsyncThunk('insights/predict', async (_, { rejectWithValue }) => {
  try {
    const response = await aiService.predictSpending()
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

const initialState = {
  insights: [],
  predictions: {},
  provider: '',
  loading: false,
  error: ''
}

const insightSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    setInsights: (state, action) => {
      state.insights = action.payload
    },
    setPredictions: (state, action) => {
      state.predictions = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false
        state.insights = action.payload.insights || []
        state.provider = action.payload.provider || 'heuristic'
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchPrediction.fulfilled, (state, action) => {
        state.predictions = action.payload
      })
  }
})

export const { setInsights, setPredictions, setLoading } = insightSlice.actions
export default insightSlice.reducer
```

**Key implementation points:**
• `saveTransaction` is implemented as a single thunk that handles both transaction creation and updates. It branches internally based on whether an `id` exists, while both backend endpoints return the same response structure, allowing the reducer to perform a straightforward upsert into the local transaction list.

• `fetchTransactions.fulfilled` updates both the `transactions` array and the `pagination` metadata from the same API payload, ensuring that filtering, sorting, and page navigation remain fully synchronised with the server state and table footer controls.

• `budgetSlice.fulfilled` initially derives `remaining` directly from `monthlyBudget`. The Budget page later recalculates the real remaining amount using live expense totals, so the slice value functions only as an initial baseline.

• `insightSlice` stores the `provider` separately from the generated insights, enabling the UI to display a badge indicating whether the insights were produced by OpenAI or by the fallback heuristic engine.

---

##  Frontend Step 4 – main.jsx and App.jsx

**File: `client/src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './redux/store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
```

**File: `client/src/App.jsx`**

```jsx
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Insights from './pages/Insights'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

// Layout
import Layout from './components/layout/Layout'

// Redux
import { useDispatch, useSelector } from 'react-redux'
import { refreshUser } from './redux/slices/authSlice'

function ProtectedRoute() {
  const { isAuthenticated } = useSelector(state => state.auth)

  return isAuthenticated ?<Outlet /> :<Navigate to="/login" replace />
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) return

    dispatch(refreshUser())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
```

**Key implementation points:**
• The component hierarchy places `<Provider store={store}>` at the top level, with `<Router>` rendered inside `App`. This ensures the Redux store is available to every component that may dispatch actions or read state, including `ProtectedRoute`, which depends on `state.auth.isAuthenticated`.

• `ProtectedRoute` uses `Outlet` so React Router can render the nested `<Layout>` component along with the currently matched child page. If the user is unauthenticated, they are redirected to `/login` using `replace`, preventing the browser back button from returning them to a protected route.

• The routing structure uses two-level nesting: `<ProtectedRoute>` → `<Layout>` → page components. This allows the shared `Layout` UI — including the sidebar, navbar, and outlet container — to render only once across all authenticated pages.

• The `useEffect` inside `App` dispatches `refreshUser` only when a token already exists in `localStorage`. If the refresh request fails, the auth slice clears the invalid token, causing the next render cycle to redirect the user back to `/login`.

• `<Route path="*" element={<Navigate to="/dashboard" replace />} />` acts as the final catch-all route. Any unknown URL is redirected to `/dashboard`, which itself redirects unauthenticated users to `/login` through the protected routing layer.

---


## Frontend Step 5 – Layout, Sidebar, Navbar, SummaryCard

**File: `client/src/components/layout/Layout.jsx`**

```jsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
```

**File: `client/src/components/layout/Sidebar.jsx`**

```jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'

function Sidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Budget', path: '/budget' },
    { label: 'Insights', path: '/insights' },
    { label: 'Reports', path: '/reports' },
    { label: 'Profile', path: '/profile' }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-primary text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">FinTrack</h1>
        <p className="text-sm text-gray-400">AI Finance Tracker</p>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded-lg mb-2 transition-colors${
              isActive(item.path)
                ? 'bg-secondary text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
```

**File: `client/src/components/layout/Navbar.jsx`**

```jsx
import { useSelector } from 'react-redux'

function Navbar() {
  const { user } = useSelector(state => state.auth)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Finance Dashboard</h2>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
```

**File: `client/src/components/dashboard/SummaryCard.jsx`**

```jsx
function SummaryCard({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-900',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    red: 'border-rose-200 bg-rose-50 text-rose-900',
    blue: 'border-sky-200 bg-sky-50 text-sky-900'
  }

  return (
    <div className={`rounded-lg border p-5 shadow-sm${tones[tone]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  )
}

export default SummaryCard
```

**Key implementation points:**
• `Layout` uses a flexbox-based shell where the sidebar remains fixed at `w-64`, the right-side content column expands flexibly, and the `<main>` section becomes scrollable. This prevents large charts or long tables from pushing the sidebar off-screen.

• `Sidebar.handleLogout` dispatches the `logout` action before triggering navigation. Clearing authentication state and `localStorage` first ensures `ProtectedRoute` cannot briefly re-render protected content during the route transition.

• `Sidebar.isActive` compares the complete `pathname` value instead of using partial matching, preventing unrelated nested routes from accidentally receiving active-link styling.

• `SummaryCard.tones` acts as a small whitelist mapping for supported color variants. When `tone={undefined}` is passed, the component automatically falls back to the default `slate` theme through the function parameter default `tone = 'slate'`.

---

## Frontend Step 6 – Login and Signup Pages

**File: `client/src/pages/Login.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../redux/slices/authSlice'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { loading } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await dispatch(loginUser(formData)).unwrap()
      navigate('/dashboard')
    } catch (err) {
      setError(err || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">FinTrack</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white font-bold py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-secondary font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
```

**File: `client/src/pages/Signup.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signupUser } from '../redux/slices/authSlice'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const { loading } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await dispatch(signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })).unwrap()
      navigate('/dashboard')
    } catch (err) {
      setError(err || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">FinTrack</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white font-bold py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
```

**Key implementation points:**
• Both pages use `dispatch(...).unwrap()`, allowing rejected thunks to throw directly inside the surrounding `try/catch` block. The thrown value originates from `rejectWithValue(getError(error))`, which preserves the server’s actual error `message` string.

• The `confirmPassword` field is validated before dispatching the signup thunk, avoiding unnecessary network requests when the client can already determine that the input is invalid.

• `disabled={loading}` together with dynamic button labels such as `'Logging in...'` and `'Creating account...'` prevents accidental double submissions while also providing clear feedback that the request is currently in progress.

• The page styling uses Tailwind’s `bg-gradient-to-br from-primary to-secondary` utility classes to create a branded full-screen gradient background that visually contrasts with the centered white authentication card.

---

##  Frontend Step 7 – Dashboard Page

**File: `client/src/pages/Dashboard.jsx`**

```jsx
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import SummaryCard from '../components/dashboard/SummaryCard'
import { getDashboardSummary } from '../services/dashboardService'
import { formatCurrency, formatDate } from '../utils/format'

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardSummary()
      .then((response) => setSummary(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return<div className="text-slate-600">Loading dashboard...</div>
  if (error) return<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>

  const trend = summary.monthlyTrend || []
  const categories = summary.categoryBreakdown || []
  const incomeExpense = trend.map((item) => ({ month: item.month, Income: item.income, Expense: item.expense }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Your financial snapshot, trends, and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Income" value={formatCurrency(summary.totalIncome)} tone="green" />
        <SummaryCard label="Total Expense" value={formatCurrency(summary.totalExpense)} tone="red" />
        <SummaryCard label="Remaining Budget" value={formatCurrency(summary.budgetRemaining)} tone="blue" />
        <SummaryCard label="Savings" value={formatCurrency(summary.savings)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Monthly Spending Trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Category Distribution</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={95}>
                  {categories.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Income vs Expense</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpense}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          <div className="mt-4 space-y-3">
            {summary.recentTransactions?.length ? summary.recentTransactions.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.category} • {formatDate(item.transactionDate)}</p>
                </div>
                <p className={item.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </p>
              </div>
            )) :<p className="text-sm text-slate-500">No transactions yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
```

**Key implementation points:**
• The Dashboard manages its data using local component state instead of Redux because the summary endpoint is read-only and consumed only by this page. Introducing a dedicated Redux slice would add unnecessary complexity without providing shared-state benefits.

• `incomeExpense = trend.map(...)` transforms the raw `monthlyTrend` data into Recharts-compatible keys such as `Income` and `Expense`, ensuring the chart legends display clean, user-friendly labels.

• All chart components are wrapped inside `<ResponsiveContainer>`, which expands to fill the parent container’s fixed `h-72` height. This maintains consistent vertical sizing while allowing charts to resize fluidly across screen widths.

• `COLORS[index % COLORS.length]` cycles through the predefined color palette whenever the number of categories exceeds the palette size, ensuring the pie chart always renders valid fill colors instead of `undefined`.

• `summary.recentTransactions?.length` safely short-circuits the empty-state logic, allowing the UI to render a friendly “No transactions yet.” message instead of displaying an empty transactions card.

---

##  Frontend Step 8 – Transactions Page

**File: `client/src/pages/Transactions.jsx`**

**Key implementation points:**
• `query = useMemo(() => ({ ...filters, limit: 10 }), [filters])` memoises the query object so the dependent `useEffect` runs only when the actual filter values change, instead of re-triggering on every render due to a new object reference.

• Resetting `page: 1` whenever filters such as search, type, or category change prevents users from remaining on a now-invalid page after the filtered result count becomes smaller.

• The same `<form>` component is reused for both transaction creation and editing. The `editingId` state controls the modal heading, submit button text, and the branch selected inside `saveTransaction`.

• After saving or deleting a transaction, `dispatch(fetchTransactions(query))` runs again to refresh pagination metadata such as `total` and `pages`, since the slice’s optimistic upsert logic does not automatically recalculate those values.

• The transaction form is rendered inside a fixed overlay using classes like `fixed inset-0 z-50 ... bg-slate-900/50`, creating a lightweight modal experience without relying on an external UI component library.

---

## Frontend Step 9 – Budget, Insights, Reports, Profile Pages

**File: `client/src/pages/Budget.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBudget, saveBudget } from '../redux/slices/budgetSlice'
import { getDashboardSummary } from '../services/dashboardService'
import { categories, formatCurrency } from '../utils/format'

function Budget() {
  const dispatch = useDispatch()
  const budget = useSelector(state => state.budget)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [categoryBudgets, setCategoryBudgets] = useState([])
  const [summary, setSummary] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    dispatch(fetchBudget())
    getDashboardSummary().then((response) => setSummary(response.data.data))
  }, [dispatch])

  useEffect(() => {
    setMonthlyBudget(budget.monthlyBudget)
    setCategoryBudgets(budget.categories)
  }, [budget.monthlyBudget, budget.categories])

  const addCategory = () => {
    setCategoryBudgets([...categoryBudgets, { category: 'Food', limit: 0 }])
  }

  const updateCategory = (index, field, value) => {
    setCategoryBudgets(categoryBudgets.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: field === 'limit' ? Number(value) : value } : item
    )))
  }

  const removeCategory = (index) => {
    setCategoryBudgets(categoryBudgets.filter((_, itemIndex) => itemIndex !== index))
  }

  const save = async (event) => {
    event.preventDefault()
    setMessage('')
    await dispatch(saveBudget({ monthlyBudget: Number(monthlyBudget), categoryBudgets })).unwrap()
    const response = await getDashboardSummary()
    setSummary(response.data.data)
    setMessage('Budget saved successfully.')
  }

  const totalExpense = summary?.totalExpense || 0
  const remaining = Number(monthlyBudget || 0) - totalExpense
  const usedPercent = monthlyBudget > 0 ? Math.min(100, Math.round((totalExpense / monthlyBudget) * 100)) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Budget</h2>
        <p className="mt-1 text-sm text-slate-500">Set monthly and category limits, then track progress as spending changes.</p>
      </div>

      {message &&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {budget.error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{budget.error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <form onSubmit={save} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Monthly Budget</label>
              <input
                type="number"
                min="0"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Category Budgets</h3>
              <button type="button" onClick={addCategory} className="rounded-lg border px-3 py-2 text-sm font-medium">
                Add Category
              </button>
            </div>

            <div className="space-y-3">
              {categoryBudgets.map((item, index) => {
                const spent = summary?.categoryBreakdown?.find((entry) => entry.category === item.category)?.amount || 0
                const percent = item.limit ? Math.min(100, Math.round((spent / item.limit) * 100)) : 0
                return (
                  <div key={`${item.category}-${index}`} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <select value={item.category} onChange={(e) => updateCategory(index, 'category', e.target.value)} className="rounded-lg border px-3 py-2">
                        {categories.map((category) => <option key={category}>{category}</option>)}
                      </select>
                      <input type="number" min="0" value={item.limit} onChange={(e) => updateCategory(index, 'limit', e.target.value)} className="rounded-lg border px-3 py-2" />
                      <button type="button" onClick={() => removeCategory(index)} className="rounded-lg border border-rose-200 px-3 py-2 text-rose-700">Remove</button>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>{formatCurrency(spent)} spent</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full${percent >= 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button disabled={budget.loading} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
              {budget.loading ? 'Saving...' : 'Save Budget'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Monthly Progress</h3>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-slate-500">Spent</p>
              <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Remaining</p>
              <p className={`text-2xl font-bold${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(remaining)}</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Budget used</span>
                <span>{usedPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className={`h-3 rounded-full${usedPercent >= 100 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${usedPercent}%` }} />
              </div>
            </div>
            {remaining < 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Overspending alert: you are over budget by {formatCurrency(Math.abs(remaining))}.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Budget
```

**File: `client/src/pages/Insights.jsx`**

```jsx
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInsights, fetchPrediction } from '../redux/slices/insightSlice'
import { formatCurrency } from '../utils/format'

function Insights() {
  const dispatch = useDispatch()
  const { insights, predictions, provider, loading, error } = useSelector(state => state.insights)

  useEffect(() => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Insights</h2>
          <p className="mt-1 text-sm text-slate-500">Smart analysis powered by OpenAI when configured, with a deterministic fallback engine.</p>
        </div>
        <button
          onClick={() => { dispatch(fetchInsights()); dispatch(fetchPrediction()) }}
          className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-blue-600"
        >
          Refresh Insights
        </button>
      </div>

      {error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recommendations</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{provider || 'heuristic'}</span>
          </div>
          {loading ? (
            <p className="text-slate-500">Generating insights...</p>
          ) : (
            <div className="space-y-3">
              {insights.length ? insights.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-lg border border-sky-100 bg-sky-50 p-4 text-slate-800">
                  {item}
                </div>
              )) :<p className="text-sm text-slate-500">Add transactions to generate insights.</p>}
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Spending Prediction</h3>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-slate-500">Predicted Expense</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(predictions.predictedExpense || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Confidence</p>
              <div className="mt-2 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${predictions.confidence || 0}%` }} />
              </div>
              <p className="mt-1 text-sm font-medium">{predictions.confidence || 0}%</p>
            </div>
            {predictions.budgetRisk && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Predicted spending is above your monthly budget.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Insights
```

**File: `client/src/pages/Reports.jsx`**

```jsx
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { downloadMonthlyReport, getMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'

function Reports() {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => period, [period])

  useEffect(() => {
    setLoading(true)
    getMonthlyReport(params)
      .then((response) => setReport(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load report'))
      .finally(() => setLoading(false))
  }, [params])

  const exportPdf = async () => {
    const response = await downloadMonthlyReport(params)
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `finance-report-${period.year}-${String(period.month).padStart(2, '0')}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Review monthly trends, category analytics, and export a PDF report.</p>
        </div>
        <button onClick={exportPdf} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">Export PDF</button>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <select value={period.month} onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })} className="rounded-lg border px-3 py-2">
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{new Date(2024, index, 1).toLocaleString('en-IN', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" value={period.year} onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })} className="rounded-lg border px-3 py-2" />
        </div>
      </section>

      {loading &&<p className="text-slate-500">Loading report...</p>}
      {error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {report && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Income</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(report.totalIncome)}</p></div>
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Expense</p><p className="text-2xl font-bold text-rose-600">{formatCurrency(report.totalExpense)}</p></div>
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Savings</p><p className="text-2xl font-bold text-slate-900">{formatCurrency(report.savings)}</p></div>
            <div className="rounded-lg border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Remaining</p><p className="text-2xl font-bold text-sky-700">{formatCurrency(report.budgetRemaining)}</p></div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
              <h3 className="font-semibold text-slate-900">Category Analytics</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Transactions</h3>
              <div className="mt-4 max-h-72 space-y-3 overflow-auto">
                {report.transactions.length ? report.transactions.map((item) => (
                  <div key={item._id} className="rounded-lg border p-3">
                    <div className="flex justify-between">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className={item.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>{formatCurrency(item.amount)}</p>
                    </div>
                    <p className="text-xs text-slate-500">{item.category} • {formatDate(item.transactionDate)}</p>
                  </div>
                )) :<p className="text-sm text-slate-500">No transactions for this period.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports
```

**File: `client/src/pages/Profile.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileThunk } from '../redux/slices/authSlice'
import { changePassword, getAccountStats } from '../services/authService'
import { formatCurrency } from '../utils/format'

function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email })
    getAccountStats().then((response) => setStats(response.data.data))
  }, [user])

  const saveProfile = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await dispatch(updateProfileThunk(profile)).unwrap()
      setMessage('Profile updated.')
    } catch (err) {
      setError(err || 'Unable to update profile.')
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await changePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setMessage('Password changed.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your account details and review finance activity.</p>
      </div>

      {message &&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">User Details</h3>
          <form onSubmit={saveProfile} className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="Name" required />
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="Email" required />
            <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white md:w-max">Save Profile</button>
          </form>

          <h3 className="mt-8 font-semibold text-slate-900">Change Password</h3>
          <form onSubmit={savePassword} className="mt-4 grid gap-4 md:grid-cols-2">
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="Current password" required />
            <input type="password" minLength="6" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="rounded-lg border px-3 py-2" placeholder="New password" required />
            <button className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white md:w-max">Change Password</button>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Account Statistics</h3>
          <div className="mt-4 space-y-4">
            <div><p className="text-sm text-slate-500">Transactions</p><p className="text-2xl font-bold">{stats?.transactionCount || 0}</p></div>
            <div><p className="text-sm text-slate-500">Income</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(stats?.totalIncome)}</p></div>
            <div><p className="text-sm text-slate-500">Expenses</p><p className="text-xl font-bold text-rose-600">{formatCurrency(stats?.totalExpense)}</p></div>
            <div><p className="text-sm text-slate-500">Savings</p><p className="text-xl font-bold text-slate-900">{formatCurrency(stats?.savings)}</p></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile
```

**Key implementation points:**
• The Budget page intentionally combines persisted budget data from Redux with the live dashboard summary fetched directly from the API, allowing it to render accurate category-level progress bars without requiring a separate backend endpoint.

• After `saveBudget` completes, the page immediately re-fetches the dashboard summary so that values like Spent, Remaining, and Used % stay accurate even if new transactions were added from another browser tab or session.

• The Insights page exposes the `provider` value from the Redux slice as a small status pill (`heuristic` or `openai`), allowing users to see which recommendation engine generated the current insights.

• The Reports page handles PDF downloads using `URL.createObjectURL(new Blob(...))` together with a programmatically triggered `<a download>` click, which is the standard browser-based approach for downloading blob responses.

• `useMemo(() => period, [period])` in the Reports page provides a stable object reference for the dependent `useEffect`, preventing unnecessary API fetches when the logical `period` value has not changed.

• The Profile page updates profile information through Redux so the global `user` state remains synchronised, while `changePassword` and `getAccountStats` are called directly because their results are transient and do not need persistent global state management.

---

##  Frontend Step 10 – Format Utility

**File: `client/src/utils/format.js`**

```jsx
export const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export const categories = [
  'Salary',
  'Freelance',
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Investments',
  'Other'
]

export const paymentMethods = ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']
```

**Key implementation points:**
• `formatCurrency` uses the `'en-IN'` locale together with the `'₹'` currency prefix and rounds values to whole rupees, keeping frontend formatting consistent with the calculations and summaries produced in `financeAnalyzer.js` on the backend.

• `formatDate` returns `'-'` whenever the input date is missing or undefined, ensuring tables and UI components display a clean placeholder instead of rendering invalid or empty date values.

• `categories` and `paymentMethods` act as the single client-side source of truth for the Transaction and Budget form dropdowns, while the backend `paymentMethod` enum mirrors these values exactly to maintain validation consistency across the application.

---


##  Running the Complete Project

### Step 1: Install All Dependencies

```bash
# Backend
cd AI-Based-Finance-Tracker/server
npm install

# Frontend
cd ../client
npm install
```

### Step 2: Configure Environment Variables

Edit `server/.env` and replace all placeholder values:

```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-finance-tracker
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Start the Application

Open **two terminal windows:**

```bash
# Terminal 1 – Backend
cd server
npm run dev
# Expected: MongoDB connected
#           Server running on port 5000

# Terminal 2 – Frontend
cd client
npm run dev
# Expected: Local: http://localhost:5173/
```

### Step 4: Open the App

Navigate to **http://localhost:5173** in your browser.

### Step 5: Test All Functionalities

1. **Signup** – Create a new account from `/signup`. Watch the dashboard redirect happen automatically.
2. **Login / Logout** – Logout from the sidebar and log back in to confirm token-based auth works.
3. **Add Transaction** – Open the Transactions page → “Add Transaction” → save an expense and an income.
4. **Filter & Sort** – Use the search box, type/category dropdowns, and sort dropdown; confirm pagination updates.
5. **Edit / Delete** – Edit and delete a transaction, confirm the table updates and pagination is consistent.
6. **Set Budget** – Go to Budget, set a monthly budget plus 2–3 category limits, save, and watch the progress bars react.
7. **Dashboard** – Check that totals, the line/pie/bar charts, and recent transactions reflect your data.
8. **AI Insights** – Visit Insights. With no `OPENAI_API_KEY`, the badge shows `heuristic`. Add the key, restart the server, and the badge flips to `openai`.
9. **Spending Prediction** – Confirm the predicted expense, the confidence bar, and (if applicable) the budget-risk warning.
10. **Monthly Report** – Pick a month/year, view the four-card summary, the category bar chart, and transactions.
11. **Export PDF** – Click “Export PDF”. A `finance-report-YYYY-MM.pdf` should download.
12. **Profile** – Update your name/email, change your password, and confirm Account Statistics match the dashboard.

---

## Summary

You have built a complete full-stack AI-powered personal finance application from scratch using the following implementation sequence:

**Backend (12 files built step by step):**`app.js` (`connectDB`) → `aiService.js` → `User.js` → `Transaction.js` + `Budget.js` → `authMiddleware.js` → `authController.js` → `transactionController.js` → `budgetController.js` → `financeAnalyzer.js` → `aiController.js` + `dashboardController.js` + `reportController.js` → `routes/*.js` → `app.js` + `server.js`

**Frontend (built on top of the backend):**
Vite + Tailwind config → `services/api.js` + per-resource services → Redux store with `auth`/`transactions`/`budget`/`insights` slices → `main.jsx` + `App.jsx` (Router + ProtectedRoute) → Layout/Sidebar/Navbar/SummaryCard → Pages (Login, Signup, Dashboard, Transactions, Budget, Insights, Reports, Profile) → `utils/format.js`

**Two analysis layers through one OpenAI SDK:**
• `npm install openai` installs the OpenAI SDK used for generating AI-powered financial insights through the `gpt-4o-mini` model.

• `services/financeAnalyzer.js` is a pure deterministic analytics engine that generates summaries, predictions, and heuristic insights without relying on external services. It serves both as the application’s core analytics source of truth and as the fallback insight provider when no OpenAI API key is configured.

**The complete data flow:**
Signup/Login → JWT in `localStorage` → Axios interceptor attaches `Bearer` → backend `protect` middleware sets `req.userId` → CRUD on transactions/budget → `summarizeTransactions` powers Dashboard, Reports, Account Stats → `generateAIInsights` returns OpenAI or heuristic insights → `predictExpense` returns predicted expense + confidence + budget-risk → PDFKit streams a downloadable monthly report