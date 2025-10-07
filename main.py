import sqlite3
import os
from flask import Flask, render_template, request, redirect, url_for, flash, abort
from datetime import datetime

# --- Configuration ---
DATABASE_FILE = 'projects.db'
SQL_INIT_FILE = os.path.join('sql', 'init.sql')
SECRET_KEY = os.urandom(24) # For flashing messages

# --- App Initialization ---
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# --- Database Functions ---
def get_db_connection():
    """Creates a database connection."""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """Initializes the database using the SQL script if the DB file doesn't exist."""
    if not os.path.exists(DATABASE_FILE):
        print(f"Database file not found. Creating and initializing database at '{DATABASE_FILE}'...")
        try:
            conn = get_db_connection()
            with open(SQL_INIT_FILE, 'r') as f:
                conn.executescript(f.read())
            conn.commit()
            conn.close()
            print("Database initialized successfully.")
        except Exception as e:
            print(f"Error initializing database: {e}")
            if os.path.exists(DATABASE_FILE):
                os.remove(DATABASE_FILE)

def get_project(project_id):
    """Gets a single project by its ID."""
    conn = get_db_connection()
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    conn.close()
    if project is None:
        abort(404)
    return project

# --- Routes ---
@app.route('/')
def index():
    """Homepage: Displays all projects."""
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('index.html', projects=projects)

@app.route('/new', methods=['GET', 'POST'])
def create_project():
    """Page for creating a new project."""
    if request.method == 'POST':
        project_name = request.form.get('project_name')
        if not project_name:
            flash('Project Name is a required field.', 'error')
            return render_template('new_project.html')

        try:
            conn = get_db_connection()
            conn.execute(
                """
                INSERT INTO projects (project_name, code_repository, idea, description, status, start_date)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    project_name,
                    request.form.get('code_repository'),
                    request.form.get('idea'),
                    request.form.get('description'),
                    request.form.get('status', 'idea'),
                    datetime.now()
                )
            )
            conn.commit()
            conn.close()
            flash(f"Project '{project_name}' created successfully!", 'success')
        except sqlite3.Error as e:
            flash(f"Database error: {e}", 'error')
        
        return redirect(url_for('index'))

    return render_template('new_project.html')

@app.route('/project/<int:project_id>', methods=['GET', 'POST'])
def project_detail(project_id):
    """Displays and handles updates for a single project."""
    project = get_project(project_id)

    if request.method == 'POST':
        project_name = request.form.get('project_name')
        if not project_name:
            flash('Project Name cannot be empty.', 'error')
            return redirect(url_for('project_detail', project_id=project_id))

        try:
            conn = get_db_connection()
            conn.execute(
                """
                UPDATE projects SET
                    project_name = ?, code_repository = ?, idea = ?, description = ?,
                    market_research = ?, competitor_research = ?, status = ?,
                    start_date = ?, due_date = ?
                WHERE id = ?
                """,
                (
                    project_name,
                    request.form.get('code_repository'),
                    request.form.get('idea'),
                    request.form.get('description'),
                    request.form.get('market_research'),
                    request.form.get('competitor_research'),
                    request.form.get('status'),
                    request.form.get('start_date'),
                    request.form.get('due_date'),
                    project_id
                )
            )
            conn.commit()
            conn.close()
            flash('Project updated successfully!', 'success')
        except sqlite3.Error as e:
            flash(f"Database error on update: {e}", 'error')
        
        return redirect(url_for('project_detail', project_id=project_id))

    # Convert the sqlite3.Row object to a dictionary for easier template access
    project_dict = dict(project)
    return render_template('project_detail.html', project=project_dict)

# --- Main Execution ---
if __name__ == '__main__':
    initialize_database()
    app.run(debug=True)