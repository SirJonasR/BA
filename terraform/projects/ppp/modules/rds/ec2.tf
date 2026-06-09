resource "aws_instance" "bastion_host" {
  ami                         = data.aws_ami.latest_amazon_linux.id
  instance_type               = "t3.nano"
  associate_public_ip_address = true
  count                       = 1
  subnet_id                   = var.bastion_host_subnet_id
  security_groups             = [aws_security_group.ec2_ssh_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name

  # https://www.terraform.io/language/functions/templatefile
  user_data = templatefile("${path.module}/tpl/userdata.tpl", {})

  tags = {
    Name        = var.project
    Environment = var.environment
  }

  lifecycle {
    ignore_changes = [
      ami, disable_api_termination, ebs_optimized,
      hibernation, security_groups, credit_specification,
      network_interface, ephemeral_block_device
    ]
  }
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group
# create a security group for ec2 instances in the current project VPC
resource "aws_security_group" "ec2_ssh_sg" {
  name   = "${var.project}-${var.environment}-bastion-sg"
  vpc_id = var.vpc_id

  egress {
    protocol    = -1
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_role" {
  name               = "${var.project}-${var.environment}-ec2-role"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_instance_profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}
