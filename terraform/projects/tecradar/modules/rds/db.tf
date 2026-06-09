# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name_prefix = "${var.project}-${var.environment}-db-subnet-"
  subnet_ids  = var.subnet_ids

  tags = {
    Name        = "${var.project}-${var.environment}-db-subnet"
    Environment = var.environment
    Project     = var.project
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.project}-${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from allowed security groups"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"

    # For testing purposes, allowing access from anywhere
    # Note that cidr_blocks and security_groups are interpreted as OR
    cidr_blocks = var.environment == "dev" ? ["0.0.0.0/0"] : []
    security_groups = concat(var.allowed_security_group_ids, [aws_security_group.ec2_ssh_sg.id])
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-${var.environment}-rds-sg"
    Environment = var.environment
    Project     = var.project
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgresql" {
  identifier     = "${var.project}-${var.environment}-db"
  engine         = "postgres"
  engine_version = "16.8"
  instance_class = var.instance_class
  allocated_storage     = var.allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = true
  max_allocated_storage = var.max_allocated_storage
  multi_az             = false
  skip_final_snapshot  = var.skip_final_snapshot
  final_snapshot_identifier = "${var.project}-${var.environment}-database-final-snapshot"
  username             = jsondecode(aws_secretsmanager_secret_version.db_credentials_root_version.secret_string).username
  password             = jsondecode(aws_secretsmanager_secret_version.db_credentials_root_version.secret_string).password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  deletion_protection    = var.environment == "dev" ? false : true

  tags = {
    Name        = "${var.project}-${var.environment}-postgresql"
    Environment = var.environment
    Project     = var.project
  }
  lifecycle {
    ignore_changes = [iops]
  }
}