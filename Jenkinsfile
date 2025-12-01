pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    environment {
        CI = 'true'
        NODE_OPTIONS = '--experimental-vm-modules'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Root Dependencies') {
                    steps {
                        sh 'npm ci'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        sh 'npm test'
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'backend/test-results/*.xml'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test -- --watchAll=false --ci'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'frontend/test-results/*.xml'
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
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
