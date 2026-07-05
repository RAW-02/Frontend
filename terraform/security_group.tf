# ── Security Group ─────────────────────────────────────────────
# Port 80  — HTTP — users visit your frontend
# Port 443 — HTTPS — ready for future SSL certificate
# Port 22  — SSH — BLOCKED. SSM Session Manager used instead.

resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-sg"
  description = "Allow HTTP and HTTPS only. No SSH."
  vpc_id      = aws_vpc.main.id

  # HTTP — anyone can visit the frontend
  ingress {
    description      = "HTTP from internet"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # HTTPS — ready for when you add SSL certificate
  ingress {
    description      = "HTTPS from internet"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # Outbound — EC2 needs to reach AWS SSM and S3
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg" }
}