FROM golang:latest AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 go build -o pocketbase

FROM alpine:latest AS runtime

RUN apk --no-cache add ca-certificates tzdata curl && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=build /app/pocketbase pocketbase
COPY staffs-data.secret.json staffs-data.secret.json

EXPOSE 8090

CMD ["pocketbase", "serve", "--http=127.0.0.1:8090"]
