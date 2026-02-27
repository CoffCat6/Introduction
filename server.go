package main

import (
	"log"
	"net/http"
)

func main() {
	port := "8088"
	log.Printf("Starting local server on http://localhost:%s/", port)
	err := http.ListenAndServe(":"+port, http.FileServer(http.Dir(".")))
	if err != nil {
		log.Fatal(err)
	}
}
