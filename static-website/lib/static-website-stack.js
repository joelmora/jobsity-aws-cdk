const cdk = require("@aws-cdk/core");
const certMng = require("@aws-cdk/aws-certificatemanager");
const s3 = require("@aws-cdk/aws-s3");
const cloudfront = require("@aws-cdk/aws-cloudfront");

class StaticWebsiteStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create SSL Certificate
    const certificate = new certMng.Certificate(this, "StaticWebsiteSSLCertificate", {
      domainName: "jobsitylnl.cloudns.cl",
      validationMethod: certMng.ValidationMethod.DNS
    });

    //s3 bucket for frontend site
    const bucket = new s3.Bucket(this, "JobsityLnLBucket", {
      bucketName: "jobsitylnl.cloudns.cl",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    //CDN to server frontend
    new cloudfront.CloudFrontWebDistribution(this, "JobsityLnLCloudFront", {
      originConfigs: [
        {
          s3OriginSource: { s3BucketSource: bucket },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: ["jobsitylnl.cloudns.cl"]
      })
    });
  }
}

module.exports = { StaticWebsiteStack };
