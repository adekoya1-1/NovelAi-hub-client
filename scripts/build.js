const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const root = path.resolve(__dirname, '..');
const distPath = path.join(root, 'dist');
const serverDistPath = path.join(root, 'server', 'dist');

async function build() {
  try {
    // Clean up previous builds
    console.log('Cleaning up...');
    await fs.remove(distPath);
    await fs.remove(serverDistPath);

    // Build frontend
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });

    // Create server dist directory
    await fs.ensureDir(serverDistPath);

    // Copy necessary server files
    console.log('Copying server files...');
    await fs.copy(
      path.join(root, 'server', 'src'),
      serverDistPath,
      {
        filter: (src) => {
          return !src.includes('node_modules') && !src.endsWith('.env');
        }
      }
    );

    // Copy frontend build to server dist
    console.log('Copying frontend build...');
    await fs.copy(distPath, path.join(serverDistPath, 'public'));

    // Create production .env file template
    const envTemplate = `NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=your_frontend_url_here
`;
    
    await fs.writeFile(path.join(serverDistPath, '.env.example'), envTemplate);

    console.log('Build completed successfully!');
    console.log('Remember to:');
    console.log('1. Copy .env.example to .env in the server/dist directory');
    console.log('2. Update the environment variables in .env with your production values');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
