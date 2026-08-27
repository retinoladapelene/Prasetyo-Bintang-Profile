# Gunakan Python 3.10 sebagai base image (Pytorch & Pocket-TTS cocok dengan versi ini)
FROM python:3.10-slim

# Set working directory di dalam container
WORKDIR /app

# Install dependensi sistem yang dibutuhkan untuk audio processing (libsndfile)
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements
COPY requirements.txt .

# Install dependencies Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy semua file ke dalam container
COPY . .

# Expose port yang digunakan (Hugging Face Spaces menggunakan 7860)
EXPOSE 7860

# Jalankan server uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
