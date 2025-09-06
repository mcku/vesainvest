package main

import (
	"context"
	"fmt"
	"html/template"
	"log"
	"net/http"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

type User struct {
	Name          string `firestore:"name"`
	WalletAddress string `firestore:"walletAddress"`
	Email         string `firestore:"email"`
	Telegram      string `firestore:"telegram"`
	Status        string `firestore:"status"`
}

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

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.ParseFiles("templates/register.html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tmpl.Execute(w, nil)
	})

	http.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if err := r.ParseForm(); err != nil {
			http.Error(w, "Error parsing form", http.StatusBadRequest)
			return
		}

		user := User{
			Name:          r.FormValue("name"),
			WalletAddress: r.FormValue("walletAddress"),
			Email:         r.FormValue("email"),
			Telegram:      r.FormValue("telegram"),
			Status:        "pending", // Default status
		}
		fmt.Println("User:", user)

		_, _, err = client.Collection("users").Add(ctx, user)
		if err != nil {
			fmt.Println("Error adding user to database:", err.Error())
			http.Error(w, "Error adding user to database", http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, "/success", http.StatusSeeOther)
	})

	http.HandleFunc("/success", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.ParseFiles("templates/success.html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tmpl.Execute(w, nil)
	})

	fmt.Println("Server starting at port 8080...")
	http.ListenAndServe(":8080", nil)
}
