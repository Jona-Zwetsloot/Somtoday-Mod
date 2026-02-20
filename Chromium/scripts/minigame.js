// MINIGAMES
// All minigames
function errorPage() {
    if (!n(tn('hmy-button', 0))) {
        tn('hmy-button', 0).insertAdjacentHTML('afterend', '<a id="mod-play-game">Of speel een game</a>');
        id('mod-play-game').addEventListener('click', async function () {
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
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function (e) {
                const game = e.target.dataset.game;
                if (game === 'platformer2') { document.body.removeChild(overlay); execute([startPlatformerGame]); }
                else if (game === 'platformer1') { document.body.removeChild(overlay); execute([startLegacyPlatformerGame]); }
                else if (game === 'gradedefender') { document.body.removeChild(overlay); execute([gradeDefenderGame]); }
                else if (e.target.id === 'mod-game-select-close') { document.body.removeChild(overlay); }
            });
        });
        if (window.location.hash === '#mod-play') {
            id('mod-play-game').click();
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
}