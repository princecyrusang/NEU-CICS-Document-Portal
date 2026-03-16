# 🛡️ NEU CICS Document Portal

An internal, secure document management system designed for the **New Era University - College of Informatics and Computing Studies (CICS)**. This portal ensures that academic documents are accessed only by authorized students and tracked for security.

## 🔗 Project Links
* **Live Demo:** [https://studio-998152409-fbf64.web.app](https://studio-998152409-fbf64.web.app)
* **GitHub Repository:** [https://github.com/princecyrusang/NEU-CICS-Document-Portal](https://github.com/princecyrusang/NEU-CICS-Document-Portal)

## ✨ Key Features
* **Google Workspace Auth:** Restricted strictly to `@neu.edu.ph` email domains.
* **Secure Document Access:** Users must authenticate to view or download sensitive CICS files.
* **Automated Audit Logs:** Every document interaction is logged in Firestore with a timestamp and User ID.
* **Admin Dashboard:** Real-time analytics on document downloads and user management (Block/Unblock features).
* **Responsive Design:** Built with Tailwind CSS for seamless use on mobile and desktop.

## 🛠️ Tech Stack
* **Framework:** Next.js 15 (Static Export)
* **Styling:** Tailwind CSS & Shadcn/UI
* **Backend/Database:** Firebase Firestore
* **Authentication:** Firebase Auth (Google Provider)
* **Deployment:** Firebase Hosting (Spark Tier)

## 🚀 How to Run Locally
1. Clone the repo: `git clone https://github.com/princecyrusang/NEU-CICS-Document-Portal.git`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

---
*Developed for CICS - New Era University*
