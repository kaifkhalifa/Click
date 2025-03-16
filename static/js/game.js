class ClickCounter {
    constructor() {
        this.totalClicks = 0;
        this.setupEventListeners();
        this.loadInitialCount();
    }

    setupEventListeners() {
        const clickButton = document.getElementById('clickButton');
        clickButton.addEventListener('click', () => {
            this.handleClick();
            this.createClickEffect(event);
        });
    }

    async loadInitialCount() {
        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            if (data.length > 0) {
                this.totalClicks = data[0].total_clicks;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading initial count:', error);
        }
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

        document.getElementById('clickEffects').appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        
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
        
        document.getElementById('clickEffects').appendChild(burst);
        setTimeout(() => burst.remove(), 500);
        
        // Add a button animation
        const button = document.getElementById('clickButton');
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
        
        // Add a flash effect to the counter
        const counter = document.getElementById('totalClicks');
        counter.classList.add('flash');
        setTimeout(() => counter.classList.remove('flash'), 300);
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
        
        document.getElementById('clickEffects').appendChild(particle);
        
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

    async handleClick() {
        try {
            const response = await fetch('/api/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Click request failed');

            const data = await response.json();
            this.totalClicks = data.total_clicks;
            this.updateUI();
            this.animateCounter();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    animateCounter() {
        const counter = document.getElementById('totalClicks');
        counter.style.transform = 'scale(1.1)';
        setTimeout(() => counter.style.transform = 'scale(1)', 100);
    }

    updateUI() {
        document.getElementById('totalClicks').textContent = this.totalClicks.toLocaleString();
        
        // Add special effects for milestone clicks
        if (this.totalClicks > 0 && this.totalClicks % 10 === 0) {
            this.celebrateMilestone();
        }
    }
    
    celebrateMilestone() {
        // Add a special animation for milestone clicks
        const counter = document.getElementById('totalClicks');
        counter.classList.add('milestone');
        setTimeout(() => counter.classList.remove('milestone'), 1000);
        
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

// Initialize the counter
window.addEventListener('DOMContentLoaded', () => {
    window.counter = new ClickCounter();
});
