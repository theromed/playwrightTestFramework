pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
        allure 'Allure'
    }

    triggers {
        // Nightly: Пн–Пт в ~02:00 (H рандомизирует минуту для снижения нагрузки)
        cron('H 2 * * 1-5')
    }

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'ui-sanity', 'ui-regression', 'api-sanity', 'api-regression'],
            description: 'Test suite to run'
        )
        string(
            name: 'BASE_URL',
            defaultValue: 'http://localhost:3000',
            description: 'Juice Shop base URL'
        )
        choice(
            name: 'RETRY_COUNT',
            choices: ['2', '0', '1', '3'],
            description: 'Number of retries for failed tests'
        )
        choice(
            name: 'WORKERS',
            choices: ['4', '1', '2', '8'],
            description: 'Parallel Playwright workers'
        )
    }

    environment {
        CI              = 'true'
        HEADLESS        = 'true'
        BASE_URL        = "${params.BASE_URL ?: 'http://localhost:3000'}"
        LOG_LEVEL       = 'info'
        RUN_TIMESTAMP   = sh(script: 'date +%Y%m%d_%H%M%S', returnStdout: true).trim()
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
        timestamps()
    }

    stages {

        stage('Health Check') {
            steps {
                script {
                    echo "Checking Juice Shop at ${env.BASE_URL}..."
                    def maxAttempts = 5
                    def ready = false
                    for (int i = 1; i <= maxAttempts; i++) {
                        def status = sh(
                            script: "curl -s -o /dev/null -w '%{http_code}' ${env.BASE_URL}/ || echo '000'",
                            returnStdout: true
                        ).trim()
                        if (status == '200') {
                            echo "Juice Shop is up (attempt ${i}/${maxAttempts})"
                            ready = true
                            break
                        }
                        echo "Attempt ${i}/${maxAttempts}: status ${status}, waiting 10s..."
                        sleep(10)
                    }
                    if (!ready) {
                        error("Juice Shop is not available at ${env.BASE_URL} after ${maxAttempts} attempts")
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install chromium --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'juice-admin-password', variable: 'ADMIN_PASSWORD'),
                    string(credentialsId: 'juice-test-password', variable: 'TEST_USER_PASSWORD'),
                ]) {
                    script {
                        def suite = params.TEST_SUITE ?: 'all'
                        def retries = params.RETRY_COUNT ?: '2'
                        def workers = params.WORKERS ?: '4'

                        def projectArg = ''
                        if (suite == 'all') {
                            projectArg = '--project=ui-sanity --project=ui-regression --project=api-sanity --project=api-regression'
                        } else {
                            projectArg = "--project=${suite}"
                        }

                        def exitCode = sh(
                            script: """
                                npx playwright test \
                                    ${projectArg} \
                                    --retries=${retries} \
                                    --workers=${workers}
                            """,
                            returnStatus: true
                        )

                        env.TEST_EXIT_CODE = exitCode.toString()

                        if (exitCode != 0) {
                            unstable("Tests finished with failures (exit code: ${exitCode})")
                        }
                    }
                }
            }
        }

        stage('Allure Report') {
            steps {
                allure includeProperties: false,
                       jdk: '',
                       results: [[path: 'allure-results']]
            }
        }

        stage('Import to Xray') {
            steps {
                script {
                    def suite = params.TEST_SUITE ?: 'all'

                    // Определяем Test Plan по типу прогона
                    def testPlanKey = ''
                    switch(suite) {
                        case 'ui-sanity':
                        case 'api-sanity':
                            testPlanKey = 'QA-200'  // Sanity Plan
                            break
                        case 'all':
                            testPlanKey = 'QA-201'  // Regression Plan
                            break
                        default:
                            testPlanKey = 'QA-202'  // Ad-hoc Plan
                    }

                    def testEnv = params.BASE_URL.contains('staging') ? 'Staging' :
                                  params.BASE_URL.contains('production') ? 'Production' : 'Local'

                    step([$class: 'XrayImportBuilder',
                        endpointName: '/junit/multipart',
                        importFilePath: 'junit-results.xml',
                        importToSameExecution: 'true',
                        projectKey: 'QA',
                        serverInstance: '4995819d-31bd-4f50-9571-da943e6d80fc',
                        importInfo: """{
                            "fields": {
                                "project": { "key": "QA" },
                                "summary": "Jenkins Build #${env.BUILD_NUMBER} — ${suite} [${testEnv}]",
                                "description": "Automated test run from Jenkins.\\nBuild: ${env.BUILD_URL}\\nAllure: ${env.BUILD_URL}allure"
                            },
                            "xpiFields": {
                                "testPlanKey": "${testPlanKey}",
                                "environments": ["${testEnv}"]
                            }
                        }""",
                        testImportInfo: """{
                            "fields": {
                                "project": { "key": "QA" }
                            }
                        }"""
                    ])
                }
            }
        }

        stage('Create Bugs for Failures') {
            when {
                expression { env.TEST_EXIT_CODE != '0' }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'jira-api-token',
                        usernameVariable: 'JIRA_USER',
                        passwordVariable: 'JIRA_TOKEN'
                    )
                ]) {
                    sh '''#!/bin/bash
                        node scripts/createBugsFromJunit.js \
                            --junit=junit-results.xml \
                            --jiraUrl=https://theromed.atlassian.net \
                            --jiraUser=$JIRA_USER \
                            --jiraToken=$JIRA_TOKEN \
                            --projectKey=KAN \
                            --buildUrl=$BUILD_URL \
                            --buildNumber=$BUILD_NUMBER
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true

            script {
                def color = currentBuild.currentResult == 'SUCCESS' ? 'good' :
                            currentBuild.currentResult == 'UNSTABLE' ? 'warning' : 'danger'

                def statusEmoji = currentBuild.currentResult == 'SUCCESS' ? ':white_check_mark:' :
                                  currentBuild.currentResult == 'UNSTABLE' ? ':warning:' : ':x:'

                slackSend(
                    color: color,
                    channel: '#test-results',
                    message: """${statusEmoji} *Juice Shop Tests — ${currentBuild.currentResult}*
Suite: `${params.TEST_SUITE ?: 'all'}`  |  Duration: ${currentBuild.durationString.replace(' and counting', '')}
<${env.BUILD_URL}allure|:bar_chart: Allure Report>  |  <${env.BUILD_URL}console|:scroll: Console Log>"""
                )
            }
        }

        failure {
            emailext(
                subject: "FAILED: Juice Shop Tests — Build #${env.BUILD_NUMBER}",
                body: """
                    <h2>Juice Shop Tests — FAILED</h2>
                    <p>Suite: <b>${params.TEST_SUITE ?: 'all'}</b></p>
                    <p>Duration: ${currentBuild.durationString}</p>
                    <p><a href="${env.BUILD_URL}allure">Open Allure Report</a></p>
                    <p><a href="${env.BUILD_URL}console">Console Output</a></p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }

        unstable {
            emailext(
                subject: "UNSTABLE: Juice Shop Tests — Build #${env.BUILD_NUMBER}",
                body: """
                    <h2>Juice Shop Tests — UNSTABLE (test failures)</h2>
                    <p>Suite: <b>${params.TEST_SUITE ?: 'all'}</b></p>
                    <p>Duration: ${currentBuild.durationString}</p>
                    <p><a href="${env.BUILD_URL}allure">Open Allure Report</a></p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }

        cleanup {
            cleanWs(patterns: [
                [pattern: 'node_modules/**', type: 'INCLUDE'],
                [pattern: 'test-results/**', type: 'INCLUDE'],
            ])
        }
    }
}
