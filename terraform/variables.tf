variable "aws_region" {
  description = "AWS region — Mumbai for lowest latency in India"
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used in all AWS resource names"
  default     = "univulner-frontend"
}

variable "github_repo" {
  description = "GitHub repo as owner/repo — only this repo can deploy"
  type        = string
}

variable "budget_email" {
  description = "Email for budget alerts"
  type        = string
}

variable "budget_limit_usd" {
  description = "Monthly spend limit in USD before alert fires"
  default     = "5"
}