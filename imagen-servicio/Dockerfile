FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY main.go .
RUN go mod init image-proxy && go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o imaglim-go main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/imaglim-go .
RUN chmod +x /app/imaglim-go

RUN mkdir -p /app/photos

EXPOSE 14771

ENV PORT=14771
ENV GOOGLE_MAPS_API_KEY=AIzaSyBsup_X4cG3AstLomRcc34SaBT1xeUp2Qs

VOLUME /app/photos

CMD ["./imaglim-go"]