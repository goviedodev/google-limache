FROM alpine:latest

# Instalar dependencias
RUN apk add --no-cache curl go bash

# Descargar cloudflared
RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

WORKDIR /app

# Copiar código fuente Go
COPY main.go go.mod go.sum ./

# Compilar el servicio
RUN go build -o imaglim-go main.go

# Crear directorio de fotos
RUN mkdir -p /app/photos

# Puerto interno
EXPOSE 5000

ENV PORT=5000
ENV GOOGLE_MAPS_API_KEY=AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs

VOLUME /app/photos

# Copiar entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]