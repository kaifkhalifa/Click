from flask import Flask, render_template, jsonify, request, session
import os
import random
import uuid
import json

app = Flask(__name__, static_folder='static', static_url_path='')
app.config['SECRET_KEY'] = 'dev-key-123'

# File to store the global leaderboard
LEADERBOARD_FILE = 'leaderboard.json'

# Predefined leaderboard with made-up usernames and high (but beatable) scores
DEFAULT_LEADERBOARD = [
    {'username': 'ZephyrX', 'total_clicks': 150},
    {'username': 'InfernoAce', 'total_clicks': 120},
    {'username': 'TitanShade', 'total_clicks': 100},
    {'username': 'RuneMaverick', 'total_clicks': 80},
    {'username': 'LunarStriker', 'total_clicks': 65}
]

def load_global_leaderboard():
    """Load the global leaderboard from file or create a new one if it doesn't exist"""
    try:
        if os.path.exists(LEADERBOARD_FILE):
            with open(LEADERBOARD_FILE, 'r') as f:
                return json.load(f)
        else:
            # Create the file with default leaderboard
            save_global_leaderboard(DEFAULT_LEADERBOARD)
            return DEFAULT_LEADERBOARD.copy()
    except Exception as e:
        print(f"Error loading leaderboard: {e}")
        return DEFAULT_LEADERBOARD.copy()

def save_global_leaderboard(leaderboard):
    """Save the global leaderboard to file"""
    try:
        with open(LEADERBOARD_FILE, 'w') as f:
            json.dump(leaderboard, f)
    except Exception as e:
        print(f"Error saving leaderboard: {e}")

@app.route('/')
def index():
    # Initialize session
    session.clear()
    
    # Initialize session
    session['user_id'] = str(uuid.uuid4())
    session['total_clicks'] = 0
    session['username'] = f"Player{random.randint(1000, 9999)}"
    
    # Load the global leaderboard
    global_leaderboard = load_global_leaderboard()
    session['leaderboard'] = global_leaderboard
    
    session.modified = True
    
    return render_template('index.html')

@app.route('/api/click', methods=['POST'])
def click():
    print("Click endpoint called")
    
    # Make sure session exists
    if 'user_id' not in session:
        print("User not logged in, initializing session")
        session['user_id'] = str(uuid.uuid4())
        session['total_clicks'] = 0
        session['username'] = f"Player{random.randint(1000, 9999)}"
        session['leaderboard'] = load_global_leaderboard()
    
    # Increment user's clicks
    session['total_clicks'] = session.get('total_clicks', 0) + 1
    print(f"Incremented clicks to {session['total_clicks']}")
    
    # Update leaderboard if user's score is high enough
    update_leaderboard()
    
    # Save session
    session.modified = True
    
    response_data = {
        'total_clicks': session['total_clicks'],
        'leaderboard': session['leaderboard']
    }
    print("Returning response:", response_data)
    
    return jsonify(response_data)

@app.route('/api/update-username', methods=['POST'])
def update_username():
    """Update the user's username"""
    print("Update username endpoint called")
    
    if 'user_id' not in session:
        print("User not logged in")
        return jsonify({'error': 'Not logged in'}), 401
    
    print("Request JSON:", request.json)
    new_username = request.json.get('username')
    if not new_username or len(new_username.strip()) == 0:
        print("Username is empty")
        return jsonify({'error': 'Username cannot be empty'}), 400
    
    # Update username in session
    old_username = session['username']
    print(f"Updating username from {old_username} to {new_username}")
    session['username'] = new_username
    
    # Update username in leaderboard
    for entry in session['leaderboard']:
        if entry['username'] == old_username:
            entry['username'] = new_username
    
    # Save the updated leaderboard
    save_global_leaderboard(session['leaderboard'])
    
    session.modified = True
    print("Session updated, returning response")
    
    return jsonify({
        'username': session['username'],
        'leaderboard': session['leaderboard']
    })

