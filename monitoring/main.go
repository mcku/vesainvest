package main

import (
	"context"
	"html/template"
	"log"
	"net/http"
	"time"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

// MonitoringRequest represents a request to monitor an address or token.
type MonitoringRequest struct {
	User        string    `firestore:"user"`
	Date        time.Time `firestore:"date"`
	RequestType string    `firestore:"request_type"`
	Subject     string    `firestore:"subject"`
}

// BlacklistItem represents an item in the blacklist.
type BlacklistItem struct {
	SubjectType string    `firestore:"subject_type"`
	Subject     string    `firestore:"subject"`
	Reason      string    `firestore:"reason"`
	Date        time.Time `firestore:"date"`
	Status      string    `firestore:"status"`
}

var templates = template.Must(template.ParseGlob("templates/*.html"))

func main() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error creating client: %v\n", err)
	}
	defer client.Close()

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		var monitoringRequests []MonitoringRequest
		iter := client.Collection("monitoring_requests").Documents(ctx)
		for {
			doc, err := iter.Next()
			if err != nil {
				break
			}
			var req MonitoringRequest
			doc.DataTo(&req)
			monitoringRequests = append(monitoringRequests, req)
		}
		templates.ExecuteTemplate(w, "index.html", monitoringRequests)
	})

	http.HandleFunc("/monitor", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		req := MonitoringRequest{
			User:        "testuser", // In a real app, get the user from the request
			Date:        time.Now(),
			RequestType: r.FormValue("request_type"),
			Subject:     r.FormValue("subject"),
		}

		_, _, err := client.Collection("monitoring_requests").Add(ctx, req)
		if err != nil {
			log.Printf("Failed to add monitoring request: %v", err)
			http.Error(w, "Failed to add monitoring request", http.StatusInternalServerError)
			return
		}

		log.Printf("New monitoring request: %+v", req)

		http.Redirect(w, r, "/", http.StatusSeeOther)
	})

	http.HandleFunc("/blacklist", func(w http.ResponseWriter, r *http.Request) {
		var blacklist []BlacklistItem
		iter := client.Collection("blacklist").Documents(ctx)
		for {
			doc, err := iter.Next()
			if err != nil {
				break
			}
			var item BlacklistItem
			doc.DataTo(&item)
			blacklist = append(blacklist, item)
		}
		templates.ExecuteTemplate(w, "blacklist.html", blacklist)
	})

	http.HandleFunc("/blacklist/add", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Redirect(w, r, "/blacklist", http.StatusSeeOther)
			return
		}

		item := BlacklistItem{
			SubjectType: r.FormValue("subject_type"),
			Subject:     r.FormValue("subject"),
			Reason:      r.FormValue("reason"),
			Date:        time.Now(),
			Status:      "active",
		}

		_, _, err := client.Collection("blacklist").Add(ctx, item)
		if err != nil {
			log.Printf("Failed to add blacklist item: %v", err)
			http.Error(w, "Failed to add blacklist item", http.StatusInternalServerError)
			return
		}

		log.Printf("New blacklist item: %+v", item)

		http.Redirect(w, r, "/blacklist", http.StatusSeeOther)
	})

	log.Println("Starting server on :8082")
	if err := http.ListenAndServe(":8082", nil); err != nil {
		log.Fatal(err)
	}
}