from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# Connexion et création de la base de données (si elle n'existe pas)
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Route pour la page d'accueil
@app.route('/')
def home():
    return render_template('index.html')

# Route pour afficher le formulaire d'inscription
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        conn.close()
        return redirect(url_for('home'))
    return render_template('register.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
