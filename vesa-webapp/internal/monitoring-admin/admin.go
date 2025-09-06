package monitoringadmin

import (
	"context"
	"html/template"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"

	"google.golang.org/api/iterator"
)

// MonitoringRequest, Firestore'daki bir izleme talebini temsil eder.
type MonitoringRequest struct {
	User        string    `firestore:"user"`
	Date        time.Time `firestore:"date"`
	RequestType string    `firestore:"request_type"`
	Subject     string    `firestore:"subject"`
}

func MonitoringAdmin(ctx context.Context, app *firebase.App, client *firestore.Client) {

	http.HandleFunc("/monitoring-admin/", func(w http.ResponseWriter, r *http.Request) {
		iter := client.Collection("monitoring_requests").Documents(ctx)
		var requests []MonitoringRequest
		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				http.Error(w, "Error fetching monitoring requests", http.StatusInternalServerError)
				return
			}
			var req MonitoringRequest
			if err := doc.DataTo(&req); err != nil {
				http.Error(w, "Error parsing monitoring request data", http.StatusInternalServerError)
				return
			}
			requests = append(requests, req)
		}

		tmpl, _ := template.ParseFiles("templates/monitoring-admin.html")
		tmpl.Execute(w, requests)
	})
}
