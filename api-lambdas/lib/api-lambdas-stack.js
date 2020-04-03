const path = require("path");
const cdk = require("@aws-cdk/core");
const certMng = require("@aws-cdk/aws-certificatemanager");
const lambda = require("@aws-cdk/aws-lambda");
const apigateway = require("@aws-cdk/aws-apigateway");

class ApiLambdasStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create SSL Certificate
    const certificate = new certMng.Certificate(this, "ApiLambdaSSLCertificate", {
      domainName: "*.jobsity-lnl.dns-cloud.net",
      validationMethod: certMng.ValidationMethod.DNS
    });

    //API as lambda
    const lambdaHandler = new lambda.Function(this, "LnLApiLambda", {
      functionName: "LnLApiLambda",
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambdas")),
      environment: {
        FOO: "foo"
      }
    });

    //API gateway
    const api = new apigateway.LambdaRestApi(this, "LnLRestApi", {
      restApiName: "LnLRestApi",
      handler: lambdaHandler,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"]
      },
      endpointConfiguration: { types: ["EDGE"] }
    });

    //Custom domain
    const apiDomain = new apigateway.DomainName(this, "LnLDomainName", {
      domainName: "api.jobsity-lnl.dns-cloud.net",
      certificate,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_0,
      endpointType: apigateway.EndpointType.EDGE
    });

    apiDomain.addBasePathMapping(api, "/");

    //API paths
    api.root.addResource("hello").addMethod("GET");
    api.root.addResource("date").addMethod("GET");
  }
}

module.exports = { ApiLambdasStack };
