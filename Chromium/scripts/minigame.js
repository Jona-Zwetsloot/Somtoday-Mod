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
                <div>
                    <a data-game="the-dungeon" class="mod-setting-button"><img src="${window.getResource('images/the-dungeon.webp')}"><p>The dungeon</p></a>
                    <a data-game="the-escape" class="mod-setting-button"><img src="${window.getResource('images/the-escape.webp')}"><p>The escape</p></a>
                    <a data-game="grade-defender" class="mod-setting-button"><img src="${window.getResource('images/grade-defender.webp')}"><p>Grade defender</p></a>
                </div>
                <a id="mod-game-select-close">Annuleren</a>
            </div>
        `;
        for (const button of overlay.getElementsByTagName('a')) {
            button.addEventListener('click', function () {
                const game = this.dataset.game;
                if (game) {
                    const url = new URL(window.location);
                    url.searchParams.set('mod-play', game);
                    history.replaceState(null, '', url);

                    document.body.removeChild(overlay);

                    execute([
                        game === 'the-dungeon' ? startTheDungeon :
                            game === 'the-escape' ? startTheEscape :
                                game === 'grade-defender' ? startGradeDefender : null
                    ]);
                } else if (this.id === 'mod-game-select-close') {
                    document.body.removeChild(overlay);
                }
            });
        }

        id('mod-play-game').addEventListener('click', function () {
            document.body.appendChild(overlay);
        });

        const hashGame = window.location.hash.replace('#mod-play=', '');
        const params = new URLSearchParams(window.location.search);
        const queryGame = params.get('mod-play');
        const autoGame = hashGame || queryGame;

        if (autoGame) {
            const gameFunc =
                autoGame === 'the-dungeon' ? startTheDungeon :
                    autoGame === 'the-escape' ? startTheEscape :
                        autoGame === 'grade-defender' ? startGradeDefender : null;

            if (gameFunc) gameFunc();
        }

        if (window.location.hash === '#mod-play' && !autoGame) {
            id('mod-play-game').click();
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
}
