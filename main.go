package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func securityHeaders(next http.Handler) http.Handler {
	headers := map[string]string{
		"Content-Security-Policy":      "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
		"X-Content-Type-Options":      "nosniff",
		"X-Frame-Options":             "DENY",
		"Referrer-Policy":             "strict-origin-when-cross-origin",
		"Permissions-Policy":          "geolocation=(), microphone=(), camera=()",
		"Cross-Origin-Opener-Policy":  "same-origin",
		"Cross-Origin-Resource-Policy": "same-origin",
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		for name, value := range headers {
			w.Header().Set(name, value)
		}
		if r.TLS != nil {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	publicDir := filepath.Join(cwd, "public")
	dataDir := filepath.Join(cwd, "data")

	http.Handle("/data/", securityHeaders(http.StripPrefix("/data/", http.FileServer(http.Dir(dataDir)))))
	http.Handle("/", securityHeaders(http.FileServer(http.Dir(publicDir))))

	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("GO_PORT")
	}
	if port == "" {
		port = "8080"
	}

	addr := "0.0.0.0:" + port
	log.Printf("Go server running on http://%s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
