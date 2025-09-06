package monitoring

import (
	"context"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"google.golang.org/api/iterator"
)

type MonitoringRequest struct {
	User        string    `firestore:"user" json:"User"`
	Date        time.Time `firestore:"date" json:"Date"`
	RequestType string    `firestore:"request_type" json:"RequestType"`
	Subject     string    `firestore:"subject" json:"Subject"`
}

func Monitoring(ctx context.Context, app *firebase.App, client *firestore.Client) {
	// HTML sayfasını sunan handler
	http.HandleFunc("/monitoring", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.ParseFiles("templates/monitoring.html")
		if err != nil {
			http.Error(w, "Could not parse template", http.StatusInternalServerError)
			return
		}
		// Sayfa ilk yüklendiğinde boş veri ile render edilir.
		// Veriler JS ile API'den çekilecek.
		tmpl.Execute(w, nil)
	})

	// API endpoint'i (GET ve POST)
	http.HandleFunc("/api/monitoring-requests", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getMonitoringRequests(w, r, ctx, client)
		case http.MethodPost:
			createMonitoringRequest(w, r, ctx, client)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}

func getMonitoringRequests(w http.ResponseWriter, r *http.Request, ctx context.Context, client *firestore.Client) {
	userWalletAddress := r.URL.Query().Get("user")
	if userWalletAddress == "" {
		http.Error(w, "User parameter is required", http.StatusBadRequest)
		return
	}

	var requests []MonitoringRequest
	query := client.Collection("monitoring_requests").Where("user", "==", userWalletAddress).OrderBy("date", firestore.Desc)
	iter := query.Documents(ctx)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error fetching monitoring requests: %v", err)
			http.Error(w, "Error fetching data", http.StatusInternalServerError)
			return
		}
		var req MonitoringRequest
		if err := doc.DataTo(&req); err != nil {
			log.Printf("Error parsing request data: %v", err)
			continue // Hatalı veriyi atla
		}
		requests = append(requests, req)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

func createMonitoringRequest(w http.ResponseWriter, r *http.Request, ctx context.Context, client *firestore.Client) {
	var req MonitoringRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	req.Date = time.Now() // Sunucu saatini kullan

	_, _, err := client.Collection("monitoring_requests").Add(ctx, req)
	if err != nil {
		log.Printf("Error adding monitoring request: %v", err)
		http.Error(w, "Failed to create monitoring request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}
