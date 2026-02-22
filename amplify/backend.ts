import { defineBackend } from '@aws-amplify/backend'
import { Stack } from 'aws-cdk-lib'
import { Function } from 'aws-cdk-lib/aws-lambda'
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { apiMerchants } from './functions/api-merchants/resource'
import { apiPersonas } from './functions/api-personas/resource'
import { apiWidget } from './functions/api-widget/resource'
import { apiScraper } from './functions/api-scraper/resource'
import { apiAdmin } from './functions/api-admin/resource'
import { soulEngine } from './functions/soul-engine/resource'
import { apiBedrock } from './functions/api-bedrock/resource'

const backend = defineBackend({
  auth,
  data,
  apiMerchants,
  apiPersonas,
  apiWidget,
  apiScraper,
  apiAdmin,
  apiBedrock,
  soulEngine,
})

const apiStack = backend.createStack('api-stack')

const userPoolAuthorizer = new HttpUserPoolAuthorizer(
  'userPoolAuth',
  backend.auth.resources.userPool,
  {
    userPoolClients: [backend.auth.resources.userPoolClient],
  }
)

const merchantsIntegration = new HttpLambdaIntegration(
  'MerchantsLambdaIntegration',
  backend.apiMerchants.resources.lambda
)
const personasIntegration = new HttpLambdaIntegration(
  'PersonasLambdaIntegration',
  backend.apiPersonas.resources.lambda
)
const widgetIntegration = new HttpLambdaIntegration(
  'WidgetLambdaIntegration',
  backend.apiWidget.resources.lambda
)
const scraperIntegration = new HttpLambdaIntegration(
  'ScraperLambdaIntegration',
  backend.apiScraper.resources.lambda
)
const adminIntegration = new HttpLambdaIntegration(
  'AdminLambdaIntegration',
  backend.apiAdmin.resources.lambda
)
const bedrockIntegration = new HttpLambdaIntegration(
  'BedrockLambdaIntegration',
  backend.apiBedrock.resources.lambda
)

const httpApi = new HttpApi(apiStack, 'ToolstoyHttpApi', {
  apiName: 'toolstoy-api',
  corsPreflight: {
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.PUT,
      CorsHttpMethod.DELETE,
      CorsHttpMethod.OPTIONS,
    ],
    allowOrigins: ['*'],
    allowHeaders: ['Content-Type', 'Authorization'],
  },
  createDefaultStage: true,
})

httpApi.addRoutes({
  path: '/api/merchants/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: merchantsIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/merchants',
  methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.OPTIONS],
  integration: merchantsIntegration,
  authorizer: userPoolAuthorizer,
})

httpApi.addRoutes({
  path: '/api/personas/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: personasIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/personas',
  methods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.OPTIONS],
  integration: personasIntegration,
  authorizer: userPoolAuthorizer,
})

httpApi.addRoutes({
  path: '/api/widget/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: widgetIntegration,
})
httpApi.addRoutes({
  path: '/api/widget/load',
  methods: [HttpMethod.GET, HttpMethod.OPTIONS],
  integration: widgetIntegration,
})
httpApi.addRoutes({
  path: '/api/widget/chat',
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: widgetIntegration,
})

httpApi.addRoutes({
  path: '/api/scraper/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: scraperIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/scraper/extract',
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: scraperIntegration,
  authorizer: userPoolAuthorizer,
})

httpApi.addRoutes({
  path: '/api/admin/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: adminIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/admin/overview',
  methods: [HttpMethod.GET, HttpMethod.OPTIONS],
  integration: adminIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/admin/merchants',
  methods: [HttpMethod.GET, HttpMethod.OPTIONS],
  integration: adminIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/admin/alerts',
  methods: [HttpMethod.GET, HttpMethod.OPTIONS],
  integration: adminIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/admin/jobs',
  methods: [HttpMethod.GET, HttpMethod.OPTIONS],
  integration: adminIntegration,
  authorizer: userPoolAuthorizer,
})

httpApi.addRoutes({
  path: '/api/bedrock/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: bedrockIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/bedrock/generate-character',
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: bedrockIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/bedrock/generate-states',
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: bedrockIntegration,
  authorizer: userPoolAuthorizer,
})
httpApi.addRoutes({
  path: '/api/bedrock/approve-variation',
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: bedrockIntegration,
  authorizer: userPoolAuthorizer,
})

const apiPolicy = new Policy(apiStack, 'ApiPolicy', {
  statements: [
    new PolicyStatement({
      actions: ['execute-api:Invoke'],
      resources: [
        `${httpApi.arnForExecuteApi('*', '/api/*')}`,
      ],
    }),
  ],
})

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiPolicy)

// Merchants Lambda: User Pool ID + AdminDeleteUser for account deletion
const merchantsLambda = backend.apiMerchants.resources.lambda as Function
merchantsLambda.addEnvironment(
  'USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId
)
backend.apiMerchants.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['cognito-idp:AdminDeleteUser'],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
)

// Bedrock Lambda: Invoke Soul Engine Lambda
backend.apiBedrock.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: ['arn:aws:lambda:*:*:function:soul-engine'],
  })
)

// Soul Engine Lambda: Bedrock and S3 permissions
backend.soulEngine.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:*::foundation-model/amazon.titan-image-generator-v1',
      'arn:aws:bedrock:*::foundation-model/amazon.nova-canvas-v1:0'
    ]
  })
)

backend.soulEngine.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:PutObject', 's3:GetObject'],
    resources: ['arn:aws:s3:::toolstoy-character-images/*']
  })
)

// API Bedrock: Pass Soul Engine function name
const bedrockLambda = backend.apiBedrock.resources.lambda as Function
bedrockLambda.addEnvironment(
  'SOUL_ENGINE_FUNCTION_NAME',
  backend.soulEngine.resources.lambda.functionName
)

backend.addOutput({
  custom: {
    API: {
      ToolstoyApi: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: httpApi.httpApiName,
      },
    },
  },
})
