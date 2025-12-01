pipeline {
    agent any
    
    environment {
        CI = 'true'
        NODE_OPTIONS = '--experimental-vm-modules'
        NVM_DIR = "${env.HOME}/.nvm"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh '''
                    # Install nvm if not present
                    if [ ! -d "$HOME/.nvm" ]; then
                        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                    fi
                    
                    # Source nvm and install Node 18
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    
                    nvm install 18
                    nvm alias default 18
                    
                    node --version
                    npm --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    
                    echo "Installing root dependencies..."
                    npm ci || npm install
                    
                    echo "Installing backend dependencies..."
                    cd backend && npm ci || npm install
                    cd ..
                    
                    echo "Installing frontend dependencies..."
                    cd frontend && npm ci || npm install
                '''
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            
                            npm test
                        '''
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'backend/test-results/*.xml'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            
                            cd frontend && npm test -- --watchAll=false
                        '''
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    
                    cd frontend && npm run build
                '''
            }
        }
        
        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose build'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
