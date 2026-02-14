FROM golang:1.25-alpine3.22 AS builder

ENV CGO_ENABLED=1

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o main

FROM alpine:latest AS runner

# production or development
ENV GO_ENV=production
# release or debug
ENV GIN_MODE=release

WORKDIR /app

COPY --from=builder  /app/main .

EXPOSE 8080

CMD [ "./main" ]