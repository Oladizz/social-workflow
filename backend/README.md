# Social Workflow Backend

This is a Python FastAPI microservice designed to run alongside the Social Workflow React application. It handles tasks that require Python libraries, specifically interacting with Twitter via the `twikit` open-source library.

## Prerequisites
- Python 3.9+
- Virtual environment (recommended)

## Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`.
You can access the interactive API documentation at `http://localhost:8000/docs`.

## API Endpoints

### `POST /api/twitter/post`
Posts a tweet using the provided Twitter credentials.

**Request Body:**
```json
{
  "username": "your_twitter_username",
  "email": "your_twitter_email",
  "password": "your_twitter_password",
  "text": "Hello World from Social Workflow!"
}
```

**Note:** For production, it's highly recommended to implement session cookie management instead of passing raw credentials for every request, as Twitter may flag repeated logins.
