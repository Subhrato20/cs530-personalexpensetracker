import sqlite3

DATABASE = "users.db" # Load from local DB for now

def init_db():
    # Initializes the database and creates the users table if it doesn't exist.

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')

        # Create expenses table with username as the foreign key
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
            )
        ''')

                # Alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                due_date TEXT NOT NULL,
                FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
            )
        ''')

        conn.commit()

# Initialize the database when the module is loaded.
init_db()

def signup_user(username, name, email, password):
    # Signs up a new user by inserting into the SQLite DB and returns the user ID.

    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)", 
                           (username, name, email, password))
            conn.commit()
            user_id = cursor.lastrowid
            return {"success": True, "message": "User registered successfully.", "user_id": user_id}
    
    except sqlite3.IntegrityError as e:
        error_message = str(e)

        if "UNIQUE constraint failed: users.username" in error_message:
            return {"success": False, "message": "Username is already taken."}
        elif "UNIQUE constraint failed: users.email" in error_message:
            return {"success": False, "message": "Email is already registered."}
        else:
            return {"success": False, "message": f"Database Integrity Error: {error_message}"}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

    except Exception as e:
        return {"success": False, "message": f"Unexpected Error: {str(e)}"}

def signin_user_by_email(email, password):
    # Signs in a user by checking email and password.

    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, password FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()

            if row and row[1] == password:
                return {"success": True, "message": "Login successful.", "user_id": row[0]}
            else:
                return {"success": False, "message": "Invalid email or password."}
    
    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

    except Exception as e:
        return {"success": False, "message": f"Unexpected Error: {str(e)}"}

def signin_user_by_username(username, password):
    # Signs in a user by checking username and password.
    
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, password FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()

            if row and row[1] == password:
                return {"success": True, "message": "Login successful.", "user_id": row[0]}
            else:
                return {"success": False, "message": "Invalid username or password."}
    
    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

    except Exception as e:
        return {"success": False, "message": f"Unexpected Error: {str(e)}"}

def get_user_info(username):
    """Fetches the full name of a user based on their username."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()

            if row:
                return {"success": True, "name": row[0]}
            else:
                return {"success": False, "message": "User not found."}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

def add_expense(username, name, amount, category, date):
    """Adds an expense for a user."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO expenses (username, name, amount, category, date) VALUES (?, ?, ?, ?, ?)", 
                           (username, name, amount, category, date))
            conn.commit()
            return {"success": True, "message": "Expense added successfully."}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}
    

def get_expenses(username):
    """Fetches all expenses for a specific user."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, amount, category, date FROM expenses WHERE username = ?", (username,))
            expenses = cursor.fetchall()

            if not expenses:
                return {"success": True, "expenses": []}  # Return empty list if no expenses found

            expense_list = [
                {"id": row[0], "name": row[1], "amount": row[2], "category": row[3], "date": row[4]}
                for row in expenses
            ]

            return {"success": True, "expenses": expense_list}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

def delete_expenses(expense_ids):
    """Deletes expenses based on provided IDs."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(f"DELETE FROM expenses WHERE id IN ({','.join('?' * len(expense_ids))})", expense_ids)
            conn.commit()

            return {"success": True, "message": "Expenses deleted successfully."}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

def set_alert(username, name, amount, due_date):
    """Sets an alert for a user."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO alerts (username, name, amount, due_date) VALUES (?, ?, ?, ?)", 
                           (username, name, amount, due_date))
            conn.commit()
            return {"success": True, "message": "Alert set successfully."}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}

def get_alerts(username):
    """Fetches all alerts for a specific user."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, amount, due_date FROM alerts WHERE username = ?", (username,))
            alerts = cursor.fetchall()

            if not alerts:
                return {"success": True, "alerts": []}  # Return empty list if no alerts found

            alert_list = [
                {"id": row[0], "name": row[1], "amount": row[2], "due_date": row[3]}
                for row in alerts
            ]

            return {"success": True, "alerts": alert_list}

    except sqlite3.Error as e:
        return {"success": False, "message": f"Database Error: {str(e)}"}