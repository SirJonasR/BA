# Create an IAM Group for Terraform Admins
# And add the IAM User to the Group
resource "aws_iam_group" "terraform_admins" {
  name = "${var.project}TerraformAdmins"
}

############################################################################
# Policies for Terraform Admins Group
############################################################################
# Policy to allow assuming the TerraformAdministrator role in account 897729117054
resource "aws_iam_policy" "AllowAssumeTerraformAdministratorPolicy" {
  name        = "${var.project}AllowAssumeTerraformAdministratorPolicy"
  description = "Allows assuming the TerraformAdministrator role."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "sts:AssumeRole",
        Resource = "arn:aws:iam::897729117054:role/pppTerraformAdministrator"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_assume_role" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowAssumeTerraformAdministratorPolicy.arn
}

# Policy to allow deleting RDS instances in account 897729117054, region eu-north-1
# Needed for the Restore Testing RDS instance to be deleted
resource "aws_iam_policy" "AllowDeleteRDSInstance" {
  name        = "${var.project}AllowDeleteRDSInstance"
  description = "Allows deleting RDS instances."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "Statement1"
        Effect = "Allow"
        Action = "rds:DeleteDBInstance"
        Resource = "arn:aws:rds:eu-north-1:897729117054:db:*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_delete_rds" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowDeleteRDSInstance.arn
}

# Policy to allow GitHub workflow ECS and IAM actions
resource "aws_iam_policy" "AllowGithubworkflow" {
  name        = "${var.project}AllowGithubworkflow"
  description = "Allows ECS and IAM actions for GitHub workflow."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "VisualEditor0"
        Effect = "Allow"
        Action = [
          "ecs:ListServices",
          "ecs:ListServicesByNamespace",
          "ecs:UpdateService",
          "iam:PassRole",
          "ecs:ListTaskDefinitionFamilies",
          "ecs:RegisterTaskDefinition",
          "ecs:ListTaskDefinitions",
          "ecs:DescribeTaskDefinition",
          "ecs:ListClusters"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_github_workflow" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowGithubworkflow.arn
}

# Policy to allow image signing and ECR management actions
resource "aws_iam_policy" "AllowImageSigning" {
  name        = "${var.project}AllowImageSigning"
  description = "Allows image signing and ECR management actions."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "VisualEditor0"
        Effect = "Allow"
        Action = [
          "ecr:DescribeImageScanFindings",
          "signer:GetSigningProfile",
          "signer:StartSigningJob",
          "ecr:GetDownloadUrlForLayer",
          "signer:ListSigningProfiles",
          "ecr:DescribeImages",
          "signer:SignPayload",
          "signer:DescribeSigningJob",
          "signer:GetSigningPlatform"
        ]
        Resource = "*"
      },
      {
        Sid    = "ManageRepositoryContents"
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage"
        ]
        Resource = "arn:aws:ecr:eu-north-1:897729117054:repository/*"
      },
      {
        Sid    = "GetAuthorizationToken"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Sid    = "SignAndRevocationCheck"
        Effect = "Allow"
        Action = [
          "signer:PutSigningProfile",
          "signer:SignPayload",
          "signer:GetRevocationStatus"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_image_signing" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowImageSigning.arn
}

# Policy to allow pushing images to ECR
resource "aws_iam_policy" "AllowPushImage" {
  name        = "${var.project}AllowPushImage"
  description = "Allows pushing images to ECR."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:CompleteLayerUpload",
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_push_image" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowPushImage.arn
}

# Policy to allow SSM and EC2/RDS access
resource "aws_iam_policy" "AllowSSMAccess" {
  name        = "${var.project}AllowSSMAccess"
  description = "Allows SSM, EC2, and RDS access."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "VisualEditor0"
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:DescribeDocument",
          "ssm:ListCommands",
          "ec2:DescribeInstances",
          "ssm:GetParameters",
          "ssm:GetParameter",
          "ssm:DeleteParameters",
          "ssm:StartSession",
          "ssm:PutParameter",
          "ssm:DeleteParameter",
          "ssm:DescribeInstanceInformation",
          "ssm:DescribeParameters",
          "rds:DescribeDBInstances"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_ssm_access" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowSSMAccess.arn
}

# Policy to allow full S3 and S3 Object Lambda access
resource "aws_iam_policy" "AllowS3Access" {
  name        = "${var.project}AllowS3Access"
  description = "Allows access to specific S3 buckets and S3 Object Lambda."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:*",
          "s3-object-lambda:*"
        ],
        Resource = [
          "arn:aws:s3:::ams-projects-terraform-state-bucket/shared/*",
          "arn:aws:s3:::ams-projects-terraform-state-bucket/ppp/*",
          "arn:aws:s3:::ppp-setup-terraform-state-bucket/*",
        ]
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "terraform_admins_s3_access" {
  group      = aws_iam_group.terraform_admins.name
  policy_arn = aws_iam_policy.AllowS3Access.arn
}
