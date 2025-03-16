class ClickCounter {
    constructor() {
        this.totalClicks = 0;
        this.username = '';
        this.leaderboard = [];
        this.loadInitialData();
        // We're now handling username editing in the inline script
        this.setupEventListeners(); // Call immediately instead of waiting for DOMContentLoaded
    }

    setupEventListeners() {
        // Click button event
        const clickButton = document.getElementById('clickButton');
        if (clickButton) {
            clickButton.addEventListener('click', (event) => {
                console.log('Click button clicked');
                this.handleClick();
                this.createClickEffect(event);
            });
        } else {
            console.error('Click button not found');
        }
        
        // Username editing is now handled in the inline script in index.html
    }

    async loadInitialData() {
        try {
            // Load user data
            const userResponse = await fetch('/api/user');
            const userData = await userResponse.json();
            this.username = userData.username;
            this.totalClicks = userData.total_clicks;
            
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = this.username;
            }
            
            // Load leaderboard
            await this.loadLeaderboard();
            
            // Update UI
            this.updateUI();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    async loadLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            this.leaderboard = await response.json();
            this.renderLeaderboard();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }
    
    renderLeaderboard() {
        const leaderboardEl = document.getElementById('leaderboard');
        if (!leaderboardEl) {
            console.error('Leaderboard element not found');
            return;
        }
        
        leaderboardEl.innerHTML = '';
        
        this.leaderboard.forEach((entry, index) => {
            const isCurrentUser = entry.username === this.username;
            const itemEl = document.createElement('div');
            itemEl.className = `flex justify-between p-2 rounded leaderboard-item ${isCurrentUser ? 'highlight' : ''}`;
            
            // Rank and username
            const rankEl = document.createElement('div');
            rankEl.className = 'flex items-center';
            
            // Medal for top 3
            if (index < 3) {
                const medalColors = ['text-yellow-500', 'text-gray-400', 'text-yellow-700'];
                const medalSymbols = ['🥇', '🥈', '🥉'];
                rankEl.innerHTML = `<span class="mr-2 text-lg">${medalSymbols[index]}</span>`;
            } else {
                rankEl.innerHTML = `<span class="mr-2 font-medium text-gray-500">${index + 1}.</span>`;
            }
            
            // Username
            const usernameEl = document.createElement('span');
            usernameEl.className = `${isCurrentUser ? 'font-medium text-indigo-600' : 'text-gray-700'}`;
            usernameEl.textContent = entry.username;
            rankEl.appendChild(usernameEl);
            
            // Score
            const scoreEl = document.createElement('div');
            scoreEl.className = 'font-medium text-gray-900';
            scoreEl.textContent = entry.total_clicks.toLocaleString();
            
            itemEl.appendChild(rankEl);
            itemEl.appendChild(scoreEl);
            leaderboardEl.appendChild(itemEl);
        });
    }

    createClickEffect(event) {
        // Create a color burst effect with multiple particles
        for (let i = 0; i < 12; i++) {
            this.createParticle(event.clientX, event.clientY);
        }
        
        // Create a ripple effect
        const ripple = document.createElement('div');
        const rippleSize = 20;
        const x = event.clientX - rippleSize / 2;
        const y = event.clientY - rippleSize / 2;

        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${rippleSize}px;
            height: ${rippleSize}px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
        `;

        const clickEffects = document.getElementById('clickEffects');
        if (clickEffects) {
            clickEffects.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
        
        // Create a color burst ring
        const burst = document.createElement('div');
        burst.style.cssText = `
            position: fixed;
            left: ${event.clientX - 50}px;
            top: ${event.clientY - 50}px;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            pointer-events: none;
            animation: burst 0.5s cubic-bezier(0.1, 0.7, 0.4, 1) forwards;
        `;
        
        if (clickEffects) {
            clickEffects.appendChild(burst);
            setTimeout(() => burst.remove(), 500);
        }
        
        // Add a button animation
        const button = document.getElementById('clickButton');
        if (button) {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 300);
        }
        
        // Add a flash effect to the counter
        const counter = document.getElementById('totalClicks');
        if (counter) {
            counter.classList.add('flash');
            setTimeout(() => counter.classList.remove('flash'), 300);
        }
    }
    
    createParticle(x, y, isMilestone = false) {
        const particle = document.createElement('div');
        // For milestone particles, make them larger and more colorful
        const size = isMilestone ? Math.random() * 15 + 10 : Math.random() * 8 + 4;
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const speed = isMilestone ? Math.random() * 100 + 50 : Math.random() * 60 + 30;
        const hue = isMilestone ? Math.floor(Math.random() * 60) + 40 : Math.floor(Math.random() * 360); // Gold-ish for milestones
        
        // Calculate the final position using the angle and speed
        const endX = Math.cos(angle) * speed;
        const endY = Math.sin(angle) * speed;
        
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x - size / 2}px;
            top: ${y - size / 2}px;
            width: ${size}px;
            height: ${size}px;
            background: hsla(${hue}, 100%, 60%, 0.8);
            border-radius: 50%;
            pointer-events: none;
        `;
        
        const clickEffects = document.getElementById('clickEffects');
        if (clickEffects) {
            clickEffects.appendChild(particle);
            
            // Use requestAnimationFrame for smooth animation
            let start = null;
            const duration = isMilestone ? 1200 : 800;
            
            function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                if (progress < 1) {
                    // Calculate current position
                    const currentX = endX * progress;
                    const currentY = endY * progress;
                    const opacity = 1 - progress;
                    
                    particle.style.transform = `translate(${currentX}px, ${currentY}px)`;
                    particle.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            }
            
            requestAnimationFrame(animate);
        }
    }

    async handleClick() {
        try {
            console.log('Sending click to server');
            const response = await fetch('/api/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // Send empty body
            });

            if (!response.ok) {
                console.error('Click request failed with status:', response.status);
                throw new Error('Click request failed');
            }

            const data = await response.json();
            console.log('Click response:', data);
            
            this.totalClicks = data.total_clicks;
            this.leaderboard = data.leaderboard;
            
            this.updateUI();
            this.renderLeaderboard();
            this.animateCounter();
        } catch (error) {
            console.error('Error handling click:', error);
        }
    }

    animateCounter() {
        const counter = document.getElementById('totalClicks');
        if (counter) {
            counter.style.transform = 'scale(1.1)';
            setTimeout(() => counter.style.transform = 'scale(1)', 100);
        }
    }

    updateUI() {
        const counter = document.getElementById('totalClicks');
        if (counter) {
            counter.textContent = this.totalClicks.toLocaleString();
            
            // Add special effects for milestone clicks
            if (this.totalClicks > 0 && this.totalClicks % 10 === 0) {
                this.celebrateMilestone();
            }
        }
    }
    
    celebrateMilestone() {
        // Add a special animation for milestone clicks
        const counter = document.getElementById('totalClicks');
        if (counter) {
            counter.classList.add('milestone');
            setTimeout(() => counter.classList.remove('milestone'), 1000);
        }
        
        // Create a special burst of particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create a burst of particles from the center
        for (let i = 0; i < 20; i++) {
            this.createParticle(centerX, centerY, true);
        }
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from { transform: scale(1); opacity: 0.8; }
        to { transform: scale(3.5); opacity: 0; }
    }
    
    @keyframes burst {
        0% { transform: scale(0); opacity: 0.7; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(2); opacity: 0; }
    }
    
    .pulse {
        animation: pulse 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(0.92); }
        75% { transform: scale(1.04); }
        100% { transform: scale(1); }
    }
    
    .flash {
        animation: flash 0.3s ease-out;
    }
    
    @keyframes flash {
        0% { color: #4F46E5; }
        100% { color: inherit; }
    }
    
    .milestone {
        animation: milestone 1s ease-out;
    }
    
    @keyframes milestone {
        0% { transform: scale(1); color: inherit; }
        20% { transform: scale(1.2); color: #F59E0B; }
        40% { transform: scale(1.1); color: #F59E0B; }
        60% { transform: scale(1.15); color: #F59E0B; }
        80% { transform: scale(1.1); color: #F59E0B; }
        100% { transform: scale(1); color: inherit; }
    }
`;
document.head.appendChild(style);

// Initialize the counter immediately
const counter = new ClickCounter();
window.counter = counter;

// Also initialize on DOMContentLoaded for safety
document.addEventListener('DOMContentLoaded', () => {
    if (!window.counter) {
        window.counter = new ClickCounter();
    }
});
