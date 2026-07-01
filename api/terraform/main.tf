provider "aws" {
  region  = "${var.aws_region}"
  profile = "${var.aws_profile}"
}

terraform {
  backend "s3" {
    region = "us-east-1"
    bucket = "lauries-api-production"
    key    = "lauries-api/terraform.tfstate"
  }

  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.9.0"
    }
  }
}

locals {
  envName = terraform.workspace
  aws_region = var.aws_region
  aws_prefix = var.aws_prefix
  aws_project_name = var.aws_project_name
}

data "aws_acm_certificate" "amazon_issued" {
  domain      = "${var.aws_ssl_domain}"
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

# Get the Route53 hosted zone for ###.com
data "aws_route53_zone" "this" {
  name = "${var.aws_root_domain}"
}
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.app_domain
  type    = "A"

  alias {
    name                   = aws_alb.application_load_balancer.dns_name
    zone_id                = aws_alb.application_load_balancer.zone_id
    evaluate_target_health = true
  }
}

resource "aws_ecr_repository" "ecr_repo" {
  name = var.aws_project_name
  force_delete = true
}

resource "aws_ecs_cluster" "ecs_cluster" {
  name = var.aws_project_name
}

resource "aws_ecs_task_definition" "main_task" {
  family                   = "${var.aws_prefix}-main-task"
  container_definitions    = jsonencode([
    {
      name      = "${var.aws_prefix}-main-task",
      image     = "${aws_ecr_repository.ecr_repo.repository_url}:latest",
      essential = true,
      environment = [
        { name = "PARAMS_ENV", value = var.app_env },
        { name = "DB_HOST", value = var.database_host },
        { name = "DB_DATABASE", value = var.database_name },
        { name = "DB_USERNAME", value = var.database_user },
        { name = "DB_PASSWORD", value = var.database_password },
        { name = "DB_PORT", value = var.database_port },
        { name = "COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
        { name = "COGNITO_CLIENT_ID", value = var.cognito_client_id },
        { name = "AUTHORIZE_PAYMENT_API_LOGIN_ID", value = var.authorize_payment_api_login_id },
        { name = "AUTHORIZE_TRANSACTION_KEY", value = var.authorize_transaction_key },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "AWS_ACCESS_KEY_ID", value = var.aws_access_key_id },
        { name = "AWS_SECRET_ACCESS_KEY", value = var.aws_secret_access_key },
        { name = "AWS_S3_BUCKET", value = var.aws_s3_bucket }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options   = {
          "awslogs-group"         = "${var.aws_project_name}-container-${local.envName}",
          "awslogs-region"        = var.aws_region,
          "awslogs-create-group"  = "true",
          "awslogs-stream-prefix" = var.aws_project_name
        }
      },
      portMappings = [
        {
          containerPort = 3000,
          hostPort      = 3000
        }
      ],
      memory = 1024,
      cpu    = 512
    }
  ])

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 1024
  cpu                      = 512
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole-${local.envName}"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

  }
}

resource "aws_iam_policy" "ecs_role_policy" {
  name   = "ecs-logging-policy-${local.envName}"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  # policy_arn = aws_iam_policy.ecs_role_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_logging_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  # policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  policy_arn = aws_iam_policy.ecs_role_policy.arn
}

# Providing a reference to our default VPC
resource "aws_default_vpc" "default_vpc" {
}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "${var.aws_region}a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "${var.aws_region}c"
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = "${var.aws_region}c"
}

resource "aws_ecs_service" "main_service" {
  name            = "${var.aws_project_name}-service-${local.envName}"                        # Naming our first service
  cluster         = aws_ecs_cluster.ecs_cluster.id           # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.main_task.arn # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = var.aws_ecs_desired_count # Setting the number of containers we want deployed to 3
  force_new_deployment = true
  deployment_maximum_percent = 200
  deployment_minimum_healthy_percent = 100 #50
  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
    container_name   = aws_ecs_task_definition.main_task.family
    container_port   = 3000 # Specifying the container port
  }

  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
    assign_public_ip = true                                                # Providing our containers with public IPs
    security_groups  = ["${aws_security_group.service_security_group.id}"] # Setting the security group
  }

}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = [
      "${aws_security_group.http.id}",
      "${aws_security_group.https.id}",
      "${aws_security_group.rds.id}"
    ]
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
    description = "ALL"
  }

  egress {
    from_port   = 5432          # Allowing any incoming port
    to_port     = 5432          # Allowing any outgoing port
    protocol    = "tcp"         # Allowing any outgoing protocol
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
    description = "PostgreSQL"
  }
}

resource "aws_alb" "application_load_balancer" {
  name               = "${var.aws_project_name}-lb-${local.envName}" # Naming our load balancer
  load_balancer_type = "application"
  subnets = [ # Referencing the default subnets
    "${aws_default_subnet.default_subnet_a.id}",
    "${aws_default_subnet.default_subnet_b.id}",
    "${aws_default_subnet.default_subnet_c.id}"
  ]
  # Referencing the security group
  security_groups = [
    "${aws_security_group.http.id}",
    "${aws_security_group.https.id}",
    "${aws_security_group.rds.id}"
  ]
}

# Creating a security group for the load balancer:
resource "aws_security_group" "http" {
  ingress {
    from_port   = 80 # Allowing traffic in from port 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}

resource "aws_security_group" "https" {
  ingress {
    from_port   = 443 # Allowing traffic in from port 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "rds"
  # vpc_id      = module.vpc.vpc_id

  ingress {
    from_port = 5432
    to_port   = 5432
    protocol  = "tcp"

    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb_target_group" "target_group" {
  name        = "target-group-${local.envName}"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id # Referencing the default VPC
  health_check {
    matcher  = "200,301,302"
    path     = "/"
    interval = 60
    timeout  = 30
  }
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn # Referencing our load balancer
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
  }
}

resource "aws_lb_listener" "listener_ssl" {
  load_balancer_arn = aws_alb.application_load_balancer.arn # Referencing our load balancer
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = data.aws_acm_certificate.amazon_issued.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
  }
}