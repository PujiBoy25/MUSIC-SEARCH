const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const resultsContainer = document.getElementById('resultsContainer');
const lyricsModal = new bootstrap.Modal(document.getElementById('lyricsModal'));
const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
const lyricsContent = document.getElementById('lyricsContent');
const detailBody = document.getElementById('detailBody');

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = queryInput.value.trim();
  if (!query) return;

  resultsContainer.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&country=ID&limit=20`);
    const data = await response.json();

    if (!data.results.length) {
      resultsContainer.innerHTML = '<p>Tidak ada hasil ditemukan.</p>';
      return;
    }

    window.lastSearchResults = data.results;

    resultsContainer.innerHTML = '';
    data.results.forEach((song, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-3';

      col.innerHTML = `
        <div class="card h-100">
          ${song.artworkUrl100 ? `<img src="${song.artworkUrl100}" class="card-img-top" alt="${song.trackName}">` : ''}
          <div class="card-body">
            <h5 class="card-title">${song.trackName}</h5>
            <p class="card-text">${song.artistName}</p>
            ${song.previewUrl ? `
            <audio controls class="w-100">
              <source src="${song.previewUrl}" type="audio/mpeg">
            </audio>` : `<p class="text-muted">Preview tidak tersedia</p>`}
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-outline-primary btn-sm btn-lyrics" data-artist="${song.artistName}" data-title="${song.trackName}">Lihat Lirik</button>
              <button class="btn btn-outline-secondary btn-sm btn-detail" data-index="${index}">Detail</button>
            </div>
          </div>
        </div>
      `;

      resultsContainer.appendChild(col);
    });

  } catch (error) {
    resultsContainer.innerHTML = '<p>Terjadi kesalahan saat memuat data.</p>';
    console.error(error);
  }
});

resultsContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-lyrics')) {
    const btn = e.target;
    const artist = btn.getAttribute('data-artist');
    const title = btn.getAttribute('data-title');

    lyricsContent.textContent = 'Memuat lirik...';
    lyricsModal.show();

    try {
      const lyricsResponse = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (!lyricsResponse.ok) throw new Error('Lirik tidak ditemukan');
      const lyricsData = await lyricsResponse.json();
      lyricsContent.textContent = lyricsData.lyrics || 'Lirik tidak ditemukan.';
    } catch (err) {
      lyricsContent.textContent = 'Lirik tidak ditemukan.';
    }
  }

  if (e.target.classList.contains('btn-detail')) {
    const btn = e.target;
    const index = btn.getAttribute('data-index');
    if (!window.lastSearchResults) return;

    const song = window.lastSearchResults[index];
    detailBody.innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>Judul:</strong> ${song.trackName}</li>
        <li class="list-group-item"><strong>Artis:</strong> ${song.artistName}</li>
        <li class="list-group-item"><strong>Album:</strong> ${song.collectionName || '-'}</li>
        <li class="list-group-item"><strong>Tanggal Rilis:</strong> ${new Date(song.releaseDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</li>
        <li class="list-group-item"><strong>Genre:</strong> ${song.primaryGenreName || '-'}</li>
      </ul>
    `;
    detailModal.show();
  }
});

// Menjalankan pencarian otomatis saat halaman pertama kali dimuat
window.addEventListener('DOMContentLoaded', () => {
  const defaultQuery = "When I Was Your Man";
  queryInput.value = defaultQuery; // Isi input pencarian
  searchForm.dispatchEvent(new Event('submit')); // Jalankan pencarian otomatis
  queryInput.value = ""; // Kosongkan input setelah submit
});

