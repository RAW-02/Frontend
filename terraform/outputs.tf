output "elastic_ip" {
  description = "Your permanent public IP — share this with users"
  value       = aws_eip.frontend.public_ip
}

output "instance_id" {
  description = "Needed for GitHub Actions variable EC2_INSTANCE_ID"
  value       = aws_instance.frontend.id
}

output "s3_bucket_name" {
  description = "Needed for GitHub Actions variable S3_BUCKET"
  value       = aws_s3_bucket.deploy.bucket
}

output "github_actions_role_arn" {
  description = "Needed for GitHub Actions variable AWS_ROLE_ARN"
  value       = aws_iam_role.github_actions.arn
}

output "frontend_url" {
  description = "Public URL of your frontend"
  value       = "http://${aws_eip.frontend.public_ip}"
}

output "ssm_connect_command" {
  description = "Command to open shell on EC2 without SSH"
  value       = "aws ssm start-session --target ${aws_instance.frontend.id} --region ${var.aws_region}"
}