# ── Latest Amazon Linux 2023 AMI for Mumbai ────────────────────
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  filter {
    name   = "state"
    values = ["available"]
  }
}

# ── EC2 Instance ───────────────────────────────────────────────
resource "aws_instance" "frontend" {
  ami                     = data.aws_ami.al2023.id
  instance_type           = "t3.micro"
  subnet_id               = aws_subnet.public.id
  vpc_security_group_ids  = [aws_security_group.frontend.id]
  iam_instance_profile    = aws_iam_instance_profile.ec2_profile.name

  # Prevents accidental deletion from AWS Console
  disable_api_termination = true

  # IMDSv2 only — prevents SSRF attacks
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  # EBS root volume — persists through stop/start
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    encrypted             = true
    delete_on_termination = true
  }

  user_data = base64encode(file("${path.module}/user_data.sh"))

  tags = {
    Name        = var.project_name
    Environment = "production"
    ManagedBy   = "terraform"
  }

  lifecycle {
    ignore_changes = [user_data, ami]
  }
}

# ── Elastic IP — your permanent static IP ─────────────────────
resource "aws_eip" "frontend" {
  domain   = "vpc"
  instance = aws_instance.frontend.id

  tags = {
    Name = "${var.project_name}-static-ip"
  }

  depends_on = [aws_internet_gateway.main]
}