package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	firebase "firebase.google.com/go"
	"github.com/mcku/vesainvest/internal/monitoring"
	monitoringadmin "github.com/mcku/vesainvest/internal/monitoring-admin"
	"github.com/mcku/vesainvest/internal/onboarding"
	onboardingadmin "github.com/mcku/vesainvest/internal/onboarding-admin"
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

	onboarding.Onboarding(ctx, app, client)
	monitoring.Monitoring(ctx, app, client)
	onboardingadmin.OnboardingAdmin(ctx, app, client)
	monitoringadmin.MonitoringAdmin(ctx, app, client)

	// http.Handle("/", http.FileServer(http.Dir("./static")))
	fmt.Println("Server starting at port 8080...")
	http.ListenAndServe(":8080", nil)
}
