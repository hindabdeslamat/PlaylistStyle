const songForm = document.getElementById("song-form");
const playlistEl = document.getElementById("playlist");

const songTitleInput = document.getElementById("song-title");
const songArtistInput = document.getElementById("song-artist");
const songMoodSelect = document.getElementById("song-mood");
const songTimeInput = document.getElementById("song-time");
const songUrlInput = document.getElementById("song-url");

const mainAudioPlayer = document.getElementById("main-audio-player");
const nowPlaying = document.getElementById("now-playing");
const alertBox = document.getElementById("alert-box");

let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.style.display = "block";
  setTimeout(() => alertBox.style.display = "none", 3000);
}

function renderPlaylist() {
  playlistEl.innerHTML = "";

  if (playlist.length === 0) {
    playlistEl.innerHTML = "<li>Aucune chanson ajoutée.</li>";
    nowPlaying.textContent = "";
    mainAudioPlayer.src = "";
    return;
  }

  playlist.sort((a, b) => a.time.localeCompare(b.time));

  playlist.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="song-info">
        🎵 <strong>${song.title}</strong> - ${song.artist} [${song.mood}]
        <br /><audio controls src="${song.url}"></audio>
      </div>
      <div class="song-time">🕒 ${song.time}</div>
      <button aria-label="Supprimer" data-index="${index}" class="delete-btn">🗑️</button>
    `;
    playlistEl.appendChild(li);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      playlist.splice(idx, 1);
      localStorage.setItem("playlist", JSON.stringify(playlist));
      renderPlaylist();
      showAlert("Chanson supprimée !");
    })
  );
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function playCurrentScheduledSong() {
  if (playlist.length === 0) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const tolerance = 5;

  const song = playlist.find((s) =>
    Math.abs(timeToMinutes(s.time) - currentMinutes) <= tolerance
  );

  if (song && mainAudioPlayer.src !== song.url) {
    mainAudioPlayer.src = song.url;
    mainAudioPlayer.play().catch(() => {});
    nowPlaying.textContent = `Lecture : ${song.title} - ${song.artist}`;
  } else if (!song) {
    nowPlaying.textContent = "";
  }
}

songForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = songTitleInput.value.trim();
  const artist = songArtistInput.value.trim();
  const mood = songMoodSelect.value;
  const time = songTimeInput.value;
  const url = songUrlInput.value.trim();

  if (!title || !artist || !mood || !time || !url) return alert("Tous les champs sont requis.");

  playlist.push({ title, artist, mood, time, url });
  localStorage.setItem("playlist", JSON.stringify(playlist));

  renderPlaylist();
  playCurrentScheduledSong();
  showAlert("✅ Chanson ajoutée !");
  songForm.reset();
});

renderPlaylist();
playCurrentScheduledSong();
setInterval(playCurrentScheduledSong, 60 * 1000);
