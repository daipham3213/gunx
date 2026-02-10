/**
 * Renders the game component
 */

/**
 *  <script>
        <var swfPath = "{{env('FLASH_URL')}}Loading.swf";
        var flashvars = {user: "{{$member->Email}}", key: "{{$keyrand}}", v: "104", rand: "92386938", config: "{{$configLink}}"};
        var params = {menu: "false", scale: "noScale", allowScriptAccess: "always", wmode: "direct"};
        var attributes = {id:"gameContent", name:"Gunny 1", style:"margin:0 auto;position:relative;display:block!important"};
        swfobject.embedSWF(swfPath, "gameContent", "1000", "600", "11.8.0", "expressInstall.swf", flashvars, params, attributes);
    </script>
    <center>
        <div id="gameContent">
            <a href="{{$config['launcher_url']}}" target="_blank" style="display:flex;flex-direction:column;padding-top:100px">
                <b>Click vào đây để tải Launcher chơi game.</b>
            </a>
        </div>
    </center>>
 */

/**
 * Renders the game component inside the given root element.
 * @param {Object} params - The parameters
 * @param {HTMLElement} params.root - The root element to render the game into
 * @param {string} params.flashUrl - The URL of the Flash game SWF file
 * @returns {HTMLElement} The rendered game element
 */
const renderInGame = ({root, flashUrl}) => {
    if (!root) {
        throw new Error('Root element is required to render the game component.');
    }
    root.innerHTML = `
        <div id="game-container">
            <h2>GunX Flash Game</h2>
        </div>
    `;

    const { swfPath, flashvars } = parseLaunchUrl({launchUrl: flashUrl});
    const params = {
        menu: 'false',
        scale: 'noScale',
        allowScriptAccess: 'always',
        wmode: 'direct',
    };

    const attributes = {
        id: 'game-container',
        name: 'Gunny 1',
        style: 'margin:0 auto;position:relative;display:block!important',
    };
    const args = [
        swfPath,
        'game-container',
        '1000',
        '600',
        '11.8.0',
        'expressInstall.swf',
        flashvars,
        params,
        attributes,
        (error) => {
            console.log("SWF Embed Error:", error);
        }
    ];
    console.log("Embedding SWF with args:", args);
    swfobject.embedSWF(...args);

    return document.getElementById('flash-game');
}

/**
 * Parses the launch URL to extract the SWF path and flashvars.
 * 
 * @param {object} param0 - the parameters
 * @param {string} param0.launchUrl - the launch URL containing flashvars
 * @returns {object} An object containing the SWF path and flashvars
 */
const parseLaunchUrl = ({launchUrl}) => {
  const url = new URL(launchUrl);
  const user = url.searchParams.get('user') || '';
  const key = url.searchParams.get('key') || '';
  const v = url.searchParams.get('v') || '';
  const rand = url.searchParams.get('rand') || '';
  const config = url.searchParams.get('config') || '';

  return {
    swfPath: `${url.origin}${url.pathname}`,
    flashvars: { user, key, v, rand, config },
  };
};

export default renderInGame;