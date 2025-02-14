from flask import Flask, render_template, request, redirect, url_for, session
import smtplib, random

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Dummy database
users = {}
verification_codes = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        code = str(random.randint(1000, 9999))
        verification_codes[email] = code
        
        # Send email (replace with actual credentials)
        smtp = smtplib.SMTP("smtp.example.com", 587)
        smtp.starttls()
        smtp.login("your-email@example.com", "your-password")
        smtp.sendmail("your-email@example.com", email, f"Your verification code is: {code}")
        smtp.quit()

        session['email'] = email
        return redirect(url_for('verify'))
    
    return render_template('signup.html')

@app.route('/verify', methods=['GET', 'POST'])
def verify():
    if request.method == 'POST':
        email = session.get('email')
        if request.form['code'] == verification_codes.get(email):
            users[email] = {"password": session['password']}
            return redirect(url_for('login'))
    return "Incorrect code"

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        if email in users and users[email]['password'] == request.form['password']:
            session['logged_in'] = True
            return redirect(url_for('game'))
    return render_template('login.html')

@app.route('/game')
def game():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('game.html')

if __name__ == '__main__':
    app.run(debug=True)
