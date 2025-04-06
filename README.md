# Plexy - Perplexity Clone

Plexy is a web application designed to mimic the core functionality of Perplexity AI. It uses the Google Gemini API with search grounding to provide conversational search results based on user queries.

## Features

*   Conversational search interface.
*   Streaming responses from the Gemini API.
*   Google Search integration for grounded answers.
*   Follow-up question suggestions.
*   Markdown rendering for responses.

## Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js) or [yarn](https://yarnpkg.com/)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd plexy
    ```

2.  **Install server dependencies:**
    Navigate to the project root directory (`plexy`) and run:
    ```bash
    npm install
    ```
    *(Or `yarn install` if you prefer yarn)*

3.  **Install client dependencies:**
    Navigate to the `client` directory and run:
    ```bash
    cd client
    npm install
    ```
    *(Or `yarn install`)*

4.  **Return to the root directory:**
    ```bash
    cd ..
    ```

## Environment Variables

The backend server requires a Google Gemini API key to function.

1.  Create a `.env` file in the **root** directory of the project (`plexy/.env`).
2.  Add your Gemini API key to the `.env` file:
    ```env
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
3.  Replace `YOUR_API_KEY_HERE` with your actual key obtained from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Running the Application

You need to run both the backend server and the frontend client simultaneously.

1.  **Start the Backend Server:**
    Open a terminal in the project's **root** directory (`plexy`) and run:
    ```bash
    node server/index.js
    ```
    The server will start, typically on port 5001.

2.  **Start the Frontend Client:**
    Open a *second* terminal, navigate to the `client` directory (`plexy/client`), and run:
    ```bash
    npm start
    ```
    *(Or `yarn start`)*
    This will launch the React development server, usually on port 3000, and should open the application automatically in your default web browser.

3.  **Access the Application:**
    If it doesn't open automatically, navigate to `http://localhost:3000` in your web browser.