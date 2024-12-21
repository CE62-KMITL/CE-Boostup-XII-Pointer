# CE Boostup XII Point Tracking System
This project contains a full-stack application with PocketBase as the backend and SvelteKit as the frontend. The frontend project files is in the root project folder, and the backend project files is in the `pocketbase` folder.


## Running a Development Server

### Intalling Dependencies
If this is the first time you're running the server, first install the dependencies using the following commands:
  - Frontend : in project root run: `pnpm install`
  - Backend : the dependencies will be automatically installed upon a launch of the development server

### Starting the Server
  - Frontend : in project root run `pnpm run dev` to start a development server which will automatically reload upon file changes, or `pnpm run preview` to start a development server in production mode, this allow to test code that may behave differently in development and production mode, so far this code base does not contains code with such behavior
  - Backend : in `pocketbase` folder run `go run . serve` to start a development server, since go is a compiled language, this server will NOT automatically reload upon file changes, you'll have to restart the server manually


## Deployment
After configuring the application, simply run `docker compose up -d --build` to start the application.


## Usages and Flows

### Staffs
  - Signin: Use OAuth signin from the `Staff` button located on the top-right
  - Create participant: Scan a QR Code attached to a name tag, if the QR Code have not been associated with any participant before, you will be taken to a participant creation page
  - Change info about the participant (add score, mark claimed items, etc.): Scan the QR Code for said participant, you will be taken to a participant action page

### Participants
  - View information about themselves: Scan the QR Code on their name tag, the information will be displayed in realtime

### Admin
  - QR Codes creation: To create QR Codes for participants, simply generate a random 15 letters id containing lowercase characters and numbers for each participant, then generate the QR Code with the URL `{ORIGIN}/participants/{id}`, when the QR Code get scanned, it will either navigate to the participant creation page if the QR Code was never associated with a participant, or to the action page if it was previously associated
  - Adding groups and items: Use the PocketBase admin interface to manually add the groups and the items


## Configurations

### .env
The .env file for development is only used by the frontend (located in project root) and is loaded by Vite, refer to [Vite's documentation](https://vite.dev/guide/env-and-mode) on how they're loaded. The .env file for deployment must be named `.env.production` to be loaded correctly.

key : description (type)
  - ORIGIN : The origin URL for the application, this is used by SvelteKit for CSRF prevention (string)
  - HOST : The host/address the server will listen on, set to `0.0.0.0` to listen on all available addresses (string)
  - PORT : The port the server will listen on (number)
  - PUBLIC_ORIGIN : The origin URL for the application, this is used by client side JavaScript codes when it needs to know the origin
  - PUBLIC_POCKETBASE_URL : The URL for the PocketBase instance that is accessible by both the frontend server and the client
  - PUBLIC_OAUTH_REDIRECT_URL : The URL that the user will be redirect to for OAuth, this must match with the OAuth provider setting and the PocketBase setting

### pocketbase/staffs-data.secret.json
This file contains the staff data, the application is designed so that only users in the staffs data are able to sign in, this is the only permission separation mechanic, the participants cannot sign in.

The format for the data is an array of all staffs for the event, each item in the array is an object with the following keys: `nickName_th`, `fullName_en`, `email_university` Example:
```json
[
    {
        "nickName_th": "ตัวอย่าง",
        "fullName_en": "Example Name",
        "email_university": "66010000@kmitl.ac.th",
    },
    {
        "nickName_th": "ต้น",
        "fullName_en": "สมชาย บุญดี",
        "email_university": "66019999@kmitl.ac.th",
    }
]
```

### OAuth Provider
This application was design with Google OAuth as the only authentication method, you'll need to configure an OAuth application on [Google Cloud Console](https://console.cloud.google.com). You can set the application to be internal access only to avoid having to deal with Google's approval. Remember to set the correct value for Authorized JavaScript Origins, Authorized redirect URIs and Authorized domains otherwise the OAuth sign in may fail.

### PocketBase
The PocketBase configuration cannot be easily loaded automatically, you'll need to set it up yourself, here are the steps:
  1. Access the admin panel for PocketBase at `{PocketBaseURL}/_`, with the default configuration this will be at https://pointer.ceboostup.com/pocketbase/_
  2. Create an admin account of login using previously created admin account
  3. Navigate to the settings page
  4. Change the `Application name` and `Application URL` to their appropriate values
  5. Use the `Import collections` menu in the settings page to load the `pocketbase/pb_schema.json` file
  6. Enable Google OAuth provider with the configuration values from [Google Cloud Console](https://console.cloud.google.com)
  7. Create groups for the participants using the collections page
  8. Create items that participants can claim using the collections page
  9. Pray that it works

To create a participant with a particular id, navigate to `{Origin}/participants/{id}`, you will be met with a participant creation page.

### Reverse Proxy
With the default configuration, both the frontend and the backend application will be running on the same domain, this will cause conflict without a reverse proxy. The reverse proxy have to redirect requests to the correct application and rewrite the url if there's any prefix for any of the application. The follwing is an example for nginx configuration using the default domain configuration:
```
upstream sveltekit {
    zone upstreams 64K;
    server 127.0.0.1:5173 max_fails=1 fail_timeout=2s;
    keepalive 2;
}

upstream pocketbase {
    zone upstreams 64K;
    server 127.0.0.1:8090 max_fails=1 fail_timeout=2s;
    keepalive 2;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    http2 on;

    server_name pointer.ceboostup.com;

    ssl_certificate /etc/sslcerts/ceboostup.com.pem;
    ssl_certificate_key /etc/sslcerts/ceboostup.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  1d;
    ssl_session_tickets  off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    client_max_body_size 100M;

    add_header Strict-Transport-Security "max-age=15552000" always;

    location /pocketbase {
        rewrite /pocketbase/(.*) /$1  break;
        proxy_pass http://pocketbase;
        proxy_http_version 1.1;
        proxy_set_header "Connection" "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host:$server_port;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_connect_timeout 180;
        proxy_read_timeout    180;
        proxy_send_timeout    180;
        send_timeout          180;
    }

    location / {
        proxy_pass http://sveltekit;
        proxy_http_version 1.1;
        proxy_set_header "Connection" "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host:$server_port;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_connect_timeout 180;
        proxy_read_timeout    180;
        proxy_send_timeout    180;
        send_timeout          180;
    }
}

server {
    listen 80;

    server_name pointer.ceboostup.com;

    location / {
        return 301 https://$host$request_uri;
    }
}
```
