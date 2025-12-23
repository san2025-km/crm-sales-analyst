# Vendasta CRM Sales Analyst

This project contains two main parts:
1.  A **frontend** React application that provides the user interface for filtering data and viewing AI-powered insights.
2.  A **backend** Node.js server that will eventually connect to the Vendasta CRM, process data, and securely interact with the Google Gemini API.

---

## How to Run

This application now has a separate frontend and backend. You need to run both for the full application to work (once they are connected).

### Running the Frontend

The frontend is a client-side only application and is ready to run.

1.  Simply view the application in the preview pane of this development environment.
2.  **Note:** The frontend currently uses mock data located in `/data/mockData.ts` and makes direct calls to the Gemini API from the browser. The next step is to connect it to the backend.

### Running the Backend

The backend server must be run from a local terminal on your machine (e.g., in VS Code or Cursor).

1.  **Navigate to the Backend Folder:**
    Open your terminal and change the directory to this project's `backend` folder.
    ```bash
    cd path/to/your-project/backend
    ```

2.  **Install Dependencies:**
    Run `npm install` to download the required libraries (Express, cors, etc.).
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a new file in the `backend` folder named `.env`. This file will hold your secret API keys. Add the following keys to it, replacing the placeholder text with your actual keys:
    ```
    # Google Gemini API Key
    API_KEY=your_google_ai_api_key_here

    # Vendasta CRM API Key
    VENDASTA_API_KEY=your_vendasta_api_key_here
    ```

4.  **Start the Server:**
    Run `npm start` to launch the backend server.
    ```bash
    npm start
    ```
    You should see the confirmation message: `Backend server is running on http://localhost:3001`

---
## Using the Application
- **Login:** Use `jsmith` or `adoe` to log into the dashboard.
- **Filter Data:** Use the controls at the top to filter the mock CRM data.
- **Ask Questions:** Type a strategic question to generate AI-powered insights based on the mock data.