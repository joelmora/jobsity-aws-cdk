var params = {
  Bucket: "bucket-name",
  ACL: "public-read",
  CreateBucketConfiguration: {
    LocationConstraint: "eu-east-1"
  }
};

s3.createBucket(params, function(err, data) {
  if (err) console.log(err, err.stack);
  // an error occurred
  else console.log(data); // successful response
});




