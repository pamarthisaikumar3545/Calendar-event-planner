# Custom Event Calendar

## Live Demo
- [View Live Demo](https://calendar-app-topaz-ten.vercel.app/)
- [GitHub Repository](https://github.com/Vtsrinivas07/Calendar-App)

## Overview

This is a dynamic, interactive event calendar built with React. It allows users to manage their schedule with features such as adding, editing, deleting, and viewing events. The calendar supports recurring events, drag-and-drop rescheduling, public holidays, event sharing, reminders, and more.

## Features

- **Monthly, Weekly, and Daily Views**
  - Switch between month, week, and day calendar views.
  - Highlight the current day.
  - Navigate between months, weeks, and days.

- **Event Management**
  - **Add Event:** Click on a day or time slot to add an event. Fill in title, description, date/time, duration, category, recurrence, reminders, and sharing options.
  - **Edit Event:** Click the edit icon on an event to update its details.
  - **Delete Event:** Click the delete icon on an event to remove it.

- **Recurring Events**
  - Support for daily, weekly, monthly, yearly, and custom recurrence patterns.
  - Set end conditions (never, on a date, after N occurrences).

- **Drag-and-Drop Rescheduling**
  - Drag events to a different day or time to reschedule.
  - Conflict detection prevents overlapping events.

- **Event Conflict Management**
  - Prevents double-booking by checking for overlapping events.
  - Shows a warning if a conflict is detected.

- **Event Filtering and Searching**
  - Filter events by category.
  - Search for events by title, description, or category.

- **Event Persistence**
  - All events are saved in local storage and persist across page reloads.

- **Responsive Design**
  - Fully responsive and works on desktop, tablet, and mobile devices.

- **Public Holidays**
  - Displays public holidays for India (IN) in the calendar cells.

- **Event Sharing**
  - Share events with others by adding their email addresses.

- **Reminders**
  - Set reminders for events (e.g., 5 minutes, 1 hour, 1 day before).
  - In-app notifications for upcoming events.

- **Export/Import Events**
  - Export all events to a JSON file.
  - Import events from a JSON file (with conflict checking).

- **Google Calendar Sync (Mock)**
  - Button for syncing with Google Calendar (mock implementation; real integration would require OAuth setup).

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm start
   ```
3. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## Usage Notes

- **Adding Events:** Click on any day (month/week view) or time slot (day view) to add an event for that date/time.
- **Editing/Deleting Events:** Use the edit and delete icons on each event.
- **Recurring Events:** Set recurrence and end conditions in the event form.
- **Drag-and-Drop:** Drag events to reschedule. Conflicts are detected and prevented.
- **Public Holidays:** Holidays are shown at the top of each day cell.
- **Reminders:** Set a reminder to get notified in-app before the event.
- **Export/Import:** Use the buttons at the top to export/import events as JSON.
- **Sync:** The sync button is a placeholder for Google Calendar integration.

## Customization
- To change the country for public holidays, update the `countryCode` in `Calendar.jsx`.
- To enable real Google Calendar sync, implement OAuth and use the Google Calendar API.

## License

This project is for educational/demo purposes. You are free to use and modify it as needed.

![image](https://github.com/user-attachments/assets/693d4bbc-e04d-4a7c-95aa-c9689e8f50eb)
![image](https://github.com/user-attachments/assets/5e0a16c3-4128-4110-b1f7-9f2e788df234)
![image](https://github.com/user-attachments/assets/64c0177e-bd53-404e-81fe-5e525d988813)
![image](https://github.com/user-attachments/assets/910b3e91-188a-4c85-a100-83c5866583d9)



