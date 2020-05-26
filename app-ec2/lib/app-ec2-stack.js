const cdk = require("@aws-cdk/core");
const ec2 = require("@aws-cdk/aws-ec2");
const elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
const autoscaling = require("@aws-cdk/aws-autoscaling");
const iam = require("@aws-cdk/aws-iam");
const s3 = require("@aws-cdk/aws-s3");
const dynamodb = require("@aws-cdk/aws-dynamodb");

class AppEc2Stack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    //s3 bucket with static files
    new s3.Bucket(this, "LnLEC2Bucket", {
      bucketName: "lnl-ec2-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Default VPC
    const vpc = new ec2.Vpc(this, "vpc", {
      cidr: "172.31.0.0/16",
      subnetConfiguration: [
        {
          name: "SubnetPublicTest",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 20
        }
      ],
      natGateways: 0
    });

    //dynamo table
    new dynamodb.Table(this, "Table", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: 'LnLDynamoTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Open port 22 for SSH connection from anywhere
    const securityGroupSsh = new ec2.SecurityGroup(this, "SecurityGroupSsh", {
      vpc,
      securityGroupName: "ssh-security-group",
      description: "Allow ssh access to ec2 instances from anywhere",
      allowAllOutbound: true
    });
    securityGroupSsh.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "allow public ssh access");

    //role for EC2 can access CloudWatch
    const instanceRole = new iam.Role(this, "LnLEC2InstancesRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      roleName: "LnLEC2InstancesRole"
    });

    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"],
        resources: ["*"]
      })
    );

    const ec2InitScript = ec2.UserData.custom('echo "foo"');

    //Define the type of EC2 instace and how it will scale
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, "LnLAutoScaling", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }), // get the latest Amazon Linux image
      minCapacity: 1,
      maxCapacity: 3,
      userData: ec2InitScript,
      role: instanceRole.withoutPolicyUpdates()
    });

    autoScalingGroup.addSecurityGroup(securityGroupSsh);
    autoScalingGroup.scaleOnCpuUtilization("ScaleOnCPU", {
      targetUtilizationPercent: 90
    });

    // Load balancer
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "LnLLoadBalancer", {
      vpc,
      internetFacing: true,
      loadBalancerName: "LnLLoadBalancer"
    });

    //add certificate and listen on HTTPS protocol, 80 port
    loadBalancer
      .addListener("AppListener", {
        protocol: elbv2.ApplicationProtocol.HTTP
      })
      .addTargets("AppPort", {
        targets: [autoScalingGroup],
        port: 3000,
        protocol: elbv2.ApplicationProtocol.HTTP,
        healthCheck: {
          path: "/health-check"
        }
      });
  }
}

module.exports = { AppEc2Stack };
