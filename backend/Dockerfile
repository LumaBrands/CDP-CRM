FROM python:3.12-slim

WORKDIR /app

# Copy all source code first (needed for pip install with pyproject.toml)
COPY . .

# Install dependencies
RUN pip install --no-cache-dir .

RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
