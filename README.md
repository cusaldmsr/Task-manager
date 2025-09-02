# Task Manager App

## Description

Task Manager App is a cross-platform mobile application built with React Native and Expo. It allows users to manage their daily tasks efficiently with features like authentication, task creation, editing, deletion, status management, and offline support. The app provides a modern and intuitive UI, making it easy to track progress and stay organized whether online or offline.

A cross-platform mobile Task Manager built with React Native and Expo.

## Demo

Check out a video demo of the app:

(https://github.com/user-attachments/assets/99f35291-4eb1-400f-a372-8d29adea8e1c)

## Features

- User authentication (login/register)
- Add, edit, delete tasks
- Task status management (Pending, In Progress, Completed)
- Offline support for tasks
- Persistent user sessions
- Modern UI with statistics and quick actions

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage
- REST API (see `src/services/api.ts`)
- **Backend:** JavaEE with Hibernate ([TaskManagerApp-Backend](https://github.com/cusaldmsr/TaskManagerApp-Backend))

## Project Structure

```
├── App.tsx
├── app.json
├── index.ts
├── package.json
├── tsconfig.json
├── assets/
├── src/
│   ├── components/
│   │   └── TaskItem.tsx
│   ├── screens/
│   │   ├── AddTaskScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── TaskListScreen.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── constants.ts
```

## Getting Started

### Prerequisites

- Node.js & npm
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/cusaldmsr/Task-manager.git
   cd Task-manager
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```
4. Run on your device:
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For Web: `npm run web`

### Backend Repository

The backend for this project is built with JavaEE and Hibernate. You can find the source code and setup instructions here:

- [TaskManagerApp-Backend](https://github.com/cusaldmsr/TaskManagerApp-Backend)

Update the API base URL in `src/utils/constants.ts` if your backend endpoint changes.

## Usage

1. Register a new account or log in with existing credentials.
2. Add, edit, or delete tasks.
3. Change task status by tapping the status badge.
4. Tasks are available offline and sync when online.

## Offline Support

Tasks are cached locally using AsyncStorage. Any changes made offline will sync with the server when connectivity is restored.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
