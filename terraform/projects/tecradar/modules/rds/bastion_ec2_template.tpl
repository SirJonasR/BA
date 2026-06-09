#!/bin/bash
sudo yum update -y
# sudo yum upgrade -y
sudo yum install -y postgresql16

# Create database initialization script
cat > /usr/local/bin/init-database.sh <<'SCRIPT'
#!/bin/bash
set -e

# Check if host and user are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <db_host> <db_root_user>"
    echo ""
    echo "Passwords will be prompted securely (not shown in history)"
    echo ""
    echo "Example:"
    echo "  $0 tecradar-dev-db.xxx.rds.amazonaws.com postgres"
    echo ""
    exit 1
fi

DB_HOST=$1
DB_ROOT_USER=$2

# Securely read passwords (won't appear in bash history or process list)
echo "========================================"
echo "Database Initialization Script"
echo "========================================"
echo ""
echo "DB Host: $DB_HOST"
echo "Root User: $DB_ROOT_USER"
echo ""
read -sp "Enter root user password: " DB_ROOT_PASS
echo ""
read -sp "Enter password for keycloak_user: " KEYCLOAK_PASS
echo ""
read -sp "Enter password for quarkus_user: " QUARKUS_PASS
echo ""
echo ""

echo "This script will create:"
echo "  - keycloak database with keycloak_user"
echo "  - quarkus database with quarkus_user"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi
echo ""

echo "Creating databases and users..."
PGPASSWORD=$DB_ROOT_PASS psql -h $DB_HOST -U $DB_ROOT_USER -d postgres <<EOF
-- Create databases
CREATE DATABASE keycloak;
CREATE DATABASE quarkus;

-- Create users
CREATE USER keycloak_user WITH PASSWORD '$KEYCLOAK_PASS';
CREATE USER quarkus_user WITH PASSWORD '$QUARKUS_PASS';

-- Grant database-level privileges
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
GRANT ALL PRIVILEGES ON DATABASE quarkus TO quarkus_user;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Databases and users created successfully"
else
    echo "✗ Failed to create databases and users"
    exit 1
fi

echo "Setting up keycloak database permissions..."
PGPASSWORD=$DB_ROOT_PASS psql -h $DB_HOST -U $DB_ROOT_USER -d keycloak <<EOF
GRANT ALL PRIVILEGES ON SCHEMA public TO keycloak_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO keycloak_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO keycloak_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO keycloak_user;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Keycloak permissions configured"
else
    echo "✗ Failed to configure keycloak permissions"
    exit 1
fi

echo "Setting up quarkus database permissions..."
PGPASSWORD=$DB_ROOT_PASS psql -h $DB_HOST -U $DB_ROOT_USER -d quarkus <<EOF
GRANT ALL PRIVILEGES ON SCHEMA public TO quarkus_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quarkus_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO quarkus_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO quarkus_user;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Quarkus permissions configured"
else
    echo "✗ Failed to configure quarkus permissions"
    exit 1
fi

echo ""
echo "========================================"
echo "✓ Database initialization complete!"
echo "========================================"
echo ""
echo "Created:"
echo "  - Database: keycloak"
echo "    User: keycloak_user"
echo "    Password: [hidden]"
echo ""
echo "  - Database: quarkus"
echo "    User: quarkus_user"
echo "    Password: [hidden]"
echo "========================================"

# Clear password variables from memory
unset DB_ROOT_PASS
unset KEYCLOAK_PASS
unset QUARKUS_PASS

SCRIPT

chmod +x /usr/local/bin/init-database.sh

echo ""
echo "============================================"
echo "Bastion host setup complete!"
echo "============================================"
echo ""
echo "PostgreSQL 16 client installed:"
psql --version
echo ""
echo "Database initialization script is ready at:"
echo "  /usr/local/bin/init-database.sh"
echo ""
echo "Usage:"
echo "  init-database.sh <db_host> <root_user>"
echo ""