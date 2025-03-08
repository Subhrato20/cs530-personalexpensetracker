# Project Setup & Running Guide  

## Backend Setup  
1. Update the `.env` file:  
   ```plaintext
   GROQ_API_KEY = gsk_dummy_api_key
   ```
2. Navigate to the backend directory:  
   ```sh
   cd backend
   ```
3. Set up a virtual environment:  
   ```sh
   python -m venv venv
   source venv/bin/activate
   ```
4. Install dependencies:  
   ```sh
   pip install -r requirements.txt
   ```
5. Start the backend:  
   ```sh
   python app.py
   ```

## Frontend Setup  
In a new terminal:  
1. Navigate to the frontend directory:  
   ```sh
   cd frontend
   ```
2. Install dependencies:  
   ```sh
   npm install
   ```
3. Start the development server:  
   ```sh
   npm run dev
   ```

Now, the project should be running! 🚀