#####################################################################
# Lambda Execution Role
#####################################################################
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project}-${var.environment}-lambda-exec-role-rds"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

# Grant Lambda VPC permissions
resource "aws_iam_role_policy" "lambda_vpc_permissions" {
  name = "${var.project}-${var.environment}-lambda-vpc-permissions"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ],
        Resource = "*"
      }
    ]
  })
}