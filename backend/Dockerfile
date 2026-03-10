FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code
COPY . .

RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
