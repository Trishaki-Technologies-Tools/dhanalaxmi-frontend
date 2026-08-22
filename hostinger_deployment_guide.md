# Deploying Dhanalaxmi Silver Luxe to Hostinger via GitHub

Hostinger makes it very easy to sync your code directly from a GitHub repository. Whenever you push to the `main` branch, Hostinger can pull the new code automatically.

Here is the exact step-by-step process to set this up for your Node.js application.

## Step 1: Push Your Code to GitHub
Ensure all your recent changes, including the `.env.production` file we created, are pushed to your GitHub repository.
> [!IMPORTANT]  
> Make sure your repository does NOT contain the `.env` files with secret keys in the public git history. Those should remain ignored. The `.env.production` is fine if it only contains the API URL, but real secrets must be manually added in Hostinger later!

## Step 2: Set up a Node.js App on Hostinger
1. Log in to your Hostinger **hPanel**.
2. If you are using **Shared Hosting / Web Hosting** (which supports Node.js), go to **Advanced -> Node.js**.
3. Create a new Node.js application:
   * **Application Mode:** Production
   * **Application URL:** `dhanalaxmi.trishaki.com` (select the subdomain)
   * **Application Startup File:** `backend/dist/server.js` (for the backend API)
   * **Application Path:** (leave it as the default generated path for this subdomain).

## Step 3: Connect GitHub to Hostinger (The Sync)
You will use Hostinger's GIT deployment feature to pull the code.
1. In hPanel, go to **Advanced -> GIT**.
2. Under "Create a New Repository", select **GitHub**.
3. You will be prompted to authenticate with GitHub and authorize Hostinger.
4. Select your `dhanalaxmi-silver-luxe` repository and the `main` branch.
5. Choose the deployment path. Usually, this should be the root of `dhanalaxmi.trishaki.com`.
6. Click **Create** or **Deploy**. Hostinger will now pull your entire project from GitHub.
> [!TIP]
> **Auto Deployment:** Hostinger will provide you with a **Webhook URL**. You can copy this URL and paste it into your GitHub Repository Settings -> Webhooks. This means every time you type `git push`, Hostinger automatically updates your live site!

## Step 4: Install Dependencies & Build (via SSH / hPanel)
Since Git only pulls the raw code, you need to run the build steps on Hostinger.
1. Open the **Terminal / SSH Access** from your Hostinger hPanel.
2. Navigate to your project folder: `cd /domains/trishaki.com/public_html/dhanalaxmi` (or whatever path you deployed to).
3. **Setup the Backend:**
   ```bash
   cd backend
   npm install --omit=dev
   npm run build
   ```
4. **Setup the Frontend:**
   ```bash
   cd ..
   npm install --omit=dev
   npm run build
   ```
> [!NOTE] 
> If you have a `.env` file that includes secret keys (like `JWT_SECRET`, `DATABASE_URL`), you must create a new `.env` file manually via the Hostinger File Manager inside your `backend/` folder and paste your production database credentials there.

## Step 5: Routing (The Most Important Part)
You are hosting a Fullstack app on one subdomain (`dhanalaxmi.trishaki.com`). You need the frontend and backend to share the same domain.
Hostinger's server (usually LiteSpeed or Apache) needs an `.htaccess` file in your root folder to correctly route requests.

Using the Hostinger **File Manager**, create a file named `.htaccess` in the root folder of your subdomain and add:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # 1. Forward ALL /api/* requests to your Node.js backend port
  # (Replace 5001 with whatever port Hostinger assigns your Node app)
  RewriteCond %{REQUEST_URI} ^/api/ [NC]
  RewriteRule ^(.*)$ http://127.0.0.1:5001/$1 [P,L]

  # 2. Forward all other frontend requests to the built static files
  RewriteCond %{DOCUMENT_ROOT}/.output/public/$1 -f
  RewriteRule ^(.*)$ .output/public/$1 [L]
  
  # 3. Fallback for TanStack Router (SPA Routing)
  RewriteRule ^(.*)$ .output/public/index.html [L]
</IfModule>
```

## Step 6: Start the Node.js App
1. Go back to **Advanced -> Node.js** in hPanel.
2. Click **Start** or **Restart** on your application.
3. Visit `https://dhanalaxmi.trishaki.com` in your browser.

If everything was set up correctly, your storefront should appear, your backend will be actively serving requests on `/api`, and `dhanalaxmi.trishaki.com/admin` will cleanly load your dashboard!
