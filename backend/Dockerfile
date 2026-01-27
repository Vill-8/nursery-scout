FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libnspr4 libnss3 libdbus-1-3 libatk1.0-0 libxkbcommon0 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements
COPY requirements.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright
RUN python -m playwright install chromium

# Copy only backend code (COPY . . will only copy contents of backend folder since this is backend/Dockerfile)
COPY *.py ./
COPY Procfile .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
