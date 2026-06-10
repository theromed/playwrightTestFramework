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

        // ─── Jira (баг-трекер) ───
        JIRA_URL        = 'https://theromed.atlassian.net'

        // ─── GitHub (для deep-link в auto-bugs) ───
        GIT_REPO        = 'theromed/playwrightTestFramework'

        // ─── TestRail ───
        TESTRAIL_URL        = 'https://romed.testrail.io'
        TESTRAIL_PROJECT    = 'Juice Shop QA'
        TESTRAIL_PROJECT_ID = '3'
        TESTRAIL_SUITE_ID   = '7'
        TEST_ENV            = "${params.BASE_URL.contains('staging') ? 'Staging' : params.BASE_URL.contains('production') ? 'Production' : 'Local'}"
        TESTRAIL_RUN_TITLE  = "Automated Run #${env.BUILD_NUMBER} (${params.TEST_SUITE ?: 'all'}) - ${params.BASE_URL.contains('staging') ? 'Staging' : params.BASE_URL.contains('production') ? 'Production' : 'Local'}"
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

        stage('Upload to TestRail') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'testrail-creds',
                                     usernameVariable: 'TR_USER',
                                     passwordVariable: 'TR_KEY')
                ]) {
                    sh '''#!/bin/bash
                        set -e
                        python3 -m venv .venv && . .venv/bin/activate
                        pip install -q trcli
                        # parse_junit создаёт Run и проставляет статусы; матчинг по property test_id
                        trcli -y \
                          -h "$TESTRAIL_URL" \
                          -u "$TR_USER" \
                          -p "$TR_KEY" \
                          --project "$TESTRAIL_PROJECT" \
                          parse_junit \
                            --suite-id "$TESTRAIL_SUITE_ID" \
                            --title "$TESTRAIL_RUN_TITLE" \
                            --case-matcher property \
                            -f junit-results.xml
                    '''
                }
            }
        }

        stage('Create Bugs for Failures') {
            when {
                expression { env.TEST_EXIT_CODE != '0' }
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'jira-api-token',
                                     usernameVariable: 'JIRA_USER', passwordVariable: 'JIRA_TOKEN'),
                    usernamePassword(credentialsId: 'testrail-creds',
                                     usernameVariable: 'TR_USER', passwordVariable: 'TR_KEY')
                ]) {
                    sh '''#!/bin/bash
                        set -e
                        GIT_SHA=$(git rev-parse HEAD)
                        GIT_BRANCH_NAME=${GIT_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}
                        node scripts/createBugsFromJunit.js \
                            --junit=junit-results.xml \
                            --jiraUrl=$JIRA_URL \
                            --jiraUser=$JIRA_USER \
                            --jiraToken=$JIRA_TOKEN \
                            --projectKey=KAN \
                            --issueType=Task \
                            --buildUrl=$BUILD_URL \
                            --buildNumber=$BUILD_NUMBER \
                            --allureDir=allure-results \
                            --testEnv="$TEST_ENV" \
                            --branch="$GIT_BRANCH_NAME" \
                            --baseUrl="$BASE_URL" \
                            --gitRepo="$GIT_REPO" \
                            --gitSha="$GIT_SHA" \
                            --testrailUrl=$TESTRAIL_URL \
                            --testrailUser=$TR_USER \
                            --testrailKey=$TR_KEY \
                            --testrailProjectId=$TESTRAIL_PROJECT_ID \
                            --testrailSuiteId=$TESTRAIL_SUITE_ID \
                            --testrailRunTitle="$TESTRAIL_RUN_TITLE"
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
