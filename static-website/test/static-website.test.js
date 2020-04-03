const { expect, matchTemplate, MatchStyle } = require("@aws-cdk/assert");
const cdk = require("@aws-cdk/core");
const StaticWebsite = require("../lib/static-website-stack");

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new StaticWebsite.StaticWebsiteStack(app, "MyTestStack");
  // THEN
  expect(stack).to(
    matchTemplate(
      {
        Resources: {
          StaticWebsiteSSLCertificate8461C324: {
            Type: "AWS::CertificateManager::Certificate",
            Properties: {
              DomainName: "jobsity-lnl.dns-cloud.net",
              DomainValidationOptions: [
                {
                  DomainName: "jobsity-lnl.dns-cloud.net",
                  ValidationDomain: "dns-cloud.net"
                }
              ],
              ValidationMethod: "DNS"
            }
          },
          JobsityLnLBucketA5F97B42: {
            Type: "AWS::S3::Bucket",
            Properties: {
              BucketName: "jobsity-lnl.dns-cloud.net",
              WebsiteConfiguration: {
                IndexDocument: "index.html"
              }
            },
            UpdateReplacePolicy: "Retain",
            DeletionPolicy: "Retain"
          },
          JobsityLnLBucketPolicy56BAECA1: {
            Type: "AWS::S3::BucketPolicy",
            Properties: {
              Bucket: {
                Ref: "JobsityLnLBucketA5F97B42"
              },
              PolicyDocument: {
                Statement: [
                  {
                    Action: "s3:GetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Resource: {
                      "Fn::Join": [
                        "",
                        [
                          {
                            "Fn::GetAtt": ["JobsityLnLBucketA5F97B42", "Arn"]
                          },
                          "/*"
                        ]
                      ]
                    }
                  }
                ],
                Version: "2012-10-17"
              }
            }
          },
          JobsityLnLCloudFrontCFDistribution4D3DF76E: {
            Type: "AWS::CloudFront::Distribution",
            Properties: {
              DistributionConfig: {
                Aliases: ["jobsity-lnl.dns-cloud.net"],
                DefaultCacheBehavior: {
                  AllowedMethods: ["GET", "HEAD"],
                  CachedMethods: ["GET", "HEAD"],
                  Compress: true,
                  ForwardedValues: {
                    Cookies: {
                      Forward: "none"
                    },
                    QueryString: false
                  },
                  TargetOriginId: "origin1",
                  ViewerProtocolPolicy: "redirect-to-https"
                },
                DefaultRootObject: "index.html",
                Enabled: true,
                HttpVersion: "http2",
                IPV6Enabled: true,
                Origins: [
                  {
                    DomainName: {
                      "Fn::GetAtt": ["JobsityLnLBucketA5F97B42", "RegionalDomainName"]
                    },
                    Id: "origin1",
                    S3OriginConfig: {}
                  }
                ],
                PriceClass: "PriceClass_All",
                ViewerCertificate: {
                  AcmCertificateArn: {
                    Ref: "StaticWebsiteSSLCertificate8461C324"
                  },
                  SslSupportMethod: "sni-only"
                }
              }
            }
          }
        }
      },
      MatchStyle.EXACT
    )
  );
});
