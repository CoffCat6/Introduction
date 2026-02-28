package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strings"
	"syscall"
	"time"
)

type restrictedFS struct {
	fs              http.FileSystem
	allowedFiles    map[string]bool
	allowedPrefixes []string
}

func (r restrictedFS) Open(name string) (http.File, error) {
	clean := strings.TrimPrefix(path.Clean("/"+name), "/")
	if clean == "." || clean == "" {
		clean = "index.html"
	}

	if r.allowedFiles[clean] {
		return r.fs.Open(clean)
	}
	for _, prefix := range r.allowedPrefixes {
		if strings.HasPrefix(clean, prefix) {
			return r.fs.Open(clean)
		}
	}
	return nil, os.ErrNotExist
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8088"
	}

	server := &http.Server{
		Addr: ":" + port,
		Handler: http.FileServer(restrictedFS{
			fs: http.Dir("."),
			allowedFiles: map[string]bool{
				"index.html":  true,
				"main.js":     true,
				"styles.css":  true,
				"config.json": true,
				"i18n.json":   true,
			},
			allowedPrefixes: []string{"assets/"},
		}),
	}

	shutdownErr := make(chan error, 1)
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
		<-sigCh

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		shutdownErr <- server.Shutdown(ctx)
	}()

	log.Printf("Starting local server on http://localhost:%s/", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}

	if err := <-shutdownErr; err != nil {
		log.Printf("Server shutdown error: %v", err)
	}
}
