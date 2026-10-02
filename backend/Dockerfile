# ==========================================
# Backend Dockerfile - SMK Al Amanah
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma engine support on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY src ./src/

# Create volume mount point for database file persistence
VOLUME /app/prisma

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Entrypoint script: ensure database is pushed/ready and run seed if needed, then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/server.js"]
