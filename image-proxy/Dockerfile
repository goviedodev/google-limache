FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
RUN pip install --no-cache-dir flask requests

# Copiar archivos
COPY app.py .

# Crear directorio de fotos
RUN mkdir -p /app/photos/downloads

# Puerto del servicio
EXPOSE 14771

# Comando de inicio
CMD ["python", "app.py"]