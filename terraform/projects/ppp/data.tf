data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_caller_identity" "current" {}

# Dependencies for the Lambda function
data "klayers_package_latest_version" "boto3" {
  name           = "boto3"
  region         = "eu-north-1"
  python_version = "3.12"
}

data "klayers_package_latest_version" "mysql_connector_python" {
  name           = "mysql-connector-python"
  region         = "eu-north-1"
  python_version = "3.12"
}
