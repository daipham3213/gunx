/**
 * GunX Login Component. Used to render the login form.
 * 
 */

/**
 * Render the login form inside the given root element.
 * @param {Object} params - The parameters
 * @param {HTMLElement} params.root - The root element to render the form into
 */
const renderLoginForm = ({root, onLogin}) => {
    if (!root) {
        throw new Error('Root element is required to render the login form.');
    }

    root.innerHTML = `
        <div id="login-container">
            <h2>Login to GunX</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Login</button>
            </form>
            <div id="login-message"></div>
        </div>
    `;

    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        loginMessage.textContent = 'Logging in...';

        const result = await window.launcherApi.login({ username, password });
        if (result.ok) {
            onLogin(result);
        } else {
            loginMessage.textContent = `${result.error || 'Unknown error'}`;
        }
    });
    return document.getElementById('login-container');
};

export default renderLoginForm;