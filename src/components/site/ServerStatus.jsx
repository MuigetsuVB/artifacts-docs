<div class="server-status loading" id="server-status-container">
  Loading server status...
</div>

<script>
  interface ServerStatus {
    season: number;
    players_online: number;
    season_start: string;
    season_end: string;
  }

  const container = document.getElementById('server-status-container');

  async function fetchServerStatus() {
    try {
      const response = await fetch('https://api.artifactsmmo.com/');
      const data = await response.json();
      const status: ServerStatus = data.data;

      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const html = `
        <h3>Current Server Status</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">Season:</span>
            <span class="value">Season ${status.season}</span>
          </div>
          <div class="status-item">
            <span class="label">Players Online:</span>
            <span class="value">${status.players_online}</span>
          </div>
          <div class="status-item">
            <span class="label">Season Start:</span>
            <span class="value">${formatDate(status.season_start)}</span>
          </div>
          <div class="status-item">
            <span class="label">Season End:</span>
            <span class="value">${formatDate(status.season_end)}</span>
          </div>
        </div>
        <p class="status-footer">Last updated: ${new Date().toLocaleTimeString()}</p>
      `;

      if (container) {
        container.innerHTML = html;
        container.classList.remove('loading');
      }
    } catch (error) {
      console.error('Failed to fetch server status:', error);
      if (container) {
        container.innerHTML = '<div class="error">Failed to load server status</div>';
        container.classList.remove('loading');
      }
    }
  }

  fetchServerStatus();
  // Refresh every 30 seconds
  setInterval(fetchServerStatus, 30000);
</script>
