terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "The ID of the Google Cloud project."
  type        = string
}

variable "region" {
  description = "The region to deploy the resources in."
  type        = string
  default     = "us-central1"
}

variable "admin_email" {
  description = "The email address of the admin user."
  type        = string
}

resource "google_cloud_run_v2_service" "admin_panel" {
  name     = "admin-panel"
  location = var.region

  template {
    containers {
      image = "gcr.io/cloudrun/hello"
    }
  }
}

resource "google_iap_web_iam_member" "admin_access" {
  project = var.project_id
  role    = "roles/iap.httpsResourceAccessor"
  member  = "user:${var.admin_email}"
}
