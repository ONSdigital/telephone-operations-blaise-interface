import fs from 'fs';
import path from 'path';

const htmlPath = path.join(process.cwd(), 'build/client/index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace the app-config script with window variables
const oldScript = `    <script
      id="app-config"
      type="application/json"
    >
      <%- typeof appConfigJson === 'string' ? appConfigJson : '' %>
    </script>`;

const newScript = `    <script>
      // Passing in variables from express to the react app
      window.VM_EXTERNAL_CLIENT_URL = "<%= clientUrl %>";
      window.CATI_DASHBOARD_URL = "<%= dashboardUrl %>";
    </script>`;

html = html.replace(oldScript, newScript);

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Fixed HTML template variables');
