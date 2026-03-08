// MINIGAMES
// All minigames
function errorPage() {
    if (!n(tn('hmy-button', 0))) {
        tn('hmy-button', 0).insertAdjacentHTML('afterend', '<a id="mod-play-game">Of speel een game</a>');

        const overlay = document.createElement('div');
        overlay.id = 'mod-game-select';
        overlay.innerHTML = `
            <div id="mod-game-select-box">
                <h2>Kies een game</h2>
                <a data-game="platformer2" class="mod-setting-button">Platformer v2</a>
                <a data-game="platformer1" class="mod-setting-button">Platformer v1</a>
                <a data-game="gradedefender" class="mod-setting-button">Grade Defender</a>
                <a id="mod-game-select-close">Annuleren</a>
            </div>
        `;
        overlay.addEventListener('click', function (e) {
            const game = e.target.dataset.game;
            if (game) {
                const url = new URL(window.location);
                url.searchParams.set('mod-play', game);
                history.replaceState(null, '', url);

                document.body.removeChild(overlay);

                execute([
                    game === 'platformer2' ? startPlatformerGame :
                    game === 'platformer1' ? startLegacyPlatformerGame :
                    game === 'gradedefender' ? gradeDefenderGame : null
                ]);
            } else if (e.target.id === 'mod-game-select-close') {
                document.body.removeChild(overlay);
            }
        });

        id('mod-play-game').addEventListener('click', function () {
            document.body.appendChild(overlay);
        });

        const hashGame = window.location.hash.replace('#mod-play=', '');
        const params = new URLSearchParams(window.location.search);
        const queryGame = params.get('mod-play');
        const autoGame = hashGame || queryGame;

        if (autoGame) {
            const gameFunc =
                autoGame === 'platformer2' ? startPlatformerGame :
                autoGame === 'platformer1' ? startLegacyPlatformerGame :
                autoGame === 'gradedefender' ? gradeDefenderGame : null;

            if (gameFunc) gameFunc();
        }

        if (window.location.hash === '#mod-play' && !autoGame) {
            id('mod-play-game').click();
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
}