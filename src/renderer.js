import { renderInLogin, renderInGame } from './components';

const root = document.getElementById('root');

const loginForm = renderInLogin({
    root,
    onLogin: ({text}) => {
        // After successful login, render the game
        renderInGame({
            root,
            flashUrl: text,
        });
        loginForm.remove();
    },
});