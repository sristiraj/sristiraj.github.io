// LinkedIn API Integration
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2/me';
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/people/~';
const LINKEDIN_SKILLS_URL = 'https://api.linkedin.com/v2/people/~:(skills)';
const LINKEDIN_EXPERIENCE_URL = 'https://api.linkedin.com/v2/people/~:(positions)';

// LinkedIn API Configuration
const LINKEDIN_CONFIG = {
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: window.location.origin,
    scope: ['r_liteprofile', 'r_emailaddress']
};

// Initialize LinkedIn SDK
function initLinkedIn() {
    return new Promise((resolve, reject) => {
        // Load LinkedIn SDK
        const script = document.createElement('script');
        script.src = 'https://platform.linkedin.com/in.js';
        script.text = `
            api_key: ${LINKEDIN_CONFIG.clientId}
            authorize: true
            scope: ${LINKEDIN_CONFIG.scope.join(' ')}
        `;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Fetch LinkedIn Profile Data
async function fetchLinkedInData() {
    try {
        // Initialize LinkedIn SDK
        await initLinkedIn();

        // Fetch profile data
        const [profile, skills, experience] = await Promise.all([
            fetchProfile(),
            fetchSkills(),
            fetchExperience()
        ]);

        // Update the UI with fetched data
        updateProfileUI(profile, skills, experience);
    } catch (error) {
        console.error('Error fetching LinkedIn data:', error);
        useStaticContent();
    }
}

// Fetch basic profile
async function fetchProfile() {
    const response = await fetch(LINKEDIN_PROFILE_URL, {
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

// Fetch skills
async function fetchSkills() {
    const response = await fetch(LINKEDIN_SKILLS_URL, {
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

// Fetch experience
async function fetchExperience() {
    const response = await fetch(LINKEDIN_EXPERIENCE_URL, {
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

// Update UI with LinkedIn data
function updateProfileUI(profile, skills, experience) {
    // Update summary
    const summaryElement = document.getElementById('linkedin-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `<p>${profile.summary || 'Professional summary from LinkedIn'}</p>`;
    }

    // Update experience
    const experienceElement = document.getElementById('linkedin-experience');
    if (experienceElement && experience.positions) {
        experienceElement.innerHTML = experience.positions.values
            .map(position => `
                <div class="experience-item">
                    <h4>${position.title} at ${position.company.name}</h4>
                    <ul>
                        ${position.summary ? `<li>${position.summary}</li>` : ''}
                        ${position.responsibilities ? `<li>${position.responsibilities}</li>` : ''}
                    </ul>
                </div>
            `)
            .join('');
    }

    // Update skills
    const skillsElement = document.getElementById('linkedin-skills');
    if (skillsElement && skills.skills) {
        skillsElement.innerHTML = skills.skills.values
            .map(skill => `
                <div class="competency-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${skill.name}</span>
                </div>
            `)
            .join('');
    }
}

// Get access token from localStorage or initiate OAuth flow
function getAccessToken() {
    const token = localStorage.getItem('linkedin_access_token');
    if (!token) {
        // Initiate OAuth flow
        IN.User.authorize(() => {
            IN.API.Profile("me").result((data) => {
                // Store token and fetch data
                localStorage.setItem('linkedin_access_token', data.accessToken);
                fetchLinkedInData();
            });
        });
    }
    return token;
}

// Fallback to static content
function useStaticContent() {
    console.log('Using static content as fallback');
    // You can implement a fallback mechanism here
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we have a LinkedIn access token
    if (localStorage.getItem('linkedin_access_token')) {
        fetchLinkedInData();
    } else {
        // Show login button or handle OAuth flow
        console.log('LinkedIn authentication required');
    }
}); 