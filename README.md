# MRF Request Management System
**HS Technologies (Phils.), Inc.**
Form Ref: QAD-F-7.1.1.2 REV.10 | Classification: Internal Use Only

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS 3 + Inline CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project named `mrf-system`
3. Enable **Authentication → Email/Password**
4. Create a **Firestore Database** (production mode)
5. Enable **Storage**
6. Add a **Web App** and copy the config

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in your Firebase values in `.env`.

### 4. Run the dev server
```bash
npm run dev
```

### 5. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```

---

## Project Structure
```
src/
├── firebase.js          # Firebase init & exports
├── main.jsx             # Entry point
├── App.jsx              # Root component + view-state router
├── styles/
│   └── index.css        # Global styles + Tailwind directives
└── pages/
    ├── LoginPage.jsx     # ✅ Built
    ├── Dashboard.jsx     # 🔲 Next
    ├── MRFForm.jsx       # 🔲 Wizard (4 steps)
    └── MRFDetail.jsx     # 🔲 Detail + Approval view
```

---

## Workflow & Roles
| Role | Firebase Value | Permissions |
|---|---|---|
| Preparer | `preparer` | Create new MRF requests |
| Noted By | `noter` | Note & forward requests |
| Confirmed By | `confirmer` | Confirm & send to QA |
| QA Admin | `qa` | Approve / Return / Deny |

## MRF Status Flow
```
pending_noter → pending_confirmer → qa_review → approved
                                              ↘ denied
                                              ↘ returned → pending_noter
```
