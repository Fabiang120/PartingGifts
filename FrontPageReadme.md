## Parting Gifts

A full-stack web application for sharing scheduled digital gifts with loved ones. This project includes a Go-based backend and a Next.js-based frontend, working together to allow users to upload digital gifts, manage delivery schedules, and send secure email notifications.

## Overview

Users can:
Create accounts and manage credentials securely
Upload digital gifts (files) to the platform
Assign gifts to recipients with scheduled delivery
Receive email notifications upon delivery

## Project Structure
├── /backend          # Go server and API logic
├── /frontend         # Next.js frontend


## Prerequisites


Backend Requirements:

Go (latest version recommended)

SQLite3

Frontend Requirements:

Node.js & npm (v18+ recommended)


## Backend Setup

1. Clone the repository
    git clone https://github.com/yourusername/parting-gifts.git
    cd parting-gifts/backend
2. Install Go Dependencies and Go Mail
    go mod tidy
    go get gopkg.in/gomail.v2
3.  Configure SMTP credentials
    Open main.go and set the following:
    smtpHost := "smtp.gmail.com"
    smtpPort := 587
    senderEmail := "your-email@gmail.com"
    senderPassword := "your-app-password"
    Ensure you allow App Passwords or enable less secure app access for Gmail.
4.  Run the backend server
    go run main.go
    Access at: http://localhost:8080

    
## Frontend Setup
1. Go to directory
    cd ../frontend
2. Install dependecies
    npm install
3.  Start the development server
    npm run dev
    The frontend runs on: http://localhost:3000

## Frontend Dependencies

See the full list of dependencies and installation command below:

Installation
npm install \
@babel/runtime \
@radix-ui/react-checkbox \
@radix-ui/react-label \
@radix-ui/react-navigation-menu \
@radix-ui/react-slot \
@react-pdf/renderer \
@react-three/drei \
@react-three/fiber \
@scarf/scarf \
@tiptap/extension-color \
@tiptap/extension-highlight \
@tiptap/extension-text-style \
@tiptap/extension-underline \
@tiptap/react \
@tiptap/starter-kit \
class-variance-authority \
clsx \
cookie \
date-fns \
formdata-node \
gsap \
html-to-pdfmake \
jspdf \
lucide-react \
next \
qs \
react \
react-dom \
react-icons \
swagger-ui-dist \
swagger-ui-react \
tailwind-merge \
tailwindcss-animate \
three \
tiptap \
tiptap-extension-font-size \
traverse \
-D \
@babel/code-frame \
@babel/core \
@babel/helper-validator-identifier \
@babel/preset-env \
@babel/preset-react \
@testing-library/dom \
@testing-library/jest-dom \
@testing-library/react \
@testing-library/user-event \
@types/aria-query \
@types/debug \
@types/estree \
@types/node \
@types/react \
@types/react-dom \
@vitejs/plugin-react \
@vitest/browser \
@vitest/expect \
@vitest/mocker \
@vitest/pretty-format \
@vitest/runner \
@vitest/snapshot \
@vitest/spy \
@vitest/ui \
@vitest/utils \
ansi-regex \
ansi-styles \
aria-query \
assertion-error \
autop \
autoprefixer \
babel-loader \
cac \
chai \
check-error \
chalk \
color-convert \
color-name \
debug \
deep-eql \
dequal \
dom-accessibility-api \
es-module-lexer \
esbuild \
estree-walker \
expect-type \
fsevents \
has-flag \
js-tokens \
jsdom \
loupe \
lz-string \
magic-string \
ms \
nanoid \
pathe \
pathval \
picocolors \
postcss \
react-is \
regenerator-runtime \
rollup \
scheduler \
siginfo \
source-map-js \
stackback \
std-env \
tinybench \
tinyexec \
tinypool \
tinyrainbow \
tinyspy \
vite \
vite-node \
vitest \
why-is-node-running