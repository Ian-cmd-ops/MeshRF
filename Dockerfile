FROM node:24-alpine

WORKDIR /app

# Install git as it's often needed for scaffolding or dependencies
RUN apk add --no-cache git

# Check if package.json exists to avoid errors on first build if it doesn't
# We don't copy specific files here because we rely on the volume mount for development
# but we might want to `npm install` if a package.json were present in the image layer.
# For now, we'll rely on the volume mount and user running npm install.

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
