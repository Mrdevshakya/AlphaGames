# Gamin App Admin Panel

This is the admin panel for the Gamin App, which allows administrators to manage tournaments, set entry fees, winning prizes, and configure player limits.

## Features

- Admin authentication
- Dashboard with tournament statistics
- Create, edit, and delete tournaments
- Set entry fees and prize pools
- Configure maximum number of participants
- Start and cancel tournaments

## Tech Stack

- React.js
- Material UI
- Firebase (Authentication, Firestore)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the admin directory:
   ```
   cd admin
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. The admin panel will be available at http://localhost:3000

### Building for Production

To create a production build:

```
npm run build
```
or
```
yarn build
```

## Admin Access

To access the admin panel, you need to have admin credentials. By default, the admin panel uses Firebase Authentication with email and password.

## Integration with Main App

The admin panel uses the same Firebase project as the main Gamin App, ensuring that all data is synchronized between the admin panel and the mobile application.

When tournaments are created or updated through the admin panel, they will be immediately available in the mobile app for users to join.

## Deployment

The admin panel can be deployed to any static hosting service like Firebase Hosting, Netlify, or Vercel.

### Deploying to Firebase Hosting

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```
   firebase init hosting
   ```

4. Deploy to Firebase Hosting:
   ```
   firebase deploy --only hosting
   ```