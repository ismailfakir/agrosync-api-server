FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Populates the DB with initial roles/admin.
# RUN npm run seed 
# Vite build creates a 'dist' folder
RUN npm run build

EXPOSE 3000

# Vite production build typically outputs a single JS file or standard entry
# Depending on your Vite config, you might point to dist/main.js
CMD ["node", "dist/server.js"]