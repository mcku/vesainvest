package onboardingadmin

import (
	"context"
	"html/template"
	"net/http"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"

	"google.golang.org/api/iterator"
)

type User struct {
	ID            string
	Name          string `firestore:"name"`
	WalletAddress string `firestore:"walletAddress"`
	Email         string `firestore:"email"`
	Telegram      string `firestore:"telegram"`
	Status        string `firestore:"status"`
}

func OnboardingAdmin(ctx context.Context, app *firebase.App, client *firestore.Client) {

	http.HandleFunc("/onboarding-admin/", func(w http.ResponseWriter, r *http.Request) {
		iter := client.Collection("users").Documents(ctx)
		var users []User
		for {
			doc, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				http.Error(w, "Error fetching users", http.StatusInternalServerError)
				return
			}
			var user User
			if err := doc.DataTo(&user); err != nil {
				http.Error(w, "Error parsing user data", http.StatusInternalServerError)
				return
			}
			user.ID = doc.Ref.ID
			users = append(users, user)
		}

		tmpl, err := template.ParseFiles("templates/admin.html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tmpl.Execute(w, users)
	})

	http.HandleFunc("/onboarding-admin/update_status", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Error parsing form", http.StatusBadRequest)
			return
		}

		userID := r.FormValue("userID")
		newStatus := r.FormValue("status")

		_, err := client.Collection("users").Doc(userID).Set(ctx, map[string]interface{}{
			"status": newStatus,
		}, firestore.MergeAll)

		if err != nil {
			http.Error(w, "Error updating user status", http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, "/", http.StatusSeeOther)
	})

	http.HandleFunc("/onboarding-admin/delete_user", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Error parsing form", http.StatusBadRequest)
			return
		}

		userID := r.FormValue("userID")

		_, err := client.Collection("users").Doc(userID).Delete(ctx)
		if err != nil {
			http.Error(w, "Error deleting user", http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, "/", http.StatusSeeOther)
	})

}
