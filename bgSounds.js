function bgMusicPlay(page, path) {
    const audioContainer = document.createElement('div');
    audioContainer.id = 'audioContainer';
    document.body.appendChild(audioContainer);

    if (window.location.href === page) {
        audioContainer.innerHTML = `
            <audio controls autoplay loop style='display: none;'>
                <source id='audioSource' src='${path}' type='audio/mpeg'/>
            </audio>
        `;

        const audioElement = document.getElementById('audioPlayer');

        // Attempt to autoplay
        audioElement.play().catch(error => {
            console.warn('Autoplay failed:', error);

            // Listen for the next click on the body
            document.body.addEventListener('click', () => {
                audioElement.play().catch(playError => {
                    console.error('Playback failed:', playError);
                });
            }, { once: true });
        });
    } else {
        audioContainer.innerHTML = '';
    }
}
