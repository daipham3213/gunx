// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import fs from 'fs';
import path from 'path';
import { contextBridge, app } from 'electron';

const _DEFAULT_CONFIG = {
    serverId: '1001',
    loginUrl: 'https://api-launcher.mux0.dev/login.php',
};


/**
*   Perform login by sending a POST request to the login URL
*   with the provided username and password.
*   
*   Returns a promise that resolves to an object containing
*   the response status and text.
*   
*   @param {Object} params - The login parameters
*   @param {string} params.username - The username
*   @param {string} params.password - The password
*   @returns An object with the response status and text
*/
const login = async ({ username, password }) => {
    const config = await getConfig();

    const formdata = new FormData();
    formdata.append('txtusername', username ?? '');
    formdata.append('txtpassword', password ?? '');
    formdata.append('server', config.serverId);

    const requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
    };

    try {
        const response = await fetch(config.loginUrl, requestOptions);
        const text = (await response.text()).trim();

        // the text must include the "Loading.swf" to be considered a successful login
        if (response.ok && text.includes('Loading.swf')) {
            return {
                ok: true,
                status: response.status,
                text,
            };
        }
        return {
            ok: false,
            status: response.status,
            error: text,
            text: ""
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            text: '',
            error: error instanceof Error ? error.message : String(error),
        };
    }
};


/** 
 *  Load config.json file in the app's directory
 *  and expose its content via the preload script
 *  to the renderer process.
 *
 *  Returns an object with the config data.
 *  @returns {Object} The config data
 */
const getConfig = async () => {
    const configDir = path.join(
        __dirname.includes('.asar') ? process.resourcesPath : process.cwd(),
        'config.json'
    );
    try {
        const data = await fs.promises.readFile(configDir, 'utf-8');
        const config = JSON.parse(data);
        return {
            ..._DEFAULT_CONFIG,
            ...config,
        };
    } catch (error) {
        return _DEFAULT_CONFIG;
    }

}

/**
 * Expose protected methods that allow the renderer process
 * to use the login and getConfig functions
 * without exposing the entire Electron API.
 */
contextBridge.exposeInMainWorld('launcherApi', {
    login,
    getConfig,
});