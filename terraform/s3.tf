# ── S3 Deploy Bucket ───────────────────────────────────────────
# Private bucket — GitHub uploads build here
# EC2 pulls from here during deployment
# Users NEVER touch this bucket directly

resource "aws_s3_bucket" "deploy" {
  bucket        = "${var.project_name}-deploy-${random_id.suffix.hex}"
  force_destroy = true

  tags = { Name = "${var.project_name}-deploy" }
}

# Block ALL public access
resource "aws_s3_bucket_public_access_block" "deploy" {
  bucket                  = aws_s3_bucket.deploy.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning — keeps last 3 builds for rollback
resource "aws_s3_bucket_versioning" "deploy" {
  bucket = aws_s3_bucket.deploy.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "deploy" {
  bucket = aws_s3_bucket.deploy.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Auto-delete old versions after 7 days
# Keeps storage near zero cost
resource "aws_s3_bucket_lifecycle_configuration" "deploy" {
  bucket = aws_s3_bucket.deploy.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days           = 7
      newer_noncurrent_versions = 3
    }
  }
}