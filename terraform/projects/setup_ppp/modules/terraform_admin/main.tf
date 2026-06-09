# Create an IAM User
resource "aws_iam_user" "terraform_admin" {
  name = var.username
}

# Create and IAM Access Key and Secret Key for the IAM User
# And Output the Access Key ID and Secret Access Key
resource "aws_iam_access_key" "terraform_admin_key" {
  user = aws_iam_user.terraform_admin.name
}

output "terraform_admin_access_key_id" {
  value     = aws_iam_access_key.terraform_admin_key.id
  sensitive = true
}

output "terraform_admin_secret_access_key" {
  value     = aws_iam_access_key.terraform_admin_key.secret
  sensitive = true
}

# Add User to the Terraform Admins Group
resource "aws_iam_group_membership" "terraform_admin_membership" {
  name = "${var.project}_terraform_admin_membership"
  users = [aws_iam_user.terraform_admin.name]
  group = aws_iam_group.terraform_admins.name
}

