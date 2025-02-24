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
