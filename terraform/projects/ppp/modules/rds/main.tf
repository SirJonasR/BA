###########################################################
# RDS MySQL Instance
###########################################################
resource "aws_db_instance" "mysql" {
  count = var.environment == "dev" ? 1 : 0

  identifier           = "${var.project}-${var.environment}-database"
  engine               = var.engine
  engine_version       = var.engine_version
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  username             = jsondecode(aws_secretsmanager_secret_version.db_credentials_root_version.secret_string).username
  password             = jsondecode(aws_secretsmanager_secret_version.db_credentials_root_version.secret_string).password
  db_name              = var.db_name
  db_subnet_group_name = var.db_subnet_group_names.private
  vpc_security_group_ids = concat([aws_security_group.rds_sg.id], var.vpc_security_group_ids)
  publicly_accessible  = false
  storage_type         = var.storage_type
  multi_az             = false
  skip_final_snapshot  = var.skip_final_snapshot
  deletion_protection  = var.deletion_protection
  final_snapshot_identifier = "${var.project}-${var.environment}-database-final-snapshot"
  copy_tags_to_snapshot     = true
  storage_encrypted         = var.storage_encrypted

  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery", "audit"]

  tags = {
    Name        = "${var.project}-${var.environment}-rds-db-instance"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "mysql_error_logs" {
  count = var.environment == "dev" ? 1 : 0

  name              = "/aws/rds/instance/${aws_db_instance.mysql[0].identifier}/error"
  retention_in_days = 90

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_cloudwatch_log_group" "mysql_general_logs" {
  count = var.environment == "dev" ? 1 : 0

  name              = "/aws/rds/instance/${aws_db_instance.mysql[0].identifier}/general"
  retention_in_days = 90

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_cloudwatch_log_group" "mysql_slowquery_logs" {
  count = var.environment == "dev" ? 1 : 0

  name              = "/aws/rds/instance/${aws_db_instance.mysql[0].identifier}/slowquery"
  retention_in_days = 90

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_cloudwatch_log_group" "mysql_audit_logs" {
  count = var.environment == "dev" ? 1 : 0

  name              = "/aws/rds/instance/${aws_db_instance.mysql[0].identifier}/audit"
  retention_in_days = 90

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}


###########################################################
# Aurora MySQL Cluster
###########################################################
resource "aws_rds_cluster" "aurora_cluster" {
  count                     = var.environment == "prod" ? 1 : 0
  cluster_identifier        = "${var.project}-${var.environment}-aurora-cluster"
  engine                    = var.engine
  engine_version            = var.engine_version
  master_username           = jsondecode(aws_secretsmanager_secret_version.db_credentials_root_version.secret_string).username
  master_password           = jsondecode(aws_secretsmanager_secret_version.db_credentials_root_version.secret_string).password
  database_name             = var.db_name
  db_subnet_group_name      = var.db_subnet_group_names.private
  vpc_security_group_ids    = concat([aws_security_group.rds_sg.id], var.vpc_security_group_ids)
  storage_encrypted         = var.storage_encrypted
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = "${var.project}-${var.environment}-aurora-cluster-final-snapshot"
  copy_tags_to_snapshot     = true

  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery", "audit"]

  tags = {
    Name        = "${var.project}-${var.environment}-aurora-cluster"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_rds_cluster_instance" "aurora_instance" {
  count = var.environment == "prod" ? 1 : 0
  # count                   = 1
  identifier          = "${var.project}-${var.environment}-aurora-instance-${count.index}"
  cluster_identifier  = aws_rds_cluster.aurora_cluster[0].id
  instance_class      = var.instance_class
  engine              = var.engine
  engine_version      = var.engine_version
  publicly_accessible = false

  tags = {
    Name        = "${var.project}-${var.environment}-aurora-instance-${count.index}"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "aurora_error" {
  count             = var.environment == "prod" ? 1 : 0
  name              = "/aws/rds/cluster/${aws_rds_cluster.aurora_cluster[0].cluster_identifier}/error"
  retention_in_days = 90

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "aurora_general" {
  count             = var.environment == "prod" ? 1 : 0
  name              = "/aws/rds/cluster/${aws_rds_cluster.aurora_cluster[0].cluster_identifier}/general"
  retention_in_days = 90

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "aurora_slowquery" {
  count             = var.environment == "prod" ? 1 : 0
  name              = "/aws/rds/cluster/${aws_rds_cluster.aurora_cluster[0].cluster_identifier}/slowquery"
  retention_in_days = 90

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "aurora_audit" {
  count             = var.environment == "prod" ? 1 : 0
  name              = "/aws/rds/cluster/${aws_rds_cluster.aurora_cluster[0].cluster_identifier}/audit"
  retention_in_days = 90

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

#####################################################################################
# Security Group for RDS
#####################################################################################
resource "aws_security_group" "rds_sg" {
  name        = "${var.project}-${var.environment}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow MySQL traffic from ECS tasks"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = var.security_groups_ingress
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-${var.environment}-rds-sg"
    Project     = var.project
    Environment = var.environment
  }
}