def update_leaderboard():
    """Update the leaderboard with the user's score if it's high enough"""
    user_entry = {
        'username': session['username'],
        'total_clicks': session['total_clicks']
    }
    
    print(f"Updating leaderboard for user {user_entry['username']} with {user_entry['total_clicks']} clicks")
    
    # Check if user is already on the leaderboard
    user_in_leaderboard = False
    for i, entry in enumerate(session['leaderboard']):
        if entry['username'] == session['username']:
            # Update existing entry
            session['leaderboard'][i] = user_entry
            user_in_leaderboard = 'updated'
            print(f"Updated existing leaderboard entry at position {i}")
            break
    
    if not user_in_leaderboard:
        # Add user to leaderboard
        session['leaderboard'].append(user_entry)
        user_in_leaderboard = 'added'
        print("Added new entry to leaderboard")
    
    # Sort leaderboard by total_clicks (descending)
    session['leaderboard'] = sorted(
        session['leaderboard'], 
        key=lambda x: x['total_clicks'], 
        reverse=True
    )
    
    # Keep only top 10 entries
    session['leaderboard'] = session['leaderboard'][:10]
    print("Sorted leaderboard, current top entry:", session['leaderboard'][0])
    
    # Save the updated leaderboard to file if the user's entry was added or updated
    if user_in_leaderboard:
        save_global_leaderboard(session['leaderboard'])
        print(f"Saved global leaderboard to file after {user_in_leaderboard} user")

@app.route('/api/leaderboard')
def get_leaderboard():
    # Initialize session if it doesn't exist
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        session['total_clicks'] = 0
        session['username'] = f"Player{random.randint(1000, 9999)}"
        session['leaderboard'] = load_global_leaderboard()
        session.modified = True
    else:
        # Always load the latest global leaderboard
        session['leaderboard'] = load_global_leaderboard()
        session.modified = True
    
    return jsonify(session['leaderboard'])

@app.route('/api/user')
def get_user():
    """Get current user information"""
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        session['total_clicks'] = 0
        session['username'] = f"Player{random.randint(1000, 9999)}"
        session['leaderboard'] = load_global_leaderboard()
        session.modified = True
    
    return jsonify({
        'username': session['username'],
        'total_clicks': session['total_clicks']
    })

@app.route('/api/reset-leaderboard', methods=['POST'])
def reset_leaderboard():
    """Admin endpoint to reset the leaderboard to defaults"""
    save_global_leaderboard(DEFAULT_LEADERBOARD)
    return jsonify({'status': 'success', 'message': 'Leaderboard reset to defaults'})

if __name__ == '__main__':
    # Ensure the leaderboard file exists
    if not os.path.exists(LEADERBOARD_FILE):
        save_global_leaderboard(DEFAULT_LEADERBOARD)
    
    app.run(debug=True)

@app.route('/api/upgrade', methods=['POST'])
def upgrade():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    user = User.query.get(session['user_id'])
    upgrade_type = request.json.get('type')
    
    upgrades = {
        'click_power': {'cost': 100, 'increase': 1},
        'auto_click': {'cost': 500, 'increase': 1}
    }
    
    if upgrade_type not in upgrades:
        return jsonify({'error': 'Invalid upgrade type'}), 400
    
    upgrade_info = upgrades[upgrade_type]
    if user.points < upgrade_info['cost']:
        return jsonify({'error': 'Not enough points'}), 400
    
    user.points -= upgrade_info['cost']
    if upgrade_type == 'click_power':
        user.click_power += upgrade_info['increase']
    elif upgrade_type == 'auto_click':
        user.auto_clicks += upgrade_info['increase']
    
    db.session.commit()
    return jsonify({
        'points': user.points,
        'click_power': user.click_power,
        'auto_clicks': user.auto_clicks
    })

if __name__ == '__main__':
    app.run(debug=True)
