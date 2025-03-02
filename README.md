# Kids Learning Hub

An interactive educational website for 7-year-old children in Grade 2, featuring dynamically generated exercises in English, Math, and Science using Anthropic Claude API integration.

## Website

Visit the live website at: [antonchernyshev.ca](https://antonchernyshev.ca)

## Repository

GitHub Repository: [github.com/AntonIChernyshev/learning_by_grade](https://github.com/AntonIChernyshev/learning_by_grade)

## Features

- Interactive exercises for different subjects (English, Math, Science)
- Difficulty levels (easy, medium, hard)
- Hint system to help children learn
- Answer checking functionality
- Child-friendly, colorful UI
- LLM integration for generating age-appropriate content

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js (via Next.js API routes)
- **LLM Integration**: Anthropic Claude API

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AntonIChernyshev/learning_by_grade.git
   cd kids-learning-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your LLM API key:
   ```
   LLM_API_KEY=your-api-key-here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment on Digital Ocean

### Prerequisites

- Digital Ocean account
- Ubuntu Droplet
- Domain name configured to point to your Droplet's IP address

### Server Setup

1. SSH into your Digital Ocean Droplet:
   ```bash
   ssh root@your-droplet-ip
   ```

2. Update the system:
   ```bash
   apt update && apt upgrade -y
   ```

3. Install Node.js and npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   ```

4. Install Nginx:
   ```bash
   apt install nginx -y
   ```

5. Configure the firewall:
   ```bash
   ufw allow 'Nginx Full'
   ufw allow OpenSSH
   ufw enable
   ```

### Application Deployment

1. Create a directory for the application:
   ```bash
   mkdir -p /var/www/kids-learning-hub
   ```

2. Clone the repository:
   ```bash
   cd /var/www/kids-learning-hub
   git clone https://github.com/AntonIChernyshev/learning_by_grade.git .
   ```

3. Install dependencies and build the application:
   ```bash
   npm install
   npm run build
   ```

4. Create a `.env` file with your LLM API key:
   ```bash
   echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
   ```

5. Install PM2 to manage the Node.js process:
   ```bash
   npm install -g pm2
   ```

6. Start the application with PM2:
   ```bash
   pm2 start npm --name "kids-learning-hub" -- start
   pm2 startup
   pm2 save
   ```

### Nginx Configuration

1. Create an Nginx configuration file:
   ```bash
   nano /etc/nginx/sites-available/kids-learning-hub
   ```

2. Add the following configuration (replace with your actual domain if not using antonchernyshev.ca):
   ```nginx
   server {
       listen 80;
       server_name antonchernyshev.ca www.antonchernyshev.ca;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the site:
   ```bash
   ln -s /etc/nginx/sites-available/kids-learning-hub /etc/nginx/sites-enabled/
   ```

4. Test the Nginx configuration:
   ```bash
   nginx -t
   ```

5. Restart Nginx:
   ```bash
   systemctl restart nginx
   ```

### SSL Configuration with Let's Encrypt

1. Install Certbot:
   ```bash
   apt install certbot python3-certbot-nginx -y
   ```

2. Obtain an SSL certificate:
   ```bash
   certbot --nginx -d antonchernyshev.ca -d www.antonchernyshev.ca
   ```

3. Follow the prompts to complete the SSL setup.

4. Certbot will automatically update your Nginx configuration to use HTTPS.

## Maintenance

- Update the application:
  ```bash
  cd /var/www/kids-learning-hub
  git pull
  npm install
  npm run build
  pm2 restart kids-learning-hub
  ```

- Monitor the application:
  ```bash
  pm2 status
  pm2 logs kids-learning-hub
  ```

## Customization

- To add more subjects, modify the navigation in `components/Layout.tsx` and create corresponding pages.
- To customize the appearance, modify the Tailwind configuration in `tailwind.config.js` and the global styles in `styles/globals.css`.
- To adjust the LLM prompts, modify the API endpoints in `pages/api/`.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 