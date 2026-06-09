resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
    Project = var.project
    Environment = var.environment
  }
}

resource "aws_security_group" "vpc_endpoint_sg" {
  name   = "${var.project}-${var.environment}-vpc-endpoint-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_cluster_sg.id]
  }

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_cluster_sg.id]
  }

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_cluster_sg.id]
  }

  ingress {
    from_port       = 9000
    to_port         = 9000
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_cluster_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-${var.environment}-vpc-endpoint-sg"
    Project     = var.project
    Environment = var.environment
  }
}

######################################################################
# Public Subnets + Internet Gateway
######################################################################
resource "aws_subnet" "public" {
  count                   = length(local.limited_azs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.cidr_block, 4, count.index)
  availability_zone       = local.limited_azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project}-${var.environment}-public-${count.index}"
    Project = var.project
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-${var.environment}-public-table"
    Project = var.project
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route" "internet_access" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-${var.environment}-internet-gateway"
    Project = var.project
    Environment = var.environment
  }
}

######################################################################
# Private Subnets + NAT Gateway
######################################################################
resource "aws_subnet" "private" {
  count                   = length(local.limited_azs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.cidr_block, 4, count.index + length(local.limited_azs))
  availability_zone = local.limited_azs[count.index]

  tags = {
    Name = "${var.project}-${var.environment}-private-${count.index}"
    Project = var.project
    Environment = var.environment
    Type        = "private"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project}-${var.environment}-private-route-table"
    Project = var.project
    Environment = var.environment
  }
}

resource "aws_route_table_association" "private" {
    count          = length(aws_subnet.private)

    subnet_id      = aws_subnet.private[count.index].id
    route_table_id = aws_route_table.private.id
}

resource "aws_eip" "nat" {

}

resource "aws_nat_gateway" "main" {
    allocation_id = aws_eip.nat.id
    subnet_id     = aws_subnet.public[0].id

    tags = {
        Name = "${var.project}-${var.environment}-nat-gateway"
        Project = var.project
        Environment = var.environment
    }
}

######################################################################
# DB Subnet Groups
######################################################################
resource "aws_db_subnet_group" "public" {
  name       = "${var.project}-${var.environment}-public-subnet-group"
  description = "Public subnet group"
  subnet_ids = aws_subnet.public[*].id

  tags = {
    Name        = "${var.project}-${var.environment}-public-subnet-group"
    Project     = var.project
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_db_subnet_group" "private" {
    name       = "${var.project}-${var.environment}-private-subnet-group"
    description = "Private subnet group"
    subnet_ids = aws_subnet.private[*].id

    tags = {
      Name        = "${var.project}-${var.environment}-private-subnet-group"
      Project     = var.project
      Environment = var.environment
      Type        = "private"
    }
}

######################################################################
# VPC Endpoints
######################################################################
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  private_dns_enabled = true

  tags = {
    Name        = "${var.project}-${var.environment}-ecr-api-endpoint"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  private_dns_enabled = true

  tags = {
    Name        = "${var.project}-${var.environment}-ecr-dkr-endpoint"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_vpc_endpoint" "ecr_logs" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  private_dns_enabled = true

  tags = {
    Name        = "${var.project}-${var.environment}-logs-endpoint"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_vpc_endpoint" "ecr_secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  private_dns_enabled = true

  tags = {
    Name        = "${var.project}-${var.environment}-secretsmanager-endpoint"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = {
    Name        = "${var.project}-${var.environment}-s3-endpoint"
    Project     = var.project
    Environment = var.environment
  }
}
