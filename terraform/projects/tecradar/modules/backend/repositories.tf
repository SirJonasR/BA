# ECR Repository for backend images
resource "aws_ecr_repository" "backend" {
  name = "${var.project}/backend/${var.environment}"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "${var.project}/frontend/${var.environment}"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_ecr_repository" "keycloak" {
  name = "${var.project}/keycloak/${var.environment}"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# ECR Lifecycle Policy to keep only the last 10 images
# Only one aws_ecr_lifecycle_policy resource can be used with the same ECR repository. To apply multiple rules, they must be combined in the policy JSON.
# The AWS ECR API reorders rules based on rulePriority, so multiple defined rules must be sorted in ascending rulePriority order to avoid Terraform trying to recreate the resource.
# Note: This resource doesn't support tags for env/project.
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus = "any"
          countType = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}