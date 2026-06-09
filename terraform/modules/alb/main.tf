################################################################
# Public ALB
################################################################
# Create the Load Balancer
resource "aws_lb" "public" {
  name               = "${var.project}-${var.environment}-public-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.subnets_public

  tags = {
    Name        = "${var.project}-${var.environment}-public-alb"
    Project     = var.project
    Environment = var.environment
  }
}


################################################################
# Private ALB
################################################################
resource "aws_lb" "private" {
  name               = "${var.project}-${var.environment}-private-alb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.subnets_private

  tags = {
    Name        = "${var.project}-${var.environment}-private-alb"
    Project     = var.project
    Environment = var.environment
  }
}
