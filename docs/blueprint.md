# **App Name**: NEU Student Hub

## Core Features:

- Secure NEU Login: Enable Firebase Google Authentication, restricting access solely to users with an '@neu.edu.ph' email address.
- First-Time Onboarding Flow: Upon first login, new users are guided to select their 'Undergraduate Program' from a dropdown menu, essential for accessing the main dashboard.
- Program Profile Management: Allow users to select and save their 'Undergraduate Program', which is securely stored in their Firestore user profile.
- Administrator User Blocking: Implement an 'isBlocked' boolean field (default: false) within user profiles to enable administrators to restrict user access to the application.
- Dashboard Access Control: Enforce dashboard access restrictions, ensuring users have completed the 'First-Time Onboarding Flow' and selected their program.
- Program Resource Suggestions: Leverage an AI tool to suggest courses, clubs, or campus resources relevant to the user's selected 'Undergraduate Program', personalizing their experience.

## Style Guidelines:

- Primary color (non-background): #396FAC. This thoughtful, academic blue provides a stable and trustworthy foundation, reflecting the educational environment.
- Background color: #E9EFF7. A very light, desaturated blue provides a clean, unobtrusive canvas, enhancing readability for academic content.
- Accent color: #4AC9ED. A vibrant and refreshing cyan-blue, this analogous accent highlights key actions and interactive elements, adding a modern touch.
- All text: 'Inter' (sans-serif) for a modern, objective, and highly readable experience, ideal for an educational platform.
- Utilize simple, clean, and academic-themed icons to ensure clarity and enhance the professional look of the application.
- Employ a clear and intuitive layout with ample white space, facilitating easy navigation and information absorption, especially for forms and dashboards.
- Implement subtle, smooth animations for transitions between pages and for feedback on interactive elements, ensuring a responsive and pleasant user experience.