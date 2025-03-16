from flask import Flask, render_template, jsonify, request, session
import os

app = Flask(__name__, static_folder='static', static_url_path='')
app.config['SECRET_KEY'] = 'dev-key-123'

# Global variable to store clicks (temporary solution)
total_clicks = 0



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/click', methods=['POST'])
def click():
    global total_clicks
    total_clicks += 1
    return jsonify({
        'total_clicks': total_clicks
    })

@app.route('/api/leaderboard')
def get_leaderboard():
    return jsonify([{
        'username': 'You',
        'total_clicks': total_clicks
    }])

if __name__ == '__main__':
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
